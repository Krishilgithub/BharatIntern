import React, { useState } from 'react';
import useSocket from '../src/hooks/useSocket';
import useNotifications from '../src/hooks/useNotifications';
import useZoomMeeting from '../src/hooks/useZoomMeeting';
import usePresence from '../src/hooks/usePresence';
import useAIResults from '../src/hooks/useAIResults';

const mockToken = 'test-token';

export default function FeatureDemo() {
  // Chat
  const { socket, connected, emit } = useSocket(mockToken);
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState([]);
  React.useEffect(() => {
    if (!socket) return;
    const handler = (msg) => setChatLog((log) => [...log, msg]);
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [socket]);

  // Notifications
  useNotifications((payload) => alert('Notification: ' + JSON.stringify(payload)));

  // Zoom
  const { createMeeting } = useZoomMeeting(mockToken);
  const [meetingLink, setMeetingLink] = useState('');
  const handleCreateMeeting = async () => {
    try {
      const res = await createMeeting({ topic: 'Test Meeting' });
      setMeetingLink(res.join_url || 'Created!');
    } catch (e) {
      setMeetingLink('Error creating meeting');
    }
  };

  // Presence
  const { onlineUsers } = usePresence(mockToken);

  // AI Results
  const { results, fetchResults } = useAIResults(mockToken);
  const handleFetchAI = () => fetchResults('/api/ai/profile', { user_id: 'demo' });

  return (
    <div style={{ padding: 20 }}>
      <h2>Feature Demo</h2>
      <div>
        <strong>Chat:</strong>
        <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} />
        <button onClick={() => emit('chat:message', { text: chatMsg })}>Send</button>
        <div>Log: {chatLog.map((m, i) => <div key={i}>{m.text}</div>)}</div>
      </div>
      <div>
        <strong>Notifications:</strong>
        <button onClick={() => alert('Simulate notification received!')}>Test Notification</button>
      </div>
      <div>
        <strong>Zoom Meeting:</strong>
        <button onClick={handleCreateMeeting}>Create Meeting</button>
        <div>{meetingLink}</div>
      </div>
      <div>
        <strong>Presence:</strong>
        <div>Online Users: {onlineUsers.join(', ')}</div>
      </div>
      <div>
        <strong>AI Results:</strong>
        <button onClick={handleFetchAI}>Fetch AI Profile</button>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
}
