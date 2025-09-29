// src/hooks/useZoomMeeting.js
// Hook for creating/joining Zoom meetings via backend
import axios from 'axios';

export default function useZoomMeeting(authToken) {
  const createMeeting = async (meetingConfig) => {
    try {
      const res = await axios.post('/api/zoom/meeting', meetingConfig, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return res.data;
    } catch (err) {
      // Handle error, retry or fallback
      throw err;
    }
  };
  return { createMeeting };
}
