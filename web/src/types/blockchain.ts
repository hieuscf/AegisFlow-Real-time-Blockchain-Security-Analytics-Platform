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

/** Matches analytics `PriceUpdatePayload` from Socket.IO `price-update` events. */
export interface PriceUpdatePayload {
  type: 'PRICE_UPDATE';
  tokenAddress: string;
  price: number;
  movingAverage: number;
  pairAddress?: string;
  txHash?: string;
  timestamp: string;
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
