const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<{ status: string }>('/health'),
  verifySiwe: (payload: { message: string; signature: string }) =>
    request<{ token: string }>('/api/auth/verify', { method: 'POST', body: payload }),
  getAlerts: () => request<{ data: unknown[] }>('/api/alerts'),
};

export { API_BASE_URL };
