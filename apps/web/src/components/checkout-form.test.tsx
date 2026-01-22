import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutForm } from "./checkout-form";
import { vi } from "vitest";

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

describe("CheckoutForm", () => {
  const defaultProps = {
    formationId: "f1",
    trainerId: "t1",
    date: "2023-01-01",
    slot: "AM",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Mock window.location
    Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true
    });
  });

  it("renders form fields", () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
    expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeDefined();
    expect(screen.getByLabelText(/Adresse/i)).toBeDefined();
    expect(screen.getByLabelText(/Email professionnel/i)).toBeDefined();
  });

  it("handles manual request (missing trainerId)", () => {
      render(<CheckoutForm {...defaultProps} trainerId="" />);
      expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
  });

  it("submits form successfully", async () => {
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
    });

    render(<CheckoutForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Numéro de TVA/i), { target: { value: "BE0123456789" } });
    fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), { target: { value: "My Company" } });
    fireEvent.change(screen.getByLabelText(/Adresse/i), { target: { value: "Street 1" } });
    fireEvent.change(screen.getByLabelText(/Email professionnel/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "password123" } });

    const submitBtn = screen.getByText("Confirmer la réservation");
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/checkout"),
            expect.objectContaining({
                method: "POST",
            })
        );
    });
  });
});
