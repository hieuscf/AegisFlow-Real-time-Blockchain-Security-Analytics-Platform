import { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
  room?: string;
  enabled?: boolean;
}

export function useWebSocket({ room = 'security-feed', enabled = true }: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setStatus('connecting');
    const socket = new WebSocket(`${WS_URL}?room=${encodeURIComponent(room)}`);
    socketRef.current = socket;

    socket.onopen = () => setStatus('connected');
    socket.onclose = () => setStatus('disconnected');
    socket.onerror = () => setStatus('disconnected');

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [enabled, room]);

  return { status, socket: socketRef };
}
