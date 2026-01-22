import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';
import { vi } from 'vitest';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDefined();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders variants correctly', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('renders sizes correctly', () => {
    const { container } = render(<Button size="lg">Big</Button>);
    expect(container.firstChild).toHaveClass('h-11');
  });

  it('renders asChild', () => {
    const { container } = render(
      <Button asChild>
        <a href="/link">Link</a>
      </Button>
    );
    expect(container.querySelector('a')).toBeDefined();
    expect(container.querySelector('button')).toBeNull();
  });
});
