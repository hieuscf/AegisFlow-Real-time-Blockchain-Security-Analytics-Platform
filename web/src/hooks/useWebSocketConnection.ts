import { useEffect } from 'react';
import { connectWebSocket } from '@/services/websocket';

export function useWebSocketConnection(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const cleanup = connectWebSocket();
    return cleanup;
  }, [enabled]);
}
