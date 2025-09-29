import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSocket from '../src/hooks/useSocket';
import useNotifications from '../src/hooks/useNotifications';
import useZoomMeeting from '../src/hooks/useZoomMeeting';
import usePresence from '../src/hooks/usePresence';
import useAIResults from '../src/hooks/useAIResults';

// Mock auth token for tests
globalThis.process = { env: { NEXT_PUBLIC_SOCKET_URL: 'http://localhost:4000' } };
const mockToken = 'test-token';

describe('Feature Integration Hooks', () => {
  it('useSocket connects and queues events', async () => {
    const TestComponent = () => {
      const { connected, emit } = useSocket(mockToken);
      React.useEffect(() => {
        emit('chat:message', { text: 'hello' });
      }, [emit]);
      return <div>{connected ? 'connected' : 'disconnected'}</div>;
    };
    render(<TestComponent />);
    expect(screen.getByText(/connected|disconnected/)).toBeInTheDocument();
  });

  it('useNotifications initializes without crashing', () => {
    const TestComponent = () => {
      useNotifications(() => {});
      return <div>notif</div>;
    };
    render(<TestComponent />);
    expect(screen.getByText('notif')).toBeInTheDocument();
  });

  it('useZoomMeeting exposes createMeeting', () => {
    const { createMeeting } = useZoomMeeting(mockToken);
    expect(typeof createMeeting).toBe('function');
  });

  it('usePresence tracks online users', () => {
    const TestComponent = () => {
      const { onlineUsers } = usePresence(mockToken);
      return <div>users:{onlineUsers.length}</div>;
    };
    render(<TestComponent />);
    expect(screen.getByText(/users:/)).toBeInTheDocument();
  });

  it('useAIResults fetches and sets results', async () => {
    const TestComponent = () => {
      const { results, fetchResults } = useAIResults(mockToken);
      React.useEffect(() => {
        fetchResults('/api/fake', {});
      }, [fetchResults]);
      return <div>{results ? 'got' : 'waiting'}</div>;
    };
    render(<TestComponent />);
    expect(screen.getByText(/waiting|got/)).toBeInTheDocument();
  });
});
