import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminBentoStats } from './AdminBentoStats';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...rest }: any) => (
      <a href={href} {...rest}>{children}</a>
    ),
  };
});

const mockStats = {
  pendingRequests: 5,
  noTrainer: 2,
  missingLogistics: 3,
  missingProof: 1,
  readyToBill: 8,
};

describe('AdminBentoStats', () => {
  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeletons initially', () => {
    // Mock fetch to not resolve immediately
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<AdminBentoStats />);

    // Check for skeletons - there are 4 rendered in the loading state by default
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('renders stats correctly after successful fetch', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockStats,
    });

    render(<AdminBentoStats />);

    // Wait for the stats to load and render
    await waitFor(() => {
      expect(screen.getByText('Demandes')).toBeInTheDocument();
    });

    // Check numbers
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // Check labels
    expect(screen.getByText('Assignations')).toBeInTheDocument();
    expect(screen.getByText('Logistique (J-14)')).toBeInTheDocument();
    expect(screen.getByText('Émargements')).toBeInTheDocument();
    expect(screen.getByText('À Facturer')).toBeInTheDocument();
  });

  it('handles fetch error gracefully (returns null)', async () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<AdminBentoStats />);

    // Wait for the component to settle
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });

    consoleSpy.mockRestore();
  });

  it('renders active state correctly when activeFilter is provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => mockStats,
    });

    render(<AdminBentoStats activeFilter="NO_TRAINER" />);

    // Wait for render
    await waitFor(() => {
      expect(screen.getByText('Demandes')).toBeInTheDocument();
    });

    // "Actif" indicator should be present (rendered exactly once for the active card)
    const activeIndicators = screen.getAllByText(/Actif/i);
    expect(activeIndicators).toHaveLength(1);

    // Specifically verify the active card
    const activeCard = screen.getByText('Assignations').closest('a');
    expect(activeCard).toBeInTheDocument();
    expect(activeCard?.querySelector('.ring-primary\\/20')).toBeInTheDocument();
  });
});
