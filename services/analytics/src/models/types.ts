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

export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

export interface SecurityAlert {
  id: string;
  level: AlertLevel;
  type: string;
  title: string;
  message: string;
  tokenAddress?: string;
  contractAddress?: string;
  pairAddress?: string;
  txHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditFinding {
  check: string;
  impact: string;
  confidence: string;
  description?: string;
}

export interface AuditResult {
  contractAddress: string;
  success: boolean;
  findings: AuditFinding[];
  risks: {
    selfdestruct: boolean;
    unlimitedMint: boolean;
    ownershipRisk: boolean;
  };
  rawOutput?: string;
  errorMessage?: string;
  completedAt: string;
}

export interface PriceUpdatePayload {
  type: "PRICE_UPDATE";
  tokenAddress: string;
  price: number;
  movingAverage: number;
  pairAddress?: string;
  txHash?: string;
  timestamp: string;
}
