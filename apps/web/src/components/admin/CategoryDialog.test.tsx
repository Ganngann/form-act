import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CategoryDialog } from "./CategoryDialog"
import { adminCategoriesService } from "@/services/admin-categories"
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the service
vi.mock("@/services/admin-categories", () => ({
  adminCategoriesService: {
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
  },
}))

describe("CategoryDialog", () => {
  const onSuccess = vi.fn()
  const onOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  it("renders correctly for creating a new category", () => {
    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={null}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText("Nouvelle thématique")).toBeInTheDocument()
    expect(screen.getByLabelText(/Nom de la catégorie \*/i)).toBeInTheDocument()
  })

  it("populates fields when editing a category", () => {
    const category = { id: "c-1", name: "Management" }

    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={category as any}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText("Modifier la catégorie")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Management")).toBeInTheDocument()
  })

  it("submits the form successfully for creation", async () => {
    const user = userEvent.setup()
    vi.mocked(adminCategoriesService.createCategory).mockResolvedValueOnce({} as any)

    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={null}
        onSuccess={onSuccess}
      />
    )

    await user.type(screen.getByLabelText(/Nom de la catégorie \*/i), "Nouvelle Catégorie")
    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }))

    await waitFor(() => {
      expect(adminCategoriesService.createCategory).toHaveBeenCalledWith({ name: "Nouvelle Catégorie" })
      expect(onSuccess).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("submits the form successfully for updating", async () => {
    const user = userEvent.setup()
    const category = { id: "c-1", name: "Management" }
    vi.mocked(adminCategoriesService.updateCategory).mockResolvedValueOnce({} as any)

    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={category as any}
        onSuccess={onSuccess}
      />
    )

    const input = screen.getByLabelText(/Nom de la catégorie \*/i)
    await user.clear(input)
    await user.type(input, "Management Avancé")

    await user.click(screen.getByRole("button", { name: /Sauvegarder/i }))

    await waitFor(() => {
      expect(adminCategoriesService.updateCategory).toHaveBeenCalledWith("c-1", { name: "Management Avancé" })
      expect(onSuccess).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("handles error during creation", async () => {
    const user = userEvent.setup()
    vi.mocked(adminCategoriesService.createCategory).mockRejectedValueOnce(new Error("API Error"))

    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={null}
        onSuccess={onSuccess}
      />
    )

    await user.type(screen.getByLabelText(/Nom de la catégorie \*/i), "Catégorie Erreur")
    await user.click(screen.getByRole("button", { name: /Créer la catégorie/i }))

    await waitFor(() => {
      expect(adminCategoriesService.createCategory).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith("Une erreur est survenue")
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  it("handles error during update", async () => {
    const user = userEvent.setup()
    const category = { id: "c-1", name: "Management" }
    vi.mocked(adminCategoriesService.updateCategory).mockRejectedValueOnce(new Error("API Error"))

    render(
      <CategoryDialog
        open={true}
        onOpenChange={onOpenChange}
        category={category as any}
        onSuccess={onSuccess}
      />
    )

    await user.click(screen.getByRole("button", { name: /Sauvegarder/i }))

    await waitFor(() => {
      expect(adminCategoriesService.updateCategory).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith("Une erreur est survenue")
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })
})
