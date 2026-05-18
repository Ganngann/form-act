import { render, screen, waitFor } from "@testing-library/react";
import { MasterCalendar } from "./master-calendar";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock sub-components to avoid rendering their complex children logic
vi.mock("./calendar-grid", () => ({
  CalendarGrid: () => <div data-testid="calendar-grid">Calendar Grid</div>
}));

vi.mock("./session-details-dialog", () => ({
  SessionDetailsDialog: () => <div data-testid="session-details-dialog">Session Details Dialog</div>
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MasterCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default success fetch implementation
    mockFetch.mockResolvedValue({
      json: async () => []
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders successfully and fetches trainers and sessions", async () => {
    render(<MasterCalendar />);

    await waitFor(() => {
      // It should fetch trainers and then sessions
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][0]).toContain("/admin/trainers");
      expect(mockFetch.mock.calls[1][0]).toContain("/sessions");
    });

    expect(screen.getByTestId("calendar-grid")).toBeDefined();
    expect(screen.getByTestId("session-details-dialog")).toBeDefined();
  });

  it("handles 'Failed to fetch trainers' error path quietly", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Make only the trainers fetch fail
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/admin/trainers")) {
        throw new Error("Network error");
      }
      return { json: async () => [] };
    });

    render(<MasterCalendar />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch trainers", expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles 'Failed to fetch sessions' error path quietly", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Make only the sessions fetch fail
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/sessions")) {
        throw new Error("Network error");
      }
      return { json: async () => [] };
    });

    render(<MasterCalendar />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch sessions", expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
