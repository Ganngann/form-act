import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders localized status for PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('En attente')).toBeDefined();
  });

  it('applies correct styles for PENDING', () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('applies correct styles for CONFIRMED', () => {
    const { container } = render(<StatusBadge status="CONFIRMED" />);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('applies correct styles for COMPLETED', () => {
    const { container } = render(<StatusBadge status="COMPLETED" />);
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('applies correct styles for CANCELLED', () => {
    const { container } = render(<StatusBadge status="CANCELLED" />);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('applies correct styles for PROOF_RECEIVED', () => {
    const { container } = render(<StatusBadge status="PROOF_RECEIVED" />);
    expect(container.firstChild).toHaveClass('bg-indigo-50');
  });

  it('handles unknown status gracefully', () => {
    // @ts-ignore
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeDefined();
  });
});
