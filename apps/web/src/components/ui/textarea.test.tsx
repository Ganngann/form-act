import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './textarea';
import { vi } from 'vitest';

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeDefined();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
