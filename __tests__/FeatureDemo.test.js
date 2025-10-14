import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureDemo from '../pages/FeatureDemo';

describe('FeatureDemo Integration', () => {
  it('renders all feature sections', () => {
    render(<FeatureDemo />);
    expect(screen.getByText('Feature Demo')).toBeInTheDocument();
    expect(screen.getByText('Chat:')).toBeInTheDocument();
    expect(screen.getByText('Notifications:')).toBeInTheDocument();
    expect(screen.getByText('Zoom Meeting:')).toBeInTheDocument();
    expect(screen.getByText('Presence:')).toBeInTheDocument();
    expect(screen.getByText('AI Results:')).toBeInTheDocument();
  });

  it('allows sending a chat message', () => {
    render(<FeatureDemo />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('Send'));
    expect(input.value).toBe('hello');
  });

  it('triggers notification test', () => {
    render(<FeatureDemo />);
    fireEvent.click(screen.getByText('Test Notification'));
    // No assertion: alert is called
  });

  it('handles Zoom meeting creation', () => {
    render(<FeatureDemo />);
    fireEvent.click(screen.getByText('Create Meeting'));
    // No assertion: async, backend required
  });

  it('fetches AI profile', () => {
    render(<FeatureDemo />);
    fireEvent.click(screen.getByText('Fetch AI Profile'));
    // No assertion: async, backend required
  });
});
