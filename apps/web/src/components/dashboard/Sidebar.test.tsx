import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Sidebar } from './Sidebar'

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname()
}));

// Mock next/link as per memory instructions
vi.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className, ...rest }: any) => (
        <a href={href} className={className} {...rest}>{children}</a>
    )
}));

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all navigation links correctly', () => {
        mockUsePathname.mockReturnValue('/dashboard');
        render(<Sidebar />);

        expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
        expect(screen.getByText("Mes Sessions")).toBeInTheDocument();
        expect(screen.getByText("Participants")).toBeInTheDocument();
        expect(screen.getByText("Paramètres")).toBeInTheDocument();

        expect(screen.getByText("Vue d'ensemble").closest('a')).toHaveAttribute('href', '/dashboard');
        expect(screen.getByText("Mes Sessions").closest('a')).toHaveAttribute('href', '/dashboard/sessions');
        expect(screen.getByText("Participants").closest('a')).toHaveAttribute('href', '/dashboard/participants');
        expect(screen.getByText("Paramètres").closest('a')).toHaveAttribute('href', '/dashboard/settings');
    });

    it('applies active styling to the current path link', () => {
        mockUsePathname.mockReturnValue('/dashboard/sessions');
        render(<Sidebar />);

        const activeLink = screen.getByText("Mes Sessions").closest('a');
        expect(activeLink).toHaveClass('bg-white');
        expect(activeLink).toHaveClass('text-primary');

        const inactiveLink = screen.getByText("Vue d'ensemble").closest('a');
        expect(inactiveLink).toHaveClass('text-muted-foreground');
        expect(inactiveLink).not.toHaveClass('bg-white');
    });
});
