package kafka

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

const (
	maxPublishRetries = 3
	publishTimeout    = 10 * time.Second
	retryBaseDelay    = 1 * time.Second
)

// KafkaProducer wraps a kafka-go Writer with retry and timeout semantics.
type KafkaProducer struct {
	writer *kafka.Writer
	topic  string
}

// NewKafkaProducer creates a synchronous Kafka producer for the given brokers and topic.
func NewKafkaProducer(brokers []string, topic string) *KafkaProducer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll,
		BatchTimeout: 10 * time.Millisecond,
		// Gzip — compatible with KafkaJS (Snappy is not supported by kafkajs consumers).
		Compression: kafka.Gzip,
		Async:        false,
	}

	log.Printf("Kafka connected: brokers=%v topic=%s", brokers, topic)

	return &KafkaProducer{
		writer: writer,
		topic:  topic,
	}
}

// PublishToKafka writes a message to the configured topic with retries and a publish timeout.
func (p *KafkaProducer) PublishToKafka(ctx context.Context, key string, value []byte) error {
	msg := kafka.Message{
		Key:   []byte(key),
		Value: value,
	}

	var lastErr error
	for attempt := 1; attempt <= maxPublishRetries; attempt++ {
		publishCtx, cancel := context.WithTimeout(ctx, publishTimeout)
		err := p.writer.WriteMessages(publishCtx, msg)
		cancel()

		if err == nil {
			return nil
		}

		lastErr = err
		if attempt < maxPublishRetries {
			delay := retryBaseDelay * time.Duration(attempt)
			log.Printf("Retrying Kafka publish... attempt=%d/%d err=%v", attempt, maxPublishRetries, err)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
		}
	}

	return fmt.Errorf("kafka publish failed after %d attempts: %w", maxPublishRetries, lastErr)
}

// Close flushes and closes the underlying Kafka writer.
func (p *KafkaProducer) Close() error {
	if p.writer == nil {
		return nil
	}
	return p.writer.Close()
}

// Topic returns the configured Kafka topic name.
func (p *KafkaProducer) Topic() string {
	return p.topic
}
