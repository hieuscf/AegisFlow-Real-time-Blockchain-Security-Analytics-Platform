export type { AlertLevel, SecurityAlert, AlertFeedMeta } from './alert';
export type {
  ApiErrorBody,
  HealthResponse,
  AuthVerifyPayload,
  AuthVerifyResponse,
  AlertsResponse,
} from './api';

export type WebSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export type ThemeMode = 'dark' | 'light';
