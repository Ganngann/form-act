import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClientProfilePage from "./page";
import { vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

describe("ClientProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders loading initially", () => {
    (global.fetch as any).mockReturnValue(new Promise(() => {})); // Hang
    render(<ClientProfilePage />);
    expect(screen.getByText("Chargement...")).toBeDefined();
  });

  it("renders profile form", async () => {
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
            companyName: "Test Co",
            vatNumber: "BE123",
            address: "Street",
            user: { email: "test@co.com" },
            auditLog: "[]"
        }),
    });

    render(<ClientProfilePage />);
    await waitFor(() => {
        expect(screen.getByDisplayValue("Test Co")).toBeDefined();
    });
  });
});
