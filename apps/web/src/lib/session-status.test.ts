import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getComputedStatus,
  SessionData,
  SessionStatus,
} from "./session-status";
import { addDays, subDays, subHours } from "date-fns";

describe("getComputedStatus", () => {
  const mockNow = new Date("2024-01-01T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseSession: SessionData = {
    id: "1",
    date: addDays(mockNow, 20).toISOString(), // Default: Future
    slot: "AM",
    trainerId: "t1",
    status: "CONFIRMED",
    location: null,
    logistics: null,
    participants: null,
    proofUrl: null,
    billedAt: null,
    createdAt: subDays(mockNow, 5).toISOString(), // Created 5 days ago
  };

  it("should return CANCELLED if db status is CANCELLED", () => {
    const session = { ...baseSession, status: "CANCELLED" };
    expect(getComputedStatus(session)).toBe("CANCELLED");
  });

  it("should return PENDING if db status is PENDING", () => {
    const session = { ...baseSession, status: "PENDING" };
    expect(getComputedStatus(session)).toBe("PENDING");
  });

  describe("Past Sessions", () => {
    const pastSession = {
      ...baseSession,
      date: subDays(mockNow, 1).toISOString(),
    };

    it("should return BILLED if billedAt is present", () => {
      expect(getComputedStatus({ ...pastSession, billedAt: new Date() })).toBe(
        "BILLED",
      );
    });

    it("should return TO_BILL if proofUrl is present but not billed", () => {
      expect(
        getComputedStatus({ ...pastSession, proofUrl: "http://proof.url" }),
      ).toBe("TO_BILL");
    });

    it("should return PROOF_MISSING if past and no proof", () => {
      expect(getComputedStatus({ ...pastSession })).toBe("PROOF_MISSING");
    });
  });

  describe("Future Sessions", () => {
    describe("READY status", () => {
      it("should return READY if logistics and participants are present", () => {
        const session = {
          ...baseSession,
          location: "Paris",
          logistics: "Projector needed",
          participants: "John, Jane",
        };
        expect(getComputedStatus(session)).toBe("READY");
      });
    });

    describe("PARTICIPANTS_MISSING status", () => {
      it("should return PARTICIPANTS_MISSING if <= 15 days and no participants", () => {
        const session = {
          ...baseSession,
          date: addDays(mockNow, 10).toISOString(), // 10 days away
          participants: null,
        };
        expect(getComputedStatus(session)).toBe("PARTICIPANTS_MISSING");
      });

      it("should return PARTICIPANTS_MISSING if <= 15 days and empty participants array string", () => {
        const session = {
          ...baseSession,
          date: addDays(mockNow, 10).toISOString(),
          participants: "[]",
        };
        expect(getComputedStatus(session)).toBe("PARTICIPANTS_MISSING");
      });

      it("should NOT return PARTICIPANTS_MISSING if > 15 days", () => {
        const session = {
          ...baseSession,
          date: addDays(mockNow, 16).toISOString(),
          participants: null,
          logistics: "Some logistics", // Ensure logistics check passes so we don't hit LOGISTICS_MISSING or CONFIRMED logic
          location: "Some location",
        };
        // Logistics present, Participants missing, > 15 days -> CONFIRMED
        expect(getComputedStatus(session)).toBe("CONFIRMED");
      });
    });

    describe("LOGISTICS_MISSING status", () => {
      it("should return LOGISTICS_MISSING if created > 48h ago and no logistics", () => {
        const session = {
          ...baseSession,
          createdAt: subHours(mockNow, 49).toISOString(),
          logistics: null,
        };
        expect(getComputedStatus(session)).toBe("LOGISTICS_MISSING");
      });

      it("should return CONFIRMED (grace period) if created < 48h ago and no logistics", () => {
        const session = {
          ...baseSession,
          createdAt: subHours(mockNow, 47).toISOString(),
          logistics: null,
        };
        expect(getComputedStatus(session)).toBe("CONFIRMED");
      });

      it("should return LOGISTICS_MISSING if createdAt is missing and no logistics", () => {
        const session = {
          ...baseSession,
          createdAt: undefined,
          logistics: null,
        };
        expect(getComputedStatus(session)).toBe("LOGISTICS_MISSING");
      });
    });

    describe("CONFIRMED status", () => {
      it("should return CONFIRMED if logistics present but participants missing (> 15 days)", () => {
        const session = {
          ...baseSession,
          date: addDays(mockNow, 20).toISOString(),
          logistics: "OK",
          location: "Room 1",
          participants: null,
        };
        expect(getComputedStatus(session)).toBe("CONFIRMED");
      });
    });
  });
});
