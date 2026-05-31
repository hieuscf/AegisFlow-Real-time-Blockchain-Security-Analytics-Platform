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

  getAlerts: () => apiClient.get<AlertsResponse>('/api/alerts').then((r) => r.data),
};
