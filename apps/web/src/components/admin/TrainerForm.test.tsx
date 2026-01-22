import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrainerForm } from './TrainerForm';
import { vi } from 'vitest';
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
  });

  it('renders form fields', async () => {
    render(<TrainerForm />);
    // Wait for effect
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(screen.getByLabelText(/^Prénom$/i)).toBeDefined();
    expect(screen.getByLabelText(/^Nom$/i)).toBeDefined();
    expect(screen.getByLabelText(/^Email$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Créer/i })).toBeDefined();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });

    render(<TrainerForm />);

    await user.type(screen.getByLabelText(/^Prénom$/i), 'John');
    await user.type(screen.getByLabelText(/^Nom$/i), 'Doe');
    await user.type(screen.getByLabelText(/^Email$/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /Créer/i }));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            'http://api.test/admin/trainers',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('John'),
            })
        );
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/trainers');
  });

  it('fetches zones on mount', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([{ id: '1', name: 'Zone 1' }]),
    });

    render(<TrainerForm />);

    await waitFor(() => {
        expect(screen.getByText('Zone 1')).toBeDefined();
    });
  });
});
