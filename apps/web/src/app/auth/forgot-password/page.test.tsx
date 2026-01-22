import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./page";
import { vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByPlaceholderText("Email")).toBeDefined();
    expect(screen.getByText("Envoyer le lien")).toBeDefined();
  });

  it("handles submission", async () => {
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: "Email sent" }),
    });

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Envoyer le lien"));

    await waitFor(() => {
        expect(screen.getByText("Email sent")).toBeDefined();
    });
  });
});
