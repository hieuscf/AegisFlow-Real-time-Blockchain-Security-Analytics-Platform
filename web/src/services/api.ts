import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import type {
  AlertsResponse,
  ApiErrorBody,
  AuthNonceResponse,
  AuthVerifyPayload,
  AuthVerifyResponse,
  HealthResponse,
} from '@/types/api';
import type {
  NotificationDetailResponse,
  NotificationListParams,
  NotificationListResponse,
  NotificationStatsResponse,
} from '@/types/notification';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const api = {
  getHealth: () => apiClient.get<HealthResponse>('/health').then((r) => r.data),

  getAuthNonce: (address: string) =>
    apiClient
      .get<AuthNonceResponse>('/api/auth/nonce', { params: { address } })
      .then((r) => r.data),

  verifySiwe: (payload: AuthVerifyPayload) =>
    apiClient
      .post<AuthVerifyResponse>('/api/auth/verify', payload)
      .then((r) => r.data),

  /** @deprecated Use getNotifications */
  getAlerts: () => apiClient.get<AlertsResponse>('/api/alerts').then((r) => r.data),

  getNotifications: (params?: NotificationListParams) =>
    apiClient
      .get<NotificationListResponse>('/api/notifications', { params })
      .then((r) => r.data),

  getNotificationStats: () =>
    apiClient
      .get<NotificationStatsResponse>('/api/notifications/stats')
      .then((r) => r.data),

  getNotification: (id: string) =>
    apiClient
      .get<NotificationDetailResponse>(`/api/notifications/${id}`)
      .then((r) => r.data),
};
