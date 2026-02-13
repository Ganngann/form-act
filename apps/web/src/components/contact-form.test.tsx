import { render, screen, waitFor, act, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ContactForm } from "./contact-form";

// Mock the Lucide icons
vi.mock("lucide-react", () => ({
    Loader2: () => <div data-testid="loader-icon" />,
    Send: () => <div data-testid="send-icon" />,
}));

describe("ContactForm", () => {
    // Clean up DOM after each test
    afterEach(() => {
        cleanup();
    });

    it("renders form fields correctly", () => {
        render(<ContactForm />);

        expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sujet/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Envoyer le message/i })).toBeInTheDocument();
    });

    it("shows validation errors on empty submission", async () => {
        render(<ContactForm />);

        const submitButton = screen.getByRole("button", { name: /Envoyer le message/i });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText("Nom requis")).toBeInTheDocument();
            expect(screen.getByText("Email invalide")).toBeInTheDocument();
            expect(screen.getByText("Sujet requis")).toBeInTheDocument();
            expect(screen.getByText("Message trop court")).toBeInTheDocument();
        });
    });

    it("handles successful submission flow", async () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: "John Doe" } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByLabelText(/Sujet/i), { target: { value: "Question about product" } });
        fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "I would like to know more about your services. Please contact me." } });

        const submitButton = screen.getByRole("button", { name: /Envoyer le message/i });

        // Wrap click in act because it triggers async state updates immediately (since delay is 0 in test env)
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText("Message envoyé !")).toBeInTheDocument();
        });

        expect(screen.getByText("Merci de nous avoir contactés. Notre équipe reviendra vers vous sous 24h.")).toBeInTheDocument();
        expect(screen.queryByLabelText(/Nom complet/i)).not.toBeInTheDocument();
    });

    it("resets form after success", async () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText(/Nom complet/i), { target: { value: "John Doe" } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByLabelText(/Sujet/i), { target: { value: "Test Subject" } });
        fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "Test Message Content Longer Than 10 Chars" } });

        const submitButton = screen.getByRole("button", { name: /Envoyer le message/i });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText("Message envoyé !")).toBeInTheDocument();
        });

        const resetButton = screen.getByRole("button", { name: /Envoyer un autre message/i });

        await act(async () => {
            fireEvent.click(resetButton);
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/Nom complet/i)).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/Nom complet/i)).toHaveValue("");
        expect(screen.getByLabelText(/Email/i)).toHaveValue("");
        expect(screen.getByLabelText(/Sujet/i)).toHaveValue("");
        expect(screen.getByLabelText(/Message/i)).toHaveValue("");
    });
});
