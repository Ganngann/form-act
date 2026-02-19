import { render, screen } from '@testing-library/react';
import { TrainerSidebar } from './trainer-sidebar';
import { vi, describe, it, expect } from 'vitest';

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('TrainerSidebar', () => {
  it('renders all navigation links', () => {
    mockUsePathname.mockReturnValue('/trainer');
    render(<TrainerSidebar />);

    const dashboardLink = screen.getByText('Tableau de Bord').closest('a');
    const profileLink = screen.getByText('Mon Profil').closest('a');
    const settingsLink = screen.getByText('Paramètres & Sync').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/trainer');
    expect(profileLink).toHaveAttribute('href', '/trainer/profile');
    expect(settingsLink).toHaveAttribute('href', '/trainer/settings');
  });

  it('marks Tableau de Bord as active only on exact match', () => {
    // Exact match
    mockUsePathname.mockReturnValue('/trainer');
    const { rerender } = render(<TrainerSidebar />);
    let dashboardLink = screen.getByText('Tableau de Bord').closest('a');
    expect(dashboardLink).toHaveClass('text-primary');

    // Partial match (should NOT be active because exact: true)
    mockUsePathname.mockReturnValue('/trainer/something');
    rerender(<TrainerSidebar />);
    dashboardLink = screen.getByText('Tableau de Bord').closest('a');
    expect(dashboardLink).not.toHaveClass('text-primary');
  });

  it('marks Mon Profil as active on partial match', () => {
    // Exact match
    mockUsePathname.mockReturnValue('/trainer/profile');
    const { rerender } = render(<TrainerSidebar />);
    let profileLink = screen.getByText('Mon Profil').closest('a');
    expect(profileLink).toHaveClass('text-primary');

    // Partial match (should be active because exact: false)
    mockUsePathname.mockReturnValue('/trainer/profile/edit');
    rerender(<TrainerSidebar />);
    profileLink = screen.getByText('Mon Profil').closest('a');
    expect(profileLink).toHaveClass('text-primary');
  });

  it('marks Paramètres & Sync as active on partial match', () => {
    // Exact match
    mockUsePathname.mockReturnValue('/trainer/settings');
    const { rerender } = render(<TrainerSidebar />);
    let settingsLink = screen.getByText('Paramètres & Sync').closest('a');
    expect(settingsLink).toHaveClass('text-primary');

    // Partial match (should be active because exact: false)
    mockUsePathname.mockReturnValue('/trainer/settings/sync');
    rerender(<TrainerSidebar />);
    settingsLink = screen.getByText('Paramètres & Sync').closest('a');
    expect(settingsLink).toHaveClass('text-primary');
  });

  it('renders FAQ link correctly', () => {
    mockUsePathname.mockReturnValue('/trainer');
    render(<TrainerSidebar />);
    const faqLink = screen.getByText('Accéder à la FAQ →').closest('a');
    expect(faqLink).toHaveAttribute('href', '/faq');
  });
});
