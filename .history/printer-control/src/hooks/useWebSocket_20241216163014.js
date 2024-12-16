import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!url) return;

    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
      // Request initial status
      websocket.send(JSON.stringify({ type: 'getStatus' }));
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'status') {
          setStatus(message.data);
        }
        console.log('Received:', message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  return { connected, status, sendMessage };
}