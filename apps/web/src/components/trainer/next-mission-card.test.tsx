import { render, screen } from '@testing-library/react';
import { NextMissionCard } from './next-mission-card';
import { vi } from 'vitest';

describe('NextMissionCard', () => {
  const mission = {
    id: '1',
    date: '2023-01-01',
    slot: 'AM',
    location: 'Brussels',
    formation: { title: 'JS Training' },
    client: { companyName: 'Acme', address: 'Rue 1' },
  };

  it('renders correctly', () => {
    render(<NextMissionCard mission={mission} />);
    expect(screen.getByText('JS Training')).toBeDefined();
    expect(screen.getByText('Acme')).toBeDefined();
    expect(screen.getByText(/Matin/)).toBeDefined();
    expect(screen.getByText('Brussels')).toBeDefined();
  });

  it('handles null mission', () => {
    const { container } = render(<NextMissionCard mission={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('generates correct maps url', () => {
    render(<NextMissionCard mission={mission} />);
    const link = screen.getByText('Y aller (GPS)').closest('a');
    expect(link).toHaveAttribute('href', expect.stringContaining('Brussels'));
  });
});
