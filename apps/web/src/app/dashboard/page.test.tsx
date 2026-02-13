import { render, screen, waitFor } from "@testing-library/react";
import ClientDashboard from "./page";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://api.test",
}));

// Mock icons
vi.mock("lucide-react", () => ({
  User: () => <span>UserIcon</span>,
  FileText: () => <span>FileTextIcon</span>,
  Calendar: () => <span>CalendarIcon</span>,
}));

describe("ClientDashboard", () => {
  const mockSessions = [
    {
      id: "1",
      date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      status: "CONFIRMED",
      location: "Office",
      logistics: JSON.stringify({
        wifi: "yes",
        subsidies: "yes",
        videoMaterial: ["Projector"],
        writingMaterial: ["Markers"],
      }),
      participants: JSON.stringify([{ name: "P1" }]),
      formation: { title: "Upcoming Session", durationType: "ALL_DAY" },
      trainer: { firstName: "John", lastName: "Doe" },
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      status: "CONFIRMED",
      participants: JSON.stringify([{ name: "P2" }, { name: "P3" }]),
      formation: { title: "Past Session", durationType: "HALF_DAY" },
    },
    {
      id: "3",
      date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
      status: "CONFIRMED",
      location: "", // Missing location -> Action Required
      logistics: null,
      participants: null,
      formation: { title: "Action Required Session", durationType: "ALL_DAY" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSessions,
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders loading state initially", () => {
    render(<ClientDashboard />);
    expect(screen.getByText(/Chargement de vos formations/i)).toBeDefined();
  });

  it("renders dashboard with stats and sessions after loading", async () => {
    render(<ClientDashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Chargement/i)).toBeNull();
    });

    // Stats
    // Past sessions: Session 2 (2 participants, 0.5 days)
    expect(screen.getByText("2")).toBeDefined(); // Participants
    expect(screen.getByText("0.5")).toBeDefined(); // Volume

    // Title of next session
    expect(screen.getByText("Upcoming Session")).toBeDefined();

    // Action required section
    expect(screen.getByText(/Action Requise/i)).toBeDefined();
    expect(screen.getByText(/Vous avez 1 dossier à compléter/i)).toBeDefined();
  });

  it("toggles tabs correctly", async () => {
    const user = userEvent.setup();
    render(<ClientDashboard />);

    await waitFor(() => expect(screen.queryByText(/Chargement/i)).toBeNull());

    // Switch to Upcoming tab
    const upcomingTab = screen.getByRole("tab", { name: /À venir/i });
    await user.click(upcomingTab);
    expect(screen.getAllByText("Upcoming Session").length).toBeGreaterThan(0);

    // Switch to History tab
    const historyTab = screen.getByRole("tab", { name: /Historique/i });
    await user.click(historyTab);
    expect(screen.getAllByText("Past Session").length).toBeGreaterThan(0);
  });

  it("handles fetch error", async () => {
    (global.fetch as any).mockRejectedValue(new Error("API Down"));
    render(<ClientDashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Chargement/i)).toBeNull();
    });
    // Should show empty state or just no results
    expect(screen.queryByText("Upcoming Session")).toBeNull();
  });
});
