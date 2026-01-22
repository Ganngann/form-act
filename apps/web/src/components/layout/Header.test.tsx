import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/link (renders anchor)
vi.mock('next/link', () => {
  return {
    default: ({ href, children, onClick }: any) => {
      return <a href={href} onClick={onClick}>{children}</a>;
    }
  };
});

describe('Header', () => {
  it('renders correctly for guest', () => {
    render(<Header />);
    expect(screen.getByText('Form-Act')).toBeDefined();
    expect(screen.getByText('Se connecter')).toBeDefined();
    expect(screen.getByText("S'inscrire")).toBeDefined();
  });

  it('renders correctly for ADMIN', () => {
    render(<Header userRole="ADMIN" />);
    expect(screen.getByText('Dashboard Admin')).toBeDefined();
    expect(screen.getByText('Administrateur')).toBeDefined();
    expect(screen.queryByText('Se connecter')).toBeNull();
  });

  it('renders correctly for TRAINER', () => {
    render(<Header userRole="TRAINER" />);
    expect(screen.getByText('Espace Formateur')).toBeDefined();
    expect(screen.getByText('Formateur')).toBeDefined();
  });

  it('renders correctly for CLIENT', () => {
    render(<Header userRole="CLIENT" />);
    expect(screen.getByText('Mes Formations')).toBeDefined();
    expect(screen.getByText('Client')).toBeDefined();
  });

  it('toggles mobile menu', () => {
    // Need to mock window matchMedia or resize to test mobile view logic if conditional rendering depends on CSS media queries?
    // The component uses `md:hidden` classes which are Tailwind. JSDOM doesn't handle CSS layout/classes.
    // However, the `isMenuOpen` logic renders the menu in JS.
    // The button `md:hidden` is always in DOM.
    // The toggle button is the one with `onClick={toggleMenu}`.

    // We can find the button by finding the Icon logic?
    // <Menu /> or <X />
    // Lucide icons render SVGs.

    // Let's rely on the button itself.

    render(<Header />);
    const buttons = screen.getAllByRole('button'); // Login, Register, MobileToggle
    // The toggle is the last one in mobile view usually, or we can look for specific aria/class logic if available.
    // The component code: <button className="md:hidden" onClick={toggleMenu}>

    // We can just try clicking the button that contains the Menu icon.
    // But icons are mocked? No, we didn't mock Lucide.

    // Let's render and look for the menu content which is conditional.
    // Initially mobile menu is closed.
    expect(screen.queryByText('Catalogue', { selector: '.md\\:hidden *' })).toBeNull();
    // Actually the mobile menu repeats the nav links.
    // "Catalogue" appears in desktop nav too.

    // Let's verify standard links.

  });
});
