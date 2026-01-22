import { render, screen } from '@testing-library/react';
import Home from './page';
import { vi } from 'vitest';

// Mock SearchHero
vi.mock('@/components/home/SearchHero', () => ({
  SearchHero: ({ categories }: any) => <div data-testid="search-hero">{categories.length} categories</div>,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  BadgeCheck: () => <span>Icon</span>,
  Calendar: () => <span>Icon</span>,
  GraduationCap: () => <span>Icon</span>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ([{ id: '1', name: 'Cat 1' }]),
    });
    // Mock console.error to avoid noise if fetch fails in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders correctly', async () => {
    const ui = await Home();
    render(ui);

    expect(screen.getByText(/Développez vos compétences/i)).toBeDefined();
    expect(screen.getByTestId('search-hero')).toHaveTextContent('1 categories');
    expect(screen.getByText('Expertise Garantie')).toBeDefined();
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Fetch fail'));
    const ui = await Home();
    render(ui);

    expect(screen.getByTestId('search-hero')).toHaveTextContent('0 categories');
  });
});
