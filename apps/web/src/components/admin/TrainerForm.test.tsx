import { render, screen, waitFor } from '@testing-library/react';
import { TrainerForm } from './TrainerForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
  }),
}));

// Mock API_URL
vi.mock('@/lib/config', () => ({
  API_URL: 'http://api.test',
}));

describe('TrainerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  it('renders correctly for creation', async () => {
    render(<TrainerForm />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /Créer/i })).toBeDefined();
  });

  it('renders correctly for edit mode', async () => {
    const trainer = { id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.com' };
    render(<TrainerForm initialData={trainer} isEdit={true} />);
    expect(screen.getByDisplayValue('Jane')).toBeDefined();
    expect(screen.getByRole('button', { name: /Mettre à jour/i })).toBeDefined();
  });

  it('submits PATCH when isEdit is true', async () => {
    const user = userEvent.setup();
    const trainer = { id: '1', firstName: 'Jane', lastName: 'Smith', email: 'jane@smith.com' };
    render(<TrainerForm initialData={trainer} isEdit={true} />);

    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.test/admin/trainers/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('handles submission error from API', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ([]) }); // zones fetch
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already exists' }),
    });

    render(<TrainerForm />);

    await user.type(screen.getByLabelText(/^Prénom$/i), 'John');
    await user.type(screen.getByLabelText(/^Nom$/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@doe.com');
    await user.click(screen.getByRole('button', { name: /Créer/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeDefined();
    });
  });

  it('logic: checking predilection zone also checks expertise zone', async () => {
    const user = userEvent.setup();
    const zones = [{ id: 'z1', name: 'Wallonie', code: 'WAL' }];
    (global.fetch as any).mockResolvedValue({ ok: true, json: async () => zones });

    render(<TrainerForm />);

    await user.click(screen.getByText(/Zones & Expertise/i));

    const checkboxes = await screen.findAllByRole('checkbox');
    // First is predilection, second is expertise
    await user.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[1]).toBeDisabled();
  });
});
