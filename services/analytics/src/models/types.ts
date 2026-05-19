/**
 * SwapEvent matches the JSON payload published by the Go Indexer to Kafka topic market-swaps.
 */
export interface SwapEvent {
  txHash: string;
  pairAddress: string;
  token0: string;
  token1: string;
  sender: string;
  amount0In: string;
  amount1In: string;
  amount0Out: string;
  amount1Out: string;
  blockNumber: number;
  timestamp: number;
}
