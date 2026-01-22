import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from './calendar-view';
import { vi } from 'vitest';

describe('CalendarView', () => {
  it('does not render when not visible', () => {
    const { container } = render(
      <CalendarView
        isVisible={false}
        selectedDate={undefined}
        onDateSelect={vi.fn()}
        isDateDisabled={() => false}
        isHalfDay={false}
        availableSlots={[]}
        selectedSlot=""
        onSelectSlot={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when visible', () => {
    render(
      <CalendarView
        isVisible={true}
        selectedDate={undefined}
        onDateSelect={vi.fn()}
        isDateDisabled={() => false}
        isHalfDay={false}
        availableSlots={[]}
        selectedSlot=""
        onSelectSlot={vi.fn()}
      />
    );
    expect(screen.getByText('3. Choisissez une date')).toBeDefined();
  });

  it('shows slots when half day and date selected', () => {
    render(
      <CalendarView
        isVisible={true}
        selectedDate={new Date()}
        onDateSelect={vi.fn()}
        isDateDisabled={() => false}
        isHalfDay={true}
        availableSlots={['AM', 'PM']}
        selectedSlot=""
        onSelectSlot={vi.fn()}
      />
    );
    expect(screen.getByText(/Matin/i)).toBeDefined();
    expect(screen.getByText(/Après-midi/i)).toBeDefined();
  });

  it('calls onSelectSlot when slot clicked', () => {
    const onSelectSlot = vi.fn();
    render(
      <CalendarView
        isVisible={true}
        selectedDate={new Date()}
        onDateSelect={vi.fn()}
        isDateDisabled={() => false}
        isHalfDay={true}
        availableSlots={['AM']}
        selectedSlot=""
        onSelectSlot={onSelectSlot}
      />
    );
    fireEvent.click(screen.getByText(/Matin/i));
    expect(onSelectSlot).toHaveBeenCalledWith('AM');
  });
});
