import { renderHook, act, waitFor } from "@testing-library/react";
import { useBookingLogic } from "./use-booking-logic";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch
global.fetch = vi.fn();

describe("useBookingLogic", () => {
  const formation = {
    id: "f1",
    title: "Formation 1",
    durationType: "HALF_DAY",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (global.fetch as any).mockResolvedValue({
      json: async () => [],
      ok: true,
    });
  });

  it("should handle manual booking mode correctly for HALF_DAY", async () => {
    const { result } = renderHook(() => useBookingLogic({ formation }));

    // Simulate selecting manual trainer
    act(() => {
      result.current.setSelectedTrainer("manual");
    });

    // Check availability is empty and mode is manual
    expect(result.current.selectedTrainer).toBe("manual");
    expect(result.current.availability).toEqual([]);

    // Check date selection
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    // Verify date is NOT disabled
    expect(result.current.isDateDisabled(futureDate)).toBe(false);

    act(() => {
      result.current.handleDateSelect(futureDate);
    });

    expect(result.current.selectedDate).toBe(futureDate);

    // Verify slots are available (AM/PM for HALF_DAY)
    const slots = result.current.getAvailableSlots();
    expect(slots).toEqual(["AM", "PM"]);

    // Select a slot
    act(() => {
      result.current.setSelectedSlot("AM");
    });

    expect(result.current.canBook).toBe(true);
  });

  it("should handle manual booking mode correctly for FULL_DAY", async () => {
    const fullDayFormation = { ...formation, durationType: "FULL_DAY" };
    const { result } = renderHook(() =>
      useBookingLogic({ formation: fullDayFormation }),
    );

    act(() => {
      result.current.setSelectedTrainer("manual");
    });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    expect(result.current.isDateDisabled(futureDate)).toBe(false);

    act(() => {
      result.current.handleDateSelect(futureDate);
    });

    expect(result.current.selectedDate).toBe(futureDate);
    expect(result.current.selectedSlot).toBe("ALL_DAY");
    expect(result.current.canBook).toBe(true);
  });
});
