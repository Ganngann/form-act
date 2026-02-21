import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import CatalogueContent from './CatalogueContent';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams('');

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/catalogue',
}));

describe('CatalogueContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });
  });

  it('renders correctly', async () => {
    render(<CatalogueContent />);
    expect(screen.getByText(/Développez vos/i)).toBeDefined();
    expect(screen.getByPlaceholderText('Rechercher une formation...')).toBeDefined();
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('fetches categories and formations', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id: '1', name: 'Cat 1' }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id: '1', title: 'Formation 1', description: 'Desc', duration: '2j' }]),
      });

    render(<CatalogueContent />);

    await waitFor(() => {
      expect(screen.getByText('Formation 1')).toBeDefined();
    });
  });

  it('fetches with search param when provided in URL', async () => {
    mockSearchParams = new URLSearchParams('search=Nest');
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: async () => ([]), // categories
      })
      .mockResolvedValueOnce({ // formations
        json: async () => ([{ id: '1', title: 'NestJS Intro' }]),
      });

    render(<CatalogueContent />);

    await waitFor(() => {
      const calls = (global.fetch as any).mock.calls;
      const formationCall = calls.find((call: any) => call[0].includes('/formations'));
      expect(formationCall[0]).toContain('search=Nest');
    });
  });

  it('updates URL when search input changes (debounced)', async () => {
    vi.useFakeTimers();
    (global.fetch as any).mockResolvedValue({ json: async () => ([]) });

    render(<CatalogueContent />);

    const input = screen.getByPlaceholderText('Rechercher une formation...');
    fireEvent.change(input, { target: { value: 'React' } });

    // Fast forward debounce (component uses 500ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockPush).toHaveBeenCalledWith('/catalogue?search=React');
    vi.useRealTimers();
  });

  it('shows empty state when no results', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });

    render(<CatalogueContent />);

    // Wait for the empty state to appear - increased timeout just in case
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).toBeNull(); // If there was a loader
      expect(screen.getByText('Aucun résultat trouvé')).toBeDefined();
    }, { timeout: 2000 });

    const resetBtn = screen.getByText('Réinitialiser les filtres');
    await act(async () => {
      fireEvent.click(resetBtn);
    });
    expect(mockPush).toHaveBeenCalled();
  });
});
