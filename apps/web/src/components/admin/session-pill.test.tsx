import { render, screen } from '@testing-library/react';
import { SessionPill } from './session-pill';

describe('SessionPill', () => {
  it('renders correctly', () => {
    const session = {
        formation: { title: 'JS' },
        trainer: { firstName: 'John', lastName: 'Doe' },
        client: { companyName: 'Acme' }
    };
    render(<SessionPill session={session} onClick={() => {}} />);
    expect(screen.getByText('Acme')).toBeDefined();
    // It renders slot
    // AM -> Matin, but default might be PM or undefined logic
    // Actually our mock didn't set slot, so it's probably undefined -> PM
    // Let's check text content of button
  });
});
