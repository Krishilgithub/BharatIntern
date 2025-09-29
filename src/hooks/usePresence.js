// src/hooks/usePresence.js
// Hook for tracking user presence via Socket.io
import { useEffect, useState } from 'react';
import useSocket from './useSocket';

export default function usePresence(authToken) {
  const { socket, connected } = useSocket(authToken);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const handleOnline = (data) => {
      setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
    };
    const handleOffline = (data) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    };
    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);
    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
    };
  }, [socket]);

  return { onlineUsers, connected };
}
