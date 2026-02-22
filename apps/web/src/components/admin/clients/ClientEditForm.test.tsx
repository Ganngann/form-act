import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientEditForm } from "./ClientEditForm";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock router
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const mockClient = {
  id: "client-123",
  vatNumber: "FR123456789",
  companyName: "Test Company",
  address: "123 Test St",
  auditLog: null,
  createdAt: "2023-01-01T00:00:00Z",
  user: {
    email: "test@example.com",
  },
  sessions: [],
};

const mockAuditLogs = [];

describe("ClientEditForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders client details correctly", () => {
    render(<ClientEditForm client={mockClient} auditLogs={mockAuditLogs} />);

    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
    expect(screen.getByDisplayValue("FR123456789")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("toggles edit mode", () => {
    render(<ClientEditForm client={mockClient} auditLogs={mockAuditLogs} />);

    const editButton = screen.getByText("Modifier");
    fireEvent.click(editButton);

    expect(screen.getByText("Annuler")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Company")).toBeEnabled();

    fireEvent.click(screen.getByText("Annuler"));
    expect(screen.getByText("Modifier")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Company")).toBeDisabled();
  });

  it("submits changes and refreshes router", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ClientEditForm client={mockClient} auditLogs={mockAuditLogs} />);

    // Enable edit
    fireEvent.click(screen.getByText("Modifier"));

    // Change value
    const nameInput = screen.getByDisplayValue("Test Company");
    fireEvent.change(nameInput, { target: { value: "New Company Name" } });

    // Submit
    const saveButton = screen.getByText("Enregistrer");
    fireEvent.click(saveButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/clients/client-123"),
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("New Company Name"),
      })
    );

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
