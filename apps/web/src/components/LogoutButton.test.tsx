import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LogoutButton } from "./LogoutButton";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly", () => {
    render(<LogoutButton />);
    expect(screen.getByText("Déconnexion")).toBeDefined();
  });

  it("handles logout success", async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    render(<LogoutButton />);
    const button = screen.getByText("Déconnexion");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/logout",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("handles logout failure", async () => {
    const error = new Error("Network error");
    (global.fetch as any).mockRejectedValue(error);

    render(<LogoutButton />);
    const button = screen.getByText("Déconnexion");
    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Logout failed", error);
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
