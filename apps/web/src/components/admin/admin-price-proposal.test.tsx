import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminPriceProposal } from "./admin-price-proposal";
import { vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

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
    price: 1000,
    formation: { price: 1200 },
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

  it("renders correctly when status is PENDING_APPROVAL", () => {
    render(<AdminPriceProposal session={mockSession} />);
    expect(screen.getByText("Proposition Tarifaire")).toBeDefined();
    expect(screen.getByDisplayValue("1000")).toBeDefined();
  });

  it("does not render when status is not PENDING_APPROVAL", () => {
    const { container } = render(<AdminPriceProposal session={{ ...mockSession, status: "CONFIRMED" }} />);
    expect(container.firstChild).toBeNull();
  });

  it("initializes price from formation if session.price is missing", () => {
    render(<AdminPriceProposal session={{ id: "1", status: "PENDING_APPROVAL", formation: { price: 1200 } }} />);
    expect(screen.getByDisplayValue("1200")).toBeDefined();
  });

  it("updates price on input change", () => {
    render(<AdminPriceProposal session={mockSession} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1500" } });
    expect(screen.getByDisplayValue("1500")).toBeDefined();
  });

  it("handles sending offer successfully", async () => {
    render(<AdminPriceProposal session={mockSession} />);
    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    expect(global.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/sessions/1/offer",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ price: 1000 }),
        })
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("does not send offer if confirmation is cancelled", async () => {
    global.confirm = vi.fn(() => false);
    render(<AdminPriceProposal session={mockSession} />);
    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles fetch error when res.ok is false and no json message", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("invalid json")),
    });

    render(<AdminPriceProposal session={mockSession} />);
    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Erreur lors de l'envoi");
    });
  });

  it("handles fetch error when res.ok is false with json message", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Custom API Error" }),
    });

    render(<AdminPriceProposal session={mockSession} />);
    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Custom API Error");
    });
  });

  it("handles catch error when fetch throws", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));

    render(<AdminPriceProposal session={mockSession} />);
    const sendButton = screen.getByText("Envoyer l'offre au client");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Network Error");
    });
  });
});
