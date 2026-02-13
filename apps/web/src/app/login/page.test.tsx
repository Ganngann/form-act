import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://api.test",
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Email")).toBeDefined();
    expect(screen.getByPlaceholderText("Mot de passe")).toBeDefined();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeDefined();
  });

  it("handles login failure", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "wrong@test.com");
    await user.type(screen.getByPlaceholderText("Mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByText("Identifiants invalides")).toBeDefined();
    });
  });

  it("redirects ADMIN on success", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ role: "ADMIN" }),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "admin@test.com");
    await user.type(screen.getByPlaceholderText("Mot de passe"), "pass");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("redirects TRAINER on success", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ role: "TRAINER" }),
    });

    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("Email"), "trainer@test.com");
    await user.type(screen.getByPlaceholderText("Mot de passe"), "pass");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/trainer"));
  });

  it("redirects CLIENT on success", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ role: "CLIENT" }),
    });

    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("Email"), "client@test.com");
    await user.type(screen.getByPlaceholderText("Mot de passe"), "pass");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });
});
