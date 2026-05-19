package subscriptions

import (
	"context"
	"log"
	"sync"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"

	"aegisflow/indexer/internal/blockchain"
	"aegisflow/indexer/internal/parser"
)

const (
	swapLogBufferSize    = 512
	pairCreatedBuffer    = 64
	maxConcurrentPairs   = 10000
)

// PairInfo stores metadata for a discovered Uniswap V2 pair.
type PairInfo struct {
	Address common.Address
	Token0  common.Address
	Token1  common.Address
}

// SwapListener manages PairCreated discovery and per-pair Swap subscriptions.
type SwapListener struct {
	client      *blockchain.BlockchainClient
	factoryAddr common.Address

	pairsMu sync.RWMutex
	pairs   map[common.Address]PairInfo

	swapLogs chan types.Log

	wg     sync.WaitGroup
	stopMu sync.Mutex
	closed bool
}

// NewSwapListener creates a listener for factory PairCreated and pair Swap events.
func NewSwapListener(client *blockchain.BlockchainClient, factoryAddress string) *SwapListener {
	return &SwapListener{
		client:      client,
		factoryAddr: common.HexToAddress(factoryAddress),
		pairs:       make(map[common.Address]PairInfo),
		swapLogs:    make(chan types.Log, swapLogBufferSize),
	}
}

// SwapLogs returns the channel of raw Swap logs for downstream processing.
func (l *SwapListener) SwapLogs() <-chan types.Log {
	return l.swapLogs
}

// GetPair returns pair metadata if the address is known.
func (l *SwapListener) GetPair(addr common.Address) (PairInfo, bool) {
	l.pairsMu.RLock()
	defer l.pairsMu.RUnlock()
	info, ok := l.pairs[addr]
	return info, ok
}

// Start begins factory and dynamic pair subscriptions until ctx is cancelled.
func (l *SwapListener) Start(ctx context.Context) {
	l.wg.Add(1)
	go func() {
		defer l.wg.Done()
		l.runFactorySubscription(ctx)
	}()
}

// Wait blocks until all subscription goroutines have exited.
func (l *SwapListener) Wait() {
	l.wg.Wait()
}

// Close signals shutdown; subscriptions exit via context cancellation.
func (l *SwapListener) Close() {
	l.stopMu.Lock()
	l.closed = true
	l.stopMu.Unlock()
}

func (l *SwapListener) runFactorySubscription(ctx context.Context) {
	query := ethereum.FilterQuery{
		Addresses: []common.Address{l.factoryAddr},
		Topics:    [][]common.Hash{{parser.PairCreatedEventID()}},
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		logsCh := make(chan types.Log, pairCreatedBuffer)
		sub, err := l.client.SubscribeFilterLogs(ctx, query, logsCh)
		if err != nil {
			log.Printf("Factory subscription failed: %v", err)
			if reconnectErr := l.client.Reconnect(ctx); reconnectErr != nil {
				if ctx.Err() != nil {
					return
				}
				continue
			}
			continue
		}

		log.Println("Subscribed to Uniswap V2 Factory PairCreated events")

	loop:
		for {
			select {
			case <-ctx.Done():
				sub.Unsubscribe()
				return
			case err := <-sub.Err():
				if err != nil {
					log.Printf("Subscription dropped: factory PairCreated err=%v", err)
				}
				sub.Unsubscribe()
				break loop
			case lg, ok := <-logsCh:
				if !ok {
					break loop
				}
				l.handlePairCreated(ctx, lg)
			}
		}

		if ctx.Err() != nil {
			return
		}

		log.Println("Resubscribing factory PairCreated listener...")
		if err := l.client.Reconnect(ctx); err != nil && ctx.Err() != nil {
			return
		}
	}
}

func (l *SwapListener) handlePairCreated(ctx context.Context, lg types.Log) {
	created, err := parser.ParsePairCreatedLog(lg)
	if err != nil {
		log.Printf("Failed to parse PairCreated log: %v", err)
		return
	}

	if !l.registerPair(created) {
		return
	}

	log.Printf("Pair discovered: pair=%s token0=%s token1=%s", created.Pair.Hex(), created.Token0.Hex(), created.Token1.Hex())

	l.wg.Add(1)
	go func(pair PairInfo) {
		defer l.wg.Done()
		l.runPairSwapSubscription(ctx, pair)
	}(PairInfo{
		Address: created.Pair,
		Token0:  created.Token0,
		Token1:  created.Token1,
	})
}

func (l *SwapListener) registerPair(created *parser.PairCreated) bool {
	l.pairsMu.Lock()
	defer l.pairsMu.Unlock()

	if _, exists := l.pairs[created.Pair]; exists {
		return false
	}
	if len(l.pairs) >= maxConcurrentPairs {
		log.Printf("Pair registry full, skipping pair=%s", created.Pair.Hex())
		return false
	}

	l.pairs[created.Pair] = PairInfo{
		Address: created.Pair,
		Token0:  created.Token0,
		Token1:  created.Token1,
	}
	return true
}

func (l *SwapListener) runPairSwapSubscription(ctx context.Context, pair PairInfo) {
	query := ethereum.FilterQuery{
		Addresses: []common.Address{pair.Address},
		Topics:    [][]common.Hash{{parser.SwapEventID()}},
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		logsCh := make(chan types.Log, 64)
		sub, err := l.client.SubscribeFilterLogs(ctx, query, logsCh)
		if err != nil {
			log.Printf("Swap subscription failed for pair=%s: %v", pair.Address.Hex(), err)
			if reconnectErr := l.client.Reconnect(ctx); reconnectErr != nil {
				if ctx.Err() != nil {
					return
				}
			}
			continue
		}

		log.Printf("Subscribed Swap events: pair=%s", pair.Address.Hex())

	loop:
		for {
			select {
			case <-ctx.Done():
				sub.Unsubscribe()
				return
			case err := <-sub.Err():
				if err != nil {
					log.Printf("Subscription dropped: pair=%s err=%v", pair.Address.Hex(), err)
				}
				sub.Unsubscribe()
				break loop
			case lg, ok := <-logsCh:
				if !ok {
					break loop
				}
				l.enqueueSwapLog(lg)
			}
		}

		if ctx.Err() != nil {
			return
		}

		log.Printf("Resubscribing Swap listener: pair=%s", pair.Address.Hex())
		if err := l.client.Reconnect(ctx); err != nil && ctx.Err() != nil {
			return
		}
	}
}

func (l *SwapListener) enqueueSwapLog(lg types.Log) {
	select {
	case l.swapLogs <- lg:
	default:
		log.Printf("Swap log buffer full, dropping log pair=%s tx=%s", lg.Address.Hex(), lg.TxHash.Hex())
	}
}
