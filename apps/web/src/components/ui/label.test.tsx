import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders correctly', () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toBeDefined();
    expect(label).toHaveAttribute('for', 'email');
  });
});
