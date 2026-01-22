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
    global.alert = vi.fn();
    // Mock window.location
    Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true
    });
  });

  it("renders form fields", () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
  });

  it("check VAT valid", async () => {
      (global.fetch as any).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ isValid: true, companyName: "Test Co", address: "Test Addr", vatNumber: "BE123" })
      });
      render(<CheckoutForm {...defaultProps} />);
      const vatInput = screen.getByLabelText(/Numéro de TVA/i);
      fireEvent.change(vatInput, { target: { value: "BE12345" } });
      fireEvent.click(screen.getByText("Vérifier"));

      await waitFor(() => {
          expect(screen.getByDisplayValue("Test Co")).toBeDefined();
      });
  });

  it("check VAT invalid", async () => {
      (global.fetch as any).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ isValid: false })
      });
      render(<CheckoutForm {...defaultProps} />);
      const vatInput = screen.getByLabelText(/Numéro de TVA/i);
      fireEvent.change(vatInput, { target: { value: "BE12345" } });
      fireEvent.click(screen.getByText("Vérifier"));

      await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("non valide"));
      });
  });

  it("check VAT error", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network"));
      render(<CheckoutForm {...defaultProps} />);
      const vatInput = screen.getByLabelText(/Numéro de TVA/i);
      fireEvent.change(vatInput, { target: { value: "BE12345" } });
      fireEvent.click(screen.getByText("Vérifier"));

      await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Impossible de vérifier"));
      });
  });

  it("submits form failure", async () => {
    (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Server Error" }),
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
        expect(screen.getByText("Server Error")).toBeDefined();
    });
  });
});
