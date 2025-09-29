// src/hooks/useSocket.js
// Reusable React hook for connecting to Socket.io backend with error handling and reconnection logic
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function useSocket(authToken) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const queueRef = useRef([]); // Queue for unsent events

  useEffect(() => {
    if (!authToken) return;
    const socket = io(SOCKET_URL, {
      auth: { token: authToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      // Flush queued events
      queueRef.current.forEach(({ event, data }) => {
        socket.emit(event, data);
      });
      queueRef.current = [];
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => setError(err.message));

    return () => {
      socket.disconnect();
    };
  }, [authToken]);

  // Safe emit with queueing
  const safeEmit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      queueRef.current.push({ event, data });
    }
  };

  return { socket: socketRef.current, connected, error, emit: safeEmit };
}
