package blockchain

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

const defaultReconnectInterval = 5 * time.Second

// BlockchainClient manages a WebSocket-backed ethclient with auto-reconnect.
type BlockchainClient struct {
	mu                sync.RWMutex
	client            *ethclient.Client
	wsURL             string
	reconnectInterval time.Duration
	blockTimeCache    map[uint64]uint64
	blockTimeMu       sync.RWMutex
}

// NewBlockchainClient dials the Ethereum WebSocket RPC endpoint.
func NewBlockchainClient(ctx context.Context, wsURL string) (*BlockchainClient, error) {
	bc := &BlockchainClient{
		wsURL:             wsURL,
		reconnectInterval: defaultReconnectInterval,
		blockTimeCache:    make(map[uint64]uint64),
	}

	if err := bc.connect(ctx); err != nil {
		return nil, err
	}

	log.Println("Ethereum connected")
	return bc, nil
}

func (bc *BlockchainClient) connect(ctx context.Context) error {
	client, err := ethclient.DialContext(ctx, bc.wsURL)
	if err != nil {
		return fmt.Errorf("dial ethereum websocket: %w", err)
	}

	bc.mu.Lock()
	if bc.client != nil {
		bc.client.Close()
	}
	bc.client = client
	bc.mu.Unlock()

	return nil
}

// Client returns the underlying ethclient, reconnecting when necessary.
func (bc *BlockchainClient) Client(ctx context.Context) (*ethclient.Client, error) {
	bc.mu.RLock()
	if bc.client != nil {
		c := bc.client
		bc.mu.RUnlock()
		return c, nil
	}
	bc.mu.RUnlock()

	if err := bc.Reconnect(ctx); err != nil {
		return nil, err
	}

	bc.mu.RLock()
	defer bc.mu.RUnlock()
	if bc.client == nil {
		return nil, fmt.Errorf("ethereum client unavailable")
	}
	return bc.client, nil
}

// Reconnect attempts to re-establish the WebSocket connection with fixed-interval retries.
func (bc *BlockchainClient) Reconnect(ctx context.Context) error {
	log.Println("Ethereum WS disconnected")
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		log.Printf("Reconnecting in %s...", bc.reconnectInterval)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(bc.reconnectInterval):
		}

		if err := bc.connect(ctx); err != nil {
			log.Printf("Reconnect failed: %v", err)
			continue
		}

		log.Println("Reconnected successfully")
		return nil
	}
}

// SubscribeFilterLogs creates a log subscription using the current client.
func (bc *BlockchainClient) SubscribeFilterLogs(ctx context.Context, q ethereum.FilterQuery, ch chan<- types.Log) (ethereum.Subscription, error) {
	client, err := bc.Client(ctx)
	if err != nil {
		return nil, err
	}
	return client.SubscribeFilterLogs(ctx, q, ch)
}

// BlockTimestamp returns the block timestamp (unix seconds) with an in-memory cache.
func (bc *BlockchainClient) BlockTimestamp(ctx context.Context, blockNumber uint64) (uint64, error) {
	bc.blockTimeMu.RLock()
	if ts, ok := bc.blockTimeCache[blockNumber]; ok {
		bc.blockTimeMu.RUnlock()
		return ts, nil
	}
	bc.blockTimeMu.RUnlock()

	client, err := bc.Client(ctx)
	if err != nil {
		return 0, err
	}

	header, err := client.HeaderByNumber(ctx, new(big.Int).SetUint64(blockNumber))
	if err != nil {
		return 0, fmt.Errorf("fetch block header %d: %w", blockNumber, err)
	}

	ts := header.Time
	bc.blockTimeMu.Lock()
	bc.blockTimeCache[blockNumber] = ts
	if len(bc.blockTimeCache) > 2048 {
		for k := range bc.blockTimeCache {
			delete(bc.blockTimeCache, k)
			break
		}
	}
	bc.blockTimeMu.Unlock()

	return ts, nil
}

// Close closes the underlying ethclient connection.
func (bc *BlockchainClient) Close() {
	bc.mu.Lock()
	defer bc.mu.Unlock()
	if bc.client != nil {
		bc.client.Close()
		bc.client = nil
	}
}
