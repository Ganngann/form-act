import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CheckoutForm } from "./checkout-form";
import { ROUTES } from "@/lib/routes";
import { vi } from "vitest";

// Mock API_URL
vi.mock("@/lib/config", () => ({
    API_URL: "http://localhost:3000",
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
    usePathname: () => "/checkout",
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
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
            value: { href: '', search: '' },
            writable: true
        });
    });

    const fillForm = async () => {
        fireEvent.change(screen.getByLabelText(/Numéro de TVA/i), { target: { value: "BE0123456789" } });
        fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), { target: { value: "My Company" } });
        fireEvent.change(screen.getByLabelText(/Adresse/i), { target: { value: "Street 1" } });
        fireEvent.change(screen.getByLabelText(/Email professionnel/i), { target: { value: "test@example.com" } });
        // Password might not be present if logged in
        const pwd = screen.queryByLabelText(/Mot de passe/i);
        if (pwd) fireEvent.change(pwd, { target: { value: "password123" } });
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

    it("check VAT error (fetch fails)", async () => {
        (global.fetch as any).mockRejectedValue(new Error("Network"));
        render(<CheckoutForm {...defaultProps} />);
        const vatInput = screen.getByLabelText(/Numéro de TVA/i);
        fireEvent.change(vatInput, { target: { value: "BE12345" } });
        fireEvent.click(screen.getByText("Vérifier"));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Impossible de vérifier le numéro de TVA.");
        });
    });

    it("check VAT error (response not ok)", async () => {
        (global.fetch as any).mockResolvedValue({ ok: false });
        render(<CheckoutForm {...defaultProps} />);
        const vatInput = screen.getByLabelText(/Numéro de TVA/i);
        fireEvent.change(vatInput, { target: { value: "BE12345" } });
        fireEvent.click(screen.getByText("Vérifier"));

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Impossible de vérifier le numéro de TVA.");
        });
    });

    it("skips VAT check if too short", async () => {
        render(<CheckoutForm {...defaultProps} />);
        const vatInput = screen.getByLabelText(/Numéro de TVA/i);
        fireEvent.change(vatInput, { target: { value: "BE" } });
        fireEvent.click(screen.getByText("Vérifier"));

        // Should not call fetch
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("transitions to step 2", async () => {
        render(<CheckoutForm {...defaultProps} />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText("Dernière étape")).toBeDefined();
            expect(screen.getByText(/Estimation :/i)).toBeDefined();
            expect(screen.getByText("Jean Dupont")).toBeDefined();
            expect(screen.getByText("My Company")).toBeDefined();
        });
    });

    it("handles manual trainer display", async () => {
        render(<CheckoutForm {...defaultProps} trainerName={undefined} trainerId="" />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText(/Non attribué/i)).toBeDefined();
        });
    });

    it("submits form failure from step 2", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: "Server Error" }),
        });

        render(<CheckoutForm {...defaultProps} />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText("Confirmer la réservation")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Confirmer la réservation"));

        await waitFor(() => {
            expect(screen.getByText("Server Error")).toBeDefined();
        });
    });

    it("submits form success from step 2", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });

        render(<CheckoutForm {...defaultProps} />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText("Confirmer la réservation")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Confirmer la réservation"));

        await waitFor(() => {
            expect(window.location.href).toBe(`${ROUTES.dashboard}?success=booking`);
        });
    });

    it("back button works", async () => {
        render(<CheckoutForm {...defaultProps} />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText("Dernière étape")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Retour"));

        await waitFor(() => {
            expect(screen.getByLabelText(/Numéro de TVA/i)).toBeDefined();
        });
    });

    it("pre-fills user data when logged in", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                email: "user@test.com",
                client: {
                    vatNumber: "BE999",
                    companyName: "User Co",
                    address: "User Addr"
                }
            })
        });

        render(<CheckoutForm {...defaultProps} isLoggedIn={true} />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/me"), expect.anything());
            expect(screen.getByText("user@test.com")).toBeDefined();
            expect(screen.getByText("User Co")).toBeDefined();
        });

        // Password field should not exist
        expect(screen.queryByLabelText(/Mot de passe/i)).toBeNull();
    });

    it("pre-fills user data when logged in (no client data)", async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                email: "user@test.com",
                client: null
            })
        });

        render(<CheckoutForm {...defaultProps} isLoggedIn={true} />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("user@test.com")).toBeDefined();
        });
    });

    it("handles fetch user profile error", async () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => { });
        (global.fetch as any).mockRejectedValue(new Error("Profile Error"));

        render(<CheckoutForm {...defaultProps} isLoggedIn={true} />);

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith("Error fetching user profile:", expect.any(Error));
        });
        spy.mockRestore();
    });

    it("submits form failure with non-Error object", async () => {
        (global.fetch as any).mockRejectedValue("Unknown Error");

        render(<CheckoutForm {...defaultProps} />);
        await fillForm();
        fireEvent.click(screen.getByText("Vérifier et continuer"));

        await waitFor(() => {
            expect(screen.getByText("Confirmer la réservation")).toBeDefined();
        });

        fireEvent.click(screen.getByText("Confirmer la réservation"));

        await waitFor(() => {
            expect(screen.getByText("Une erreur inattendue est survenue")).toBeDefined();
        });
    });
});
