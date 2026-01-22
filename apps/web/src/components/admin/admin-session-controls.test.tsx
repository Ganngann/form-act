import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminSessionControls } from "./admin-session-controls";
import { vi } from "vitest";

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://localhost:3000",
}));

// Mock useRouter
const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("AdminSessionControls", () => {
  const mockSession = {
    id: "1",
    trainerId: "t1",
    status: "CONFIRMED",
    isLogisticsOpen: false,
    trainer: { id: "t1", firstName: "John", lastName: "Doe" },
  };

  const mockTrainers = [
    { id: "t1", firstName: "John", lastName: "Doe" },
    { id: "t2", firstName: "Jane", lastName: "Smith" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        })
    ) as any;
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
  });

  it("renders correctly", () => {
    render(<AdminSessionControls session={mockSession} trainers={mockTrainers} />);
    expect(screen.getByText("Affectation Formateur")).toBeDefined();
    expect(screen.getByText("Déverrouiller Logistique")).toBeDefined();
  });

  it("handles cancel session with confirmation", async () => {
    render(<AdminSessionControls session={mockSession} trainers={mockTrainers} />);

    const cancelButton = screen.getByText("Annuler la Session");
    fireEvent.click(cancelButton);

    expect(global.confirm).toHaveBeenCalled();
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/sessions/1/admin-update"),
            expect.objectContaining({
                method: "PATCH",
                body: JSON.stringify({ status: "CANCELLED" }),
            })
        );
    });
  });

  it("does not cancel if not confirmed", async () => {
    global.confirm = vi.fn(() => false);
    render(<AdminSessionControls session={mockSession} trainers={mockTrainers} />);

    const cancelButton = screen.getByText("Annuler la Session");
    fireEvent.click(cancelButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles logistics toggle", async () => {
    render(<AdminSessionControls session={mockSession} trainers={mockTrainers} />);

    // Find checkbox input
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/sessions/1/admin-update"),
            expect.objectContaining({
                method: "PATCH",
                body: JSON.stringify({ isLogisticsOpen: true }),
            })
        );
    });
  });

  it("handles update error", async () => {
      (global.fetch as any).mockResolvedValue({ ok: false });
      render(<AdminSessionControls session={mockSession} trainers={mockTrainers} />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith("Erreur lors de la mise à jour");
      });
  });
});
