import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /AV Designer/i })).toBeInTheDocument();
  });

  it('renders the design system preview', () => {
    render(<App />);
    expect(screen.getByText(/Design system initialized/i)).toBeInTheDocument();
  });

  it('renders button variants', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Primary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Secondary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ghost/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Danger/i })).toBeInTheDocument();
  });

  it('renders status pills', () => {
    render(<App />);
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Client Review')).toBeInTheDocument();
    expect(screen.getByText('Ordered')).toBeInTheDocument();
  });
});
