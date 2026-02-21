import { render, screen, fireEvent } from "@testing-library/react";
import { SessionSearchBar } from "./SessionSearchBar";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mocks for next/navigation
const pushMock = vi.fn();
const mockUseSearchParams = vi.fn();
const mockUsePathname = vi.fn(() => "/admin/sessions");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => mockUseSearchParams(),
  usePathname: () => mockUsePathname(),
}));

describe("SessionSearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders the input", () => {
    render(<SessionSearchBar />);
    expect(screen.getByPlaceholderText("Rechercher une formation, client...")).toBeDefined();
  });

  it("does not render the 'Tout voir' button initially", () => {
    render(<SessionSearchBar />);
    expect(screen.queryByText("Tout voir")).toBeNull();
  });

  it("renders the 'Tout voir' button when query params (q) are present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("q=test"));
    render(<SessionSearchBar />);
    expect(screen.getByText("Tout voir")).toBeDefined();
  });

  it("renders the 'Tout voir' button when filters (status) are present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("status=PENDING"));
    render(<SessionSearchBar />);
    expect(screen.getByText("Tout voir")).toBeDefined();
  });

  it("renders the 'Tout voir' button when filters (filter) are present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("filter=NO_TRAINER"));
    render(<SessionSearchBar />);
    expect(screen.getByText("Tout voir")).toBeDefined();
  });

  it("navigates to the base path when 'Tout voir' is clicked", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("q=test"));
    render(<SessionSearchBar />);

    const link = screen.getByRole("link", { name: /Tout voir/i });
    expect(link).toHaveAttribute("href", "/admin/sessions");
  });

  it("updates input value when q param is removed externally", () => {
    // Start with q=test
    const params = new URLSearchParams("q=test");
    mockUseSearchParams.mockReturnValue(params);
    const { rerender } = render(<SessionSearchBar />);

    const input = screen.getByPlaceholderText("Rechercher une formation, client...") as HTMLInputElement;
    expect(input.value).toBe("test");

    // Simulate removal of q param (e.g. via reset)
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    rerender(<SessionSearchBar />);

    // Input should be cleared
    expect(input.value).toBe("");
  });
});
