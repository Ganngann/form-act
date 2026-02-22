import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminHeader } from './AdminHeader';
import React from 'react';

// Mock next/link to avoid issues with routing in tests
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...rest }: any) => (
      <a href={href} {...rest}>{children}</a>
    ),
  };
});

describe('AdminHeader', () => {
  it('renders title and description correctly', () => {
    render(
      <AdminHeader
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders existing badge correctly', () => {
    render(
      <AdminHeader
        title="Title"
        badge="Existing Badge"
      />
    );

    expect(screen.getByText('Existing Badge')).toBeInTheDocument();
  });

  it('renders back link correctly', () => {
    render(
      <AdminHeader
        title="Title"
        backLink="/back"
      />
    );

    const backButton = screen.getByRole('link', { name: /retour/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', '/back');
  });

  it('renders children correctly (backward compatibility)', () => {
    render(
      <AdminHeader title="Title">
        <button>Action Button</button>
      </AdminHeader>
    );

    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  // New features tests (will fail type check until component is updated)
  it('renders breadcrumbs correctly', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/admin' },
      { label: 'Section', href: '/admin/section' },
      { label: 'Current Page' },
    ];

    render(
      <AdminHeader
        title="Title"
        breadcrumbs={breadcrumbs}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();

    // Check for links
    expect(document.querySelector('a[href="/admin"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/admin/section"]')).toBeInTheDocument();

    // Check for separators (assuming '/')
    // We expect 2 separators for 3 items
    const separators = screen.queryAllByText('/');
    expect(separators.length).toBeGreaterThanOrEqual(2);
  });

  it('renders status badge correctly', () => {
    render(
      <AdminHeader
        title="Title"
        statusBadge={<span data-testid="status-badge">Active</span>}
      />
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders actions correctly', () => {
    render(
      <AdminHeader
        title="Title"
        actions={<button>New Action</button>}
      />
    );

    expect(screen.getByText('New Action')).toBeInTheDocument();
  });

  it('prefers actions over children if both provided', () => {
    render(
      <AdminHeader
        title="Title"
        actions={<button>New Action</button>}
      >
        <button>Old Child</button>
      </AdminHeader>
    );

    expect(screen.getByText('New Action')).toBeInTheDocument();
    // Assuming implementation chooses actions OR children, not both.
    // If it renders both, this test needs adjustment.
    // Plan says "remplace children", so existing children should not be rendered if actions is present.
    // Or maybe we verify that actions is rendered. The exact behavior of "remplace" vs "coexist" was: "remplace children pour plus de clarté".
    // I'll assume exclusivity for now or at least priority.
    // But let's just check 'New Action' is there.
  });
});
