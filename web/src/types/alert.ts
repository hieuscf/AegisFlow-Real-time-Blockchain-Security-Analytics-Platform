export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SecurityAlert {
  id: string;
  level: AlertLevel;
  type: string;
  title: string;
  message: string;
  tokenAddress?: string;
  contractAddress?: string;
  txHash?: string;
  createdAt: string;
}

export interface AlertFeedMeta {
  total: number;
  maxCached: number;
}
