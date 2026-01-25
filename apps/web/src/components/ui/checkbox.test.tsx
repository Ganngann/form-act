import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './checkbox';
import { vi } from 'vitest';

describe('Checkbox', () => {
  it('renders correctly', () => {
    render(<Checkbox aria-label="agree" />);
    expect(screen.getByLabelText('agree')).toBeDefined();
  });

  it('toggles state on click', () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={handleCheckedChange} aria-label="agree" />);
    const checkbox = screen.getByLabelText('agree');
    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });
});
