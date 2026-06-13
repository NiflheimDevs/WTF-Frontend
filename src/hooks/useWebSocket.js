import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
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

  const connectRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      optionsRef.current.onOpen?.();
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        optionsRef.current.onMessage?.(data);
      } catch {
        optionsRef.current.onMessage?.(event.data);
      }
    };

    wsRef.current.onerror = (error) => {
      optionsRef.current.onError?.(error);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      optionsRef.current.onClose?.();

      if (optionsRef.current.reconnect !== false) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current?.();
        }, optionsRef.current.reconnectDelay || 3000);
      }
    };
  }, [url]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, lastMessage, sendMessage, disconnect, connect };
}
