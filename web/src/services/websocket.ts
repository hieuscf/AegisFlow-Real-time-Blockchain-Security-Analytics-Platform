import { io, type Socket } from 'socket.io-client';

import { useWebSocketStore } from '@/store/websocketStore';
import type { SecurityAlert } from '@/types/alert';
import type { PriceUpdatePayload } from '@/types/blockchain';

/** Must match `SECURITY_FEED_ROOM` in services/analytics. */
export const SECURITY_FEED_ROOM = 'security-feed';

const DEFAULT_SOCKET_URL = 'http://localhost:8080';

type MessageHandler = (data: unknown) => void;

let socket: Socket | null = null;
let connectionRefCount = 0;

function resolveSocketUrl(raw: string | undefined): string {
  const fallback =
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_SOCKET_URL;
  const url = (raw?.trim() || fallback).replace(/\/$/, '');

  if (url.startsWith('ws://')) {
    return `http://${url.slice(5)}`;
  }
  if (url.startsWith('wss://')) {
    return `https://${url.slice(6)}`;
  }
  return url;
}

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

function parsePriceUpdate(payload: unknown): PriceUpdatePayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (record.type !== 'PRICE_UPDATE') return null;
  if (typeof record.tokenAddress !== 'string' || typeof record.timestamp !== 'string') {
    return null;
  }
  const price = record.price;
  const movingAverage = record.movingAverage;
  if (typeof price !== 'number' || typeof movingAverage !== 'number') return null;

  return {
    type: 'PRICE_UPDATE',
    tokenAddress: record.tokenAddress,
    price,
    movingAverage,
    pairAddress: typeof record.pairAddress === 'string' ? record.pairAddress : undefined,
    txHash: typeof record.txHash === 'string' ? record.txHash : undefined,
    timestamp: record.timestamp,
  };
}

function handleAlert(payload: unknown, onMessage?: MessageHandler): void {
  onMessage?.(payload);
  const alert = parseAlert(payload);
  if (alert) {
    useWebSocketStore.getState().pushAlert(alert);
  }
}

function handlePriceUpdate(payload: unknown, onMessage?: MessageHandler): void {
  onMessage?.(payload);
  const update = parsePriceUpdate(payload);
  if (update) {
    useWebSocketStore.getState().pushPriceUpdate(update);
  }
}

function bindSocketHandlers(activeSocket: Socket, onMessage?: MessageHandler): void {
  activeSocket.on('connect', () => {
    useWebSocketStore.getState().markConnected();
  });

  activeSocket.on('disconnect', () => {
    useWebSocketStore.getState().markDisconnected();
  });

  activeSocket.on('connect_error', (err) => {
    useWebSocketStore.getState().setError(err.message || 'Socket.IO connection error');
  });

  activeSocket.on('alert', (payload: unknown) => {
    handleAlert(payload, onMessage);
  });

  activeSocket.on('security-alert', (payload: unknown) => {
    handleAlert(payload, onMessage);
  });

  activeSocket.on('price-update', (payload: unknown) => {
    handlePriceUpdate(payload, onMessage);
  });
}

function releaseWebSocketConnection(): void {
  connectionRefCount = Math.max(0, connectionRefCount - 1);
  if (connectionRefCount > 0) {
    return;
  }

  if (!socket) {
    useWebSocketStore.getState().markDisconnected();
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  useWebSocketStore.getState().markDisconnected();
}

export function connectWebSocket(onMessage?: MessageHandler): () => void {
  const store = useWebSocketStore.getState();
  connectionRefCount += 1;

  if (socket?.connected) {
    return releaseWebSocketConnection;
  }

  if (socket) {
    socket.connect();
    return releaseWebSocketConnection;
  }

  store.setStatus('connecting');

  const url = resolveSocketUrl(import.meta.env.VITE_WS_URL);

  socket = io(url, {
    path: '/socket.io',
    transports: ['websocket'],
    query: { room: SECURITY_FEED_ROOM },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 3000,
    autoConnect: true,
  });

  bindSocketHandlers(socket, onMessage);

  return releaseWebSocketConnection;
}

/** @deprecated Prefer connectWebSocket cleanup; kept for explicit teardown */
export function disconnectWebSocket(): void {
  connectionRefCount = 0;
  releaseWebSocketConnection();
}

export function sendWebSocketMessage(event: string, payload?: unknown): void {
  if (socket?.connected) {
    socket.emit(event, payload);
  }
}

export function getSocket(): Socket | null {
  return socket;
}
