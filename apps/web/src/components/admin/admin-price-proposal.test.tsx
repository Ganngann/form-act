import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminPriceProposal } from "./admin-price-proposal";
import { vi } from "vitest";

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

// Mock useRouter
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe("AdminPriceProposal", () => {
  const mockSession = {
    id: "1",
    status: "PENDING_APPROVAL",
    price: 100,
    formation: { price: 200 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
  });

  it("renders correctly", () => {
    render(<AdminPriceProposal session={mockSession} />);
    expect(screen.getByText("Proposition Tarifaire")).toBeDefined();
  });

  it("does not render if status is not PENDING_APPROVAL", () => {
    render(<AdminPriceProposal session={{ ...mockSession, status: "CONFIRMED" }} />);
    expect(screen.queryByText("Proposition Tarifaire")).toBeNull();
  });

  it("sends offer successfully", async () => {
    render(<AdminPriceProposal session={mockSession} />);

    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    expect(global.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sessions/1/offer"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ price: 100 }),
        })
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("does not send offer if not confirmed", async () => {
    global.confirm = vi.fn(() => false);
    render(<AdminPriceProposal session={mockSession} />);

    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles error path when fetch fails with response error", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Test error message" }),
    });

    render(<AdminPriceProposal session={mockSession} />);

    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Test error message");
    });
  });

  it("handles error path when fetch throws exception", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    render(<AdminPriceProposal session={mockSession} />);

    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Network error");
    });
  });
});
