import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      options.onOpen?.();
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        options.onMessage?.(data);
      } catch {
        options.onMessage?.(event.data);
      }
    };

    wsRef.current.onerror = (error) => {
      options.onError?.(error);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      options.onClose?.();

      if (options.reconnect !== false) {
        reconnectTimeoutRef.current = setTimeout(
          connect,
          options.reconnectDelay || 3000,
        );
      }
    };
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        typeof data === "string" ? data : JSON.stringify(data),
      );
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, lastMessage, sendMessage, disconnect, connect };
}
