import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { SessionLogisticsManager } from './session-logistics-manager';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as navigation from 'next/navigation';

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock useRouter
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const mockSession = {
  id: 'session-123',
  date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
  location: '123 Main St',
  logistics: JSON.stringify({
    wifi: 'yes',
    videoMaterial: ['Projecteur'],
    writingMaterial: [],
    subsidies: 'no',
    accessDetails: 'Code 1234',
  }),
  participants: JSON.stringify([
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  ]),
  isLogisticsOpen: false,
  status: 'CONFIRMED',
};

describe('SessionLogisticsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders read-only view correctly', () => {
    render(<SessionLogisticsManager session={mockSession} />);

    expect(screen.getByText('Lieu et Logistique')).toBeDefined();
    expect(screen.getByText('123 Main St')).toBeDefined();
    expect(screen.getByText(/Projecteur/)).toBeDefined();
    expect(screen.getByText('Code 1234')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('shows Edit button when not locked', () => {
    render(<SessionLogisticsManager session={mockSession} />);
    expect(screen.getByText('Modifier')).toBeDefined();
  });

  it('shows Locked badge when within 7 days', () => {
    const lockedSession = {
      ...mockSession,
      date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    };
    render(<SessionLogisticsManager session={lockedSession} />);
    expect(screen.queryByText('Modifier')).toBeNull();
    expect(screen.getByText(/Verrouillé/)).toBeDefined();
  });

  it('opens dialog and submits form', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    render(<SessionLogisticsManager session={mockSession} />);

    // Open dialog
    fireEvent.click(screen.getByText('Modifier'));

    // Check dialog content
    expect(screen.getByText('Modifier la logistique')).toBeDefined();

    // Modify location
    const locationInput = screen.getByLabelText('Adresse de la prestation');
    fireEvent.change(locationInput, { target: { value: 'New Address' } });

    // Modify Wifi (Radio)
    // Find the container for Wifi
    const wifiLabel = screen.getByText('Connexion Wi-Fi disponible ?');
    const wifiContainer = wifiLabel.parentElement!;
    const wifiNo = within(wifiContainer).getByLabelText('Non');
    fireEvent.click(wifiNo);

    // Add Participant
    fireEvent.click(screen.getByText('Ajouter'));
    const inputs = screen.getAllByLabelText('Prénom');
    expect(inputs.length).toBe(2); // One existing + one new

    // Fill new participant
    fireEvent.change(inputs[1], { target: { value: 'Jane' } });
    const lastNames = screen.getAllByLabelText('Nom');
    fireEvent.change(lastNames[1], { target: { value: 'Smith' } });
    const emails = screen.getAllByLabelText('Email');
    fireEvent.change(emails[1], { target: { value: 'jane@example.com' } });

    // Submit
    fireEvent.click(screen.getByText('Enregistrer les modifications'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toContain('/sessions/session-123');
    const body = JSON.parse(callArgs[1].body);

    expect(body.location).toBe('New Address');
    const logistics = JSON.parse(body.logistics);
    expect(logistics.wifi).toBe('no');

    const participants = JSON.parse(body.participants);
    expect(participants).toHaveLength(2);
    expect(participants[1].firstName).toBe('Jane');

    expect(mockRefresh).toHaveBeenCalled();
  });
});
