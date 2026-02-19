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
    isExpertise: false,
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
    const { result } = renderHook(() => useBookingLogic({ formation: fullDayFormation }));

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

  it("should automatically select trainer if only one is returned", async () => {
    const singleTrainer = [{ id: "t1", firstName: "John", lastName: "Doe" }];

    // Mock fetch for zones first (initial load)
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/zones")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "z1", name: "Zone 1" }],
        });
      }
      if (url.includes("/dispatcher/trainers")) {
        return Promise.resolve({
          ok: true,
          json: async () => singleTrainer,
        });
      }
      // Mock availability call that happens after auto-selection
      if (url.includes("/trainers/t1/availability")) {
          return Promise.resolve({
              ok: true,
              json: async () => [],
          });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    const { result } = renderHook(() => useBookingLogic({ formation }));

    // Select zone to trigger trainer fetch
    await act(async () => {
      result.current.setSelectedZone("z1");
    });

    // Wait for the effect to run and update state
    await waitFor(() => {
        expect(result.current.trainers).toEqual(singleTrainer);
    });

    // Check if trainer is automatically selected
    expect(result.current.selectedTrainer).toBe("t1");
  });

  it("should NOT automatically select trainer if multiple are returned", async () => {
    const multipleTrainers = [
        { id: "t1", firstName: "John", lastName: "Doe" },
        { id: "t2", firstName: "Jane", lastName: "Doe" }
    ];

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/zones")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "z1", name: "Zone 1" }],
        });
      }
      if (url.includes("/dispatcher/trainers")) {
        return Promise.resolve({
          ok: true,
          json: async () => multipleTrainers,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    const { result } = renderHook(() => useBookingLogic({ formation }));

    await act(async () => {
      result.current.setSelectedZone("z1");
    });

    await waitFor(() => {
        expect(result.current.trainers).toEqual(multipleTrainers);
    });

    // Check that no trainer is selected
    expect(result.current.selectedTrainer).toBe("");
  });
});
