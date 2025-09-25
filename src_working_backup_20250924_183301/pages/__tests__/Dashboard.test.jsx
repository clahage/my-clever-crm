import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  it('renders the onboarding/help banner', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome to SpeedyCRM!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Need Help/i })).toBeInTheDocument();
  });

  it('renders the AI Assistant button', () => {
    render(<Dashboard />);
    expect(screen.getByRole('button', { name: /Ask Taylor/i })).toBeInTheDocument();
  });
});
