export interface ApiErrorBody {
  message: string;
  code?: string;
}

export interface HealthResponse {
  status: string;
}

export interface AuthVerifyPayload {
  message: string;
  signature: string;
}

export interface AuthNonceResponse {
  nonce: string;
  message: string;
  address: string;
}

export interface AuthVerifyResponse {
  token: string;
  address: string;
}

/** @deprecated Use NotificationListResponse from @/types/notification */
export interface AlertsResponse {
  data: unknown[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
    source: string;
  };
}
