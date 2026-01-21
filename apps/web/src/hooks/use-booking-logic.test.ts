import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBookingLogic } from './use-booking-logic';

// Mock config to avoid issues if it's not set
vi.mock('@/lib/config', () => ({
  API_URL: 'http://test-api.com',
}));

describe('useBookingLogic', () => {
  const mockFormation = {
    id: 'f1',
    title: 'Test Formation',
    durationType: 'HALF_DAY',
  };

  const mockZones = [{ id: 'z1', name: 'Zone 1' }];
  const mockTrainers = [{ id: 't1', firstName: 'John', lastName: 'Doe' }];
  const mockAvailability = [
    { date: '2024-01-20', slot: 'AM', status: 'CONFIRMED' },
  ];

  beforeEach(() => {
    // Only mock Date, keep setTimeout/setInterval real for waitFor to work
    vi.useFakeTimers({
      toFake: ['Date'],
    });
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

    // Reset fetch mock
    global.fetch = vi.fn((url) => {
      if (url.toString().includes('/zones')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockZones),
        } as Response);
      }
      if (url.toString().includes('/dispatcher/trainers')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTrainers),
        } as Response);
      }
      if (url.toString().includes('/availability')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockAvailability),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should fetch zones on mount', async () => {
    const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

    expect(result.current.loadingZones).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingZones).toBe(false);
    });

    expect(result.current.zones).toEqual(mockZones);
    expect(global.fetch).toHaveBeenCalledWith('http://test-api.com/zones');
  });

  it('should fetch trainers when zone is selected', async () => {
    const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

    await waitFor(() => expect(result.current.loadingZones).toBe(false));

    act(() => {
      result.current.setSelectedZone('z1');
    });

    expect(result.current.loadingTrainers).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingTrainers).toBe(false);
    });

    expect(result.current.trainers).toEqual(mockTrainers);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/dispatcher/trainers?zoneId=z1'));
  });

  it('should fetch availability when trainer is selected', async () => {
    const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

    await waitFor(() => expect(result.current.loadingZones).toBe(false));

    act(() => {
      result.current.setSelectedZone('z1');
    });
    await waitFor(() => expect(result.current.loadingTrainers).toBe(false));

    act(() => {
      result.current.setSelectedTrainer('t1');
    });

    expect(result.current.loadingAvailability).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingAvailability).toBe(false);
    });

    expect(result.current.availability).toEqual(mockAvailability);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/trainers/t1/availability'));
  });

  describe('isDateDisabled', () => {
    it('should disable past dates', async () => {
      const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));
      await waitFor(() => expect(result.current.loadingZones).toBe(false));

      const pastDate = new Date('2023-12-31');
      expect(result.current.isDateDisabled(pastDate)).toBe(true);
    });

    it('should not disable future empty dates', async () => {
      const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));
      await waitFor(() => expect(result.current.loadingZones).toBe(false));

      // We need to simulate availability loaded (even if empty) for logical consistency,
      // though the function uses current state.
      const futureDate = new Date('2024-01-25'); // No availability in mock
      expect(result.current.isDateDisabled(futureDate)).toBe(false);
    });

    it('should disable date if formation is FULL_DAY and any slot is taken', async () => {
        const fullDayFormation = { ...mockFormation, durationType: 'FULL_DAY' };
        const { result } = renderHook(() => useBookingLogic({ formation: fullDayFormation }));

        // Populate availability manually via mock trigger?
        // Better: Wait for availability to load.
        act(() => {
          result.current.setSelectedZone('z1');
        });
        await waitFor(() => expect(result.current.loadingTrainers).toBe(false));
        act(() => {
            result.current.setSelectedTrainer('t1');
        });
        await waitFor(() => expect(result.current.loadingAvailability).toBe(false));

        // 2024-01-20 has AM taken.
        const date = new Date('2024-01-20');
        expect(result.current.isDateDisabled(date)).toBe(true);
    });

    it('should allow date if formation is HALF_DAY and only one slot is taken', async () => {
        const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

        act(() => { result.current.setSelectedZone('z1'); });
        await waitFor(() => expect(result.current.loadingTrainers).toBe(false));
        act(() => { result.current.setSelectedTrainer('t1'); });
        await waitFor(() => expect(result.current.loadingAvailability).toBe(false));

        // 2024-01-20 has AM taken, but PM is free
        const date = new Date('2024-01-20');
        expect(result.current.isDateDisabled(date)).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
      it('should return available slots for selected date', async () => {
        const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

        act(() => { result.current.setSelectedZone('z1'); });
        await waitFor(() => expect(result.current.loadingTrainers).toBe(false));
        act(() => { result.current.setSelectedTrainer('t1'); });
        await waitFor(() => expect(result.current.loadingAvailability).toBe(false));

        act(() => {
            result.current.handleDateSelect(new Date('2024-01-20'));
        });

        const slots = result.current.getAvailableSlots();
        // AM is taken in mockAvailability
        expect(slots).toEqual(['PM']);
      });

      it('should return all slots if date is empty', async () => {
        const { result } = renderHook(() => useBookingLogic({ formation: mockFormation }));

        act(() => { result.current.setSelectedZone('z1'); });
        await waitFor(() => expect(result.current.loadingTrainers).toBe(false));
        act(() => { result.current.setSelectedTrainer('t1'); });
        await waitFor(() => expect(result.current.loadingAvailability).toBe(false));

        act(() => {
            result.current.handleDateSelect(new Date('2024-01-25'));
        });

        const slots = result.current.getAvailableSlots();
        expect(slots).toEqual(['AM', 'PM']);
      });
  });
});
