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
    formationTitle: "Formation Test",
    formationPrice: 1000,
    trainerName: "Jean Dupont"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
    window.scrollTo = vi.fn();
    // Mock window.location
    Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true
    });
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/Numéro de TVA/i), { target: { value: "BE0123456789" } });
    fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), { target: { value: "My Company" } });
    fireEvent.change(screen.getByLabelText(/Adresse/i), { target: { value: "Street 1" } });
    fireEvent.change(screen.getByLabelText(/Email professionnel/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "password123" } });
  }

  it("renders form fields", () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
    expect(screen.getByText("Vérifier et continuer")).toBeDefined();
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

  it("transitions to step 2", async () => {
      render(<CheckoutForm {...defaultProps} />);
      fillForm();
      fireEvent.click(screen.getByText("Vérifier et continuer"));

      await waitFor(() => {
          expect(screen.getByText("Récapitulatif de la commande")).toBeDefined();
          expect(screen.getByText("Estimation Tarifaire")).toBeDefined();
          expect(screen.getByText("Jean Dupont")).toBeDefined();
          expect(screen.getByText("My Company")).toBeDefined();
      });
  });

  it("handles manual trainer display", async () => {
      render(<CheckoutForm {...defaultProps} trainerName={undefined} trainerId="" />);
      fillForm();
      fireEvent.click(screen.getByText("Vérifier et continuer"));

      await waitFor(() => {
          expect(screen.getByText("Non attribué")).toBeDefined();
      });
  });

  it("submits form failure from step 2", async () => {
    (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Server Error" }),
    });

    render(<CheckoutForm {...defaultProps} />);
    fillForm();
    fireEvent.click(screen.getByText("Vérifier et continuer"));

    await waitFor(() => {
        expect(screen.getByText("Valider ma demande de prestation")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Valider ma demande de prestation"));

    await waitFor(() => {
        expect(screen.getByText("Server Error")).toBeDefined();
    });
  });

  it("back button works", async () => {
      render(<CheckoutForm {...defaultProps} />);
      fillForm();
      fireEvent.click(screen.getByText("Vérifier et continuer"));

      await waitFor(() => {
          expect(screen.getByText("Récapitulatif de la commande")).toBeDefined();
      });

      fireEvent.click(screen.getByText("Retour"));

      await waitFor(() => {
           expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
      });
  });
});
