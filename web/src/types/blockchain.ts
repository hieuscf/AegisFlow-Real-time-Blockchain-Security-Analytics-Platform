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

export interface TokenPriceUpdate {
  tokenAddress: string;
  symbol?: string;
  price: number;
  changePercent24h?: number;
  updatedAt: string;
}

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
