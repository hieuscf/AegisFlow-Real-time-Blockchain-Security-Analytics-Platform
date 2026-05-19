package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"

	"aegisflow/indexer/configs"
	"aegisflow/indexer/internal/blockchain"
	"aegisflow/indexer/internal/kafka"
	"aegisflow/indexer/internal/parser"
	"aegisflow/indexer/internal/subscriptions"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	cfg, err := configs.LoadConfig()
	if err != nil {
		log.Fatalf("Load config failed: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	producer := kafka.NewKafkaProducer(cfg.KafkaBrokers, cfg.KafkaTopic)
	defer func() {
		if err := producer.Close(); err != nil {
			log.Printf("Kafka producer close error: %v", err)
		}
	}()

	bcClient, err := blockchain.NewBlockchainClient(ctx, cfg.RPCWSURL)
	if err != nil {
		log.Fatalf("Blockchain client init failed: %v", err)
	}
	defer bcClient.Close()

	listener := subscriptions.NewSwapListener(bcClient, cfg.UniswapFactoryAddress)
	listener.Start(ctx)

	var procWg sync.WaitGroup
	procWg.Add(1)
	go runSwapProcessor(ctx, bcClient, listener, producer, cfg.KafkaTopic, &procWg)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Println("Shutdown signal received, stopping...")
	cancel()

	done := make(chan struct{})
	go func() {
		listener.Wait()
		procWg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(15 * time.Second):
		log.Println("Shutdown timeout exceeded, forcing exit")
	}

	listener.Close()
	log.Println("Shutdown complete")
}

func runSwapProcessor(
	ctx context.Context,
	bcClient *blockchain.BlockchainClient,
	listener *subscriptions.SwapListener,
	producer *kafka.KafkaProducer,
	topic string,
	wg *sync.WaitGroup,
) {
	defer wg.Done()

	for {
		select {
		case <-ctx.Done():
			return
		case lg, ok := <-listener.SwapLogs():
			if !ok {
				return
			}
			processSwapLog(ctx, bcClient, listener, producer, topic, lg)
		}
	}
}

func processSwapLog(
	ctx context.Context,
	bcClient *blockchain.BlockchainClient,
	listener *subscriptions.SwapListener,
	producer *kafka.KafkaProducer,
	topic string,
	lg types.Log,
) {
	log.Println("Swap event received")

	swap, err := parser.ParseSwapLog(lg)
	if err != nil {
		log.Printf("Parse swap log failed: %v", err)
		return
	}

	pairAddr := common.HexToAddress(swap.PairAddress)
	if info, ok := listener.GetPair(pairAddr); ok {
		swap.Token0 = info.Token0.Hex()
		swap.Token1 = info.Token1.Hex()
	}

	ts, err := bcClient.BlockTimestamp(ctx, swap.BlockNumber)
	if err != nil {
		log.Printf("Block timestamp lookup failed block=%d: %v", swap.BlockNumber, err)
	} else {
		swap.Timestamp = ts
	}

	payload, err := json.Marshal(swap)
	if err != nil {
		log.Printf("JSON marshal failed: %v", err)
		return
	}

	key := swap.PairAddress
	if err := producer.PublishToKafka(ctx, key, payload); err != nil {
		log.Printf("Published to Kafka failed topic=%s pair=%s err=%v", topic, key, err)
		return
	}

	log.Printf("Published to Kafka topic=%s tx=%s pair=%s", topic, swap.TxHash, swap.PairAddress)
}
