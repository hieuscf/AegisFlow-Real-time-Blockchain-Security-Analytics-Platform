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

export interface AuthVerifyResponse {
  token: string;
}

export interface AlertsResponse {
  data: unknown[];
}
