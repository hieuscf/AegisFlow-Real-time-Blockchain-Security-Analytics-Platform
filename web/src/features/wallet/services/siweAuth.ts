import { apiClient } from '@/services/api';
import type { SiweNonceResponse, SiweVerifyResponse } from '@/features/wallet/types';

export async function requestSiweNonce(address: string): Promise<SiweNonceResponse> {
  const { data } = await apiClient.get<SiweNonceResponse>('/api/auth/nonce', {
    params: { address },
  });
  return data;
}

export async function verifySiweLogin(
  message: string,
  signature: string,
): Promise<SiweVerifyResponse> {
  const { data } = await apiClient.post<SiweVerifyResponse>('/api/auth/verify', {
    message,
    signature,
  });
  return data;
}
