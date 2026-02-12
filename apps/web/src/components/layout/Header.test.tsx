import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

describe("Header", () => {
  it("renders guest links", () => {
    render(<Header />);
    expect(screen.getByText("Mon Espace")).toBeInTheDocument();
  });

  it("renders Admin links", () => {
    render(<Header userRole="ADMIN" />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders Trainer links", () => {
    render(<Header userRole="TRAINER" />);
    expect(screen.getByText("Trainer")).toBeInTheDocument();
  });

  it("renders Client links", () => {
    render(<Header userRole="CLIENT" />);
    expect(screen.getByText("Client")).toBeInTheDocument();
  });

  it("toggles mobile menu", () => {
    render(<Header />);
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[buttons.length - 1]; // Toggle is the last button
    fireEvent.click(toggleBtn);
    // Should see mobile menu links (duplicate text, but check existence)
    const links = screen.getAllByText("Catalogue");
    expect(links.length).toBeGreaterThan(1);
  });

  it("shows correct mobile menu for logged in user", () => {
    render(<Header userRole="CLIENT" />);
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[buttons.length - 1]; // Toggle is the last button
    fireEvent.click(toggleBtn);

    expect(screen.getByText("Accéder à mon espace")).toBeInTheDocument();
  });
});
