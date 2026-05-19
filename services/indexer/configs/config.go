package configs

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

const (
	defaultKafkaBrokers = "localhost:9092"
	defaultKafkaTopic   = "market-swaps"
)

// Config holds runtime configuration for the indexer service.
type Config struct {
	KafkaBrokers          []string
	KafkaTopic            string
	RPCWSURL              string
	UniswapFactoryAddress string
}

// LoadConfig reads environment variables from .env (if present) and the process environment.
func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	brokersRaw := envOrDefault("KAFKA_BROKERS", defaultKafkaBrokers)
	brokers := splitBrokers(brokersRaw)
	if len(brokers) == 0 {
		return nil, fmt.Errorf("KAFKA_BROKERS must contain at least one broker")
	}

	topic := envOrDefault("KAFKA_TOPIC", defaultKafkaTopic)
	wsURL := strings.TrimSpace(os.Getenv("RPC_WS_URL"))
	if wsURL == "" {
		return nil, fmt.Errorf("RPC_WS_URL is required")
	}

	factory := strings.TrimSpace(os.Getenv("UNISWAP_FACTORY_ADDRESS"))
	if factory == "" {
		return nil, fmt.Errorf("UNISWAP_FACTORY_ADDRESS is required")
	}

	return &Config{
		KafkaBrokers:          brokers,
		KafkaTopic:            topic,
		RPCWSURL:              wsURL,
		UniswapFactoryAddress: factory,
	}, nil
}

func envOrDefault(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func splitBrokers(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
