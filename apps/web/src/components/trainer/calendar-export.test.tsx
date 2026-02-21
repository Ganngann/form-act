import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarExport } from './calendar-export';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('CalendarExport', () => {
  it('renders nothing when url is null', () => {
    const { container } = render(<CalendarExport url={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders input and button when url is provided', () => {
    render(<CalendarExport url="https://example.com/cal.ics" />);

    expect(screen.getByText('Export Calendrier (iCal)')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com/cal.ics');
    expect(screen.getByRole('button', { name: /Copier/i })).toBeInTheDocument();
  });

  it('copies text to clipboard and changes button state', async () => {
    vi.useFakeTimers();
    render(<CalendarExport url="https://example.com/cal.ics" />);

    const button = screen.getByRole('button', { name: /Copier/i });

    // Use act for the click since it triggers async state updates
    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/cal.ics');
    expect(screen.getByText('Copié !')).toBeInTheDocument();

    // Fast forward reset timer (2s)
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByText('Copier')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
