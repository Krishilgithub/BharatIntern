// src/hooks/useNotifications.js
// Hook for Firebase Cloud Messaging notifications
import { useEffect, useRef } from 'react';

export default function useNotifications(onMessage) {
  const messagingRef = useRef(null);

  useEffect(() => {
    let messaging;
    async function init() {
      if (typeof window === 'undefined' || !window.firebase) return;
      try {
        messaging = window.firebase.messaging();
        messagingRef.current = messaging;
        messaging.onMessage((payload) => {
          if (onMessage) onMessage(payload);
        });
      } catch (e) {
        // Handle errors
      }
    }
    init();
    return () => {
      // Cleanup if needed
    };
  }, [onMessage]);

  return messagingRef.current;
}
