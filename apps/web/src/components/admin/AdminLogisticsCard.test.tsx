import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminLogisticsCard } from "./AdminLogisticsCard";
import { vi } from "vitest";

// Mock fetch
global.fetch = vi.fn();

// Mock confirm
global.confirm = vi.fn();

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("AdminLogisticsCard", () => {
  const mockSession = {
    id: "1",
    location: "Paris",
    logistics: null,
    isLogisticsComplete: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show Relancer Client button when logistics incomplete", () => {
    render(<AdminLogisticsCard session={mockSession} />);
    expect(screen.getByText("Relancer Client")).toBeInTheDocument();
  });

  it("should NOT show Relancer Client button when logistics complete", () => {
    render(<AdminLogisticsCard session={{ ...mockSession, isLogisticsComplete: true }} />);
    expect(screen.queryByText("Relancer Client")).not.toBeInTheDocument();
  });

  it("should send reminder on click and confirm", async () => {
    (global.confirm as any).mockReturnValue(true);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<AdminLogisticsCard session={mockSession} />);

    const button = screen.getByText("Relancer Client");
    fireEvent.click(button);

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/sessions/1/remind-logistics"),
      expect.objectContaining({ method: "POST" })
    );

    await waitFor(() => {
        expect(screen.getByText("Relance envoyée")).toBeInTheDocument();
    });
  });

  it("should NOT send reminder if cancelled", async () => {
    (global.confirm as any).mockReturnValue(false);

    render(<AdminLogisticsCard session={mockSession} />);

    const button = screen.getByText("Relancer Client");
    fireEvent.click(button);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
