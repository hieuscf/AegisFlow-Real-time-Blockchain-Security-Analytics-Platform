import { useWebSocketStore } from '@/store/websocketStore';
import type { SecurityAlert } from '@/types/alert';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

type MessageHandler = (data: unknown) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function parseAlert(payload: unknown): SecurityAlert | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const level = record.level;
  if (level !== 'INFO' && level !== 'WARNING' && level !== 'CRITICAL') return null;
  if (
    typeof record.id !== 'string' ||
    typeof record.type !== 'string' ||
    typeof record.title !== 'string' ||
    typeof record.message !== 'string' ||
    typeof record.createdAt !== 'string'
  ) {
    return null;
  }
  return {
    id: record.id,
    level,
    type: record.type,
    title: record.title,
    message: record.message,
    tokenAddress: typeof record.tokenAddress === 'string' ? record.tokenAddress : undefined,
    contractAddress:
      typeof record.contractAddress === 'string' ? record.contractAddress : undefined,
    txHash: typeof record.txHash === 'string' ? record.txHash : undefined,
    createdAt: record.createdAt,
  };
}

function scheduleReconnect(connect: () => void): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 3000);
}

export function connectWebSocket(onMessage?: MessageHandler): () => void {
  const store = useWebSocketStore.getState();

  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
    return disconnectWebSocket;
  }

  store.setStatus('connecting');

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    useWebSocketStore.getState().markConnected();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as unknown;
      onMessage?.(data);
      const alert = parseAlert(data);
      if (alert) {
        useWebSocketStore.getState().pushAlert(alert);
      }
    } catch {
      useWebSocketStore.getState().setError('Failed to parse WebSocket message');
    }
  };

  socket.onerror = () => {
    useWebSocketStore.getState().setError('WebSocket connection error');
  };

  socket.onclose = () => {
    useWebSocketStore.getState().markDisconnected();
    socket = null;
    scheduleReconnect(() => connectWebSocket(onMessage));
  };

  return disconnectWebSocket;
}

export function disconnectWebSocket(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }
  useWebSocketStore.getState().markDisconnected();
}

export function sendWebSocketMessage(payload: unknown): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}
