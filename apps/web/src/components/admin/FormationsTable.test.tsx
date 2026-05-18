import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { FormationsTable } from "./FormationsTable"
import { adminFormationsService } from "@/services/admin-formations"

// Mock the dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock("@/services/admin-formations", () => ({
  adminFormationsService: {
    deleteFormation: vi.fn(),
  },
}))

// Mock lucide-react to avoid Icon warnings
vi.mock("lucide-react", () => ({
  Plus: () => <div data-testid="icon-plus" />,
  Pencil: () => <div data-testid="icon-pencil" />,
  Trash2: () => <div data-testid="icon-trash" />,
  MoreHorizontal: () => <div data-testid="icon-more" />,
  Search: () => <div data-testid="icon-search" />
}))

describe("FormationsTable", () => {
  const mockFormations = [
    {
      id: "1",
      title: "Test Formation",
      description: "Test description",
      isPublished: true,
      price: 1000,
      duration: "2 days",
      category: {
        id: "cat-1",
        name: "Test Category",
        slug: "test-category",
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    window.alert = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()

    // Setup PointerEvent which is needed for Radix UI (DropdownMenu)
    if (!global.PointerEvent) {
      class PointerEvent extends MouseEvent {
        constructor(type: string, params: any = {}) {
          super(type, params);
        }
      }
      global.PointerEvent = PointerEvent as any;
    }
  })

  it("handles deletion errors correctly", async () => {
    // Force the service to throw an error
    vi.mocked(adminFormationsService.deleteFormation).mockRejectedValue(
      new Error("Suppression impossible")
    )

    render(
      <FormationsTable
        initialFormations={mockFormations}
        categories={[]}
        trainers={[]}
      />
    )

    // Open dropdown menu
    const moreButton = screen.getByRole("button", { name: /open menu/i })

    // Use pointer down which is what Radix dropdown triggers on
    fireEvent.pointerDown(moreButton)

    // Wait for the dropdown to open and click delete
    const deleteButton = await screen.findByText(/supprimer/i)
    fireEvent.click(deleteButton)

    // Wait for the alert to be called
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Erreur lors de la suppression (impossible si sessions liées)"
      )
    })
  })
})
