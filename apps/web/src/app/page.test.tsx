import { render, screen } from "@testing-library/react";
import Home from "./page";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next/headers
const mockCookieGet = vi.fn().mockReturnValue(undefined);
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: mockCookieGet,
  }),
}));

// Mock jose
vi.mock("jose", () => ({
  jwtVerify: vi.fn().mockResolvedValue({ payload: { role: "CLIENT" } }),
}));

// Mock SearchHero
vi.mock("@/components/home/SearchHero", () => ({
  SearchHero: ({ categories }: any) => (
    <div data-testid="search-hero">{categories.length} categories</div>
  ),
}));

// Mock icons
vi.mock("lucide-react", () => ({
  BadgeCheck: () => <span>Icon</span>,
  Calendar: () => <span>Icon</span>,
  GraduationCap: () => <span>Icon</span>,
  ArrowRight: () => <span>Icon</span>,
  Star: () => <span>Icon</span>,
  Quote: () => <span>Icon</span>,
  Users: () => <span>Icon</span>,
  Shield: () => <span>Icon</span>,
  Zap: () => <span>Icon</span>,
}));

describe("Home Page", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "1", name: "Cat 1" }],
    });
    // Mock console.error to avoid noise if fetch fails in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders correctly", async () => {
    const ui = await Home();
    render(ui);

    expect(screen.getByText(/Activez votre/i)).toBeDefined();
    expect(screen.getByTestId("search-hero")).toHaveTextContent("1 categories");
    expect(screen.getByRole("link", { name: /Nos Formations/i })).toBeDefined();
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Fetch fail"));
    const ui = await Home();
    render(ui);

    expect(screen.getByTestId("search-hero")).toHaveTextContent("0 categories");
  });

  it("renders dashboard link when logged in", async () => {
    mockCookieGet.mockReturnValue({ value: "valid-token" });
    const ui = await Home();
    render(ui);

    expect(screen.getByText(/Mon Dashboard/i)).toBeDefined();
    expect(screen.queryByText(/Accès Client/i)).toBeNull();
  });
});
