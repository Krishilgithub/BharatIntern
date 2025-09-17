import React from 'react';
import { render, screen } from '@testing-library/react';

describe('sanity', () => {
  it('runs a simple test', () => {
    render(<div>ok</div>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});

