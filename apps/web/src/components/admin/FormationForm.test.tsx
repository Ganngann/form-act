import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormationForm } from "./FormationForm";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminFormationsService } from "@/services/admin-formations";

// Mock the service
vi.mock("@/services/admin-formations", () => ({
  adminFormationsService: {
    createFormation: vi.fn(),
    updateFormation: vi.fn(),
  },
}));

// Mock UI components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select-wrapper" data-value={String(value)}>
      <select
        data-testid="category-select"
        value={value || ""}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="" disabled>Placeholder</option>
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => placeholder,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      {checked ? "On" : "Off"}
    </button>
  ),
}));

vi.mock("@radix-ui/react-switch", () => ({
  Root: ({ checked, onCheckedChange, children, ...props }: any) => (
     <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Thumb: () => null,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange(e.target.checked)}
      role="checkbox"
      data-state={checked ? "checked" : "unchecked"}
      {...props}
    />
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

// Mock Tabs to render everything to simplify testing of hidden inputs
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button type="button">{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("FormationForm", () => {
  const catId1 = "123e4567-e89b-12d3-a456-426614174000";
  const catId2 = "123e4567-e89b-12d3-a456-426614174001";

  const mockCategories = [{ id: catId1, name: "Category 1" }, { id: catId2, name: "Category 2" }];
  const mockTrainers = [{ id: "tr-1", firstName: "John", lastName: "Doe" }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for creating a new formation", () => {
    render(
      <FormationForm
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={false}
      />
    );

    expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument();
  });

  it("populates category field when editing a formation with categoryId missing but category relation present", async () => {
    const formation = {
      id: "f-1",
      title: "Existing Formation",
      description: "Desc",
      level: "Beginner",
      duration: "1 day",
      durationType: "HALF_DAY",
      categoryId: undefined,
      category: { id: catId1, name: "Category 1" },
      isExpertise: false,
      isPublished: true,
    };

    render(
      <FormationForm
        initialData={formation as any}
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={true}
      />
    );

    await waitFor(() => {
        // Because Tabs mock renders all tabs, we have 2 selects.
        // The first one is Category.
        const wrappers = screen.getAllByTestId("select-wrapper");
        expect(wrappers[0]).toHaveAttribute("data-value", catId1);
    });
  });

  it("handles successful form submission (create)", async () => {
    const user = userEvent.setup();
    render(
      <FormationForm
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={false}
      />
    );

    await user.type(screen.getByLabelText(/Titre/i), "New Formation");
    await user.type(screen.getByLabelText(/Présentation Commerciale/i), "Description");
    await user.type(screen.getByLabelText(/Niveau/i), "Beginner");

    // Robust select finding
    const catOption = screen.getByText("Category 1");
    const catSelect = catOption.closest("select");
    if (!catSelect) throw new Error("Category select not found");

    // Using fireEvent.change because manual change on hidden input via userEvent is tricky with mocks
    fireEvent.change(catSelect, { target: { value: catId1 } });

    // No need to click tab since all are rendered
    // await user.click(screen.getByText(/Configuration/i));

    await user.type(screen.getByLabelText(/Durée Affichée/i), "1 day");

    const durationOption = screen.getByText("Matinée ou Après-midi");
    const durationSelect = durationOption.closest("select");
    if (!durationSelect) throw new Error("Duration select not found");

    fireEvent.change(durationSelect, { target: { value: "HALF_DAY" } });

    const submitBtn = screen.getByText(/Lancer la formation/i);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminFormationsService.createFormation).toHaveBeenCalledWith(expect.objectContaining({
        title: "New Formation",
        categoryId: catId1,
        durationType: "HALF_DAY"
      }));
    });
  });

  it("handles successful form submission (update)", async () => {
    const user = userEvent.setup();
    const formation = {
      id: "f-1",
      title: "Existing Formation",
      description: "Desc",
      level: "Beginner",
      duration: "1 day",
      durationType: "HALF_DAY",
      categoryId: catId1,
      category: { id: catId1, name: "Category 1" },
      isExpertise: false,
      isPublished: true,
      authorizedTrainers: []
    };

    render(
      <FormationForm
        initialData={formation as any}
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Existing Formation")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Titre/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    // Check errors before submit to debug (but validation happens on submit usually)
    const submitBtn = screen.getByText(/Mettre à jour la formation/i);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminFormationsService.updateFormation).toHaveBeenCalledWith("f-1", expect.objectContaining({
        title: "Updated Title"
      }));
    });
  });

  it("handles adding and removing agreements", async () => {
    const user = userEvent.setup();
    render(
      <FormationForm
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={false}
      />
    );

    // Everything is rendered, so button is visible
    // await user.click(screen.getByText(/Médias/i));

    const addBtn = screen.getByText(/Ajouter un code/i);
    await user.click(addBtn);

    const regionInput = screen.getByPlaceholderText(/Entité/i);
    const codeInput = screen.getByPlaceholderText(/Code Agrément/i);

    await user.type(regionInput, "Region 1");
    await user.type(codeInput, "Code 1");

    expect(regionInput).toHaveValue("Region 1");

    const removeBtn = regionInput.closest('div.flex')?.querySelector('button');
    if (removeBtn) {
      await user.click(removeBtn);
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Entité/i)).not.toBeInTheDocument();
      });
    }
  });

  it("handles expertise mode toggling and trainer selection", async () => {
    const user = userEvent.setup();
    render(
      <FormationForm
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={false}
      />
    );

    // await user.click(screen.getByText(/Configuration/i));

    const switches = screen.getAllByRole("switch");
    const expertSwitch = switches[switches.length - 1];

    await user.click(expertSwitch);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    await user.click(screen.getByText("John Doe"));

    const checkbox = screen.getAllByRole("checkbox").find(c => (c as HTMLInputElement).checked);
    expect(checkbox).toBeInTheDocument();
  });

  it("displays error message on submission failure", async () => {
    const user = userEvent.setup();
    (adminFormationsService.createFormation as any).mockRejectedValue(new Error("Submission Failed"));

    render(
      <FormationForm
        categories={mockCategories}
        trainers={mockTrainers}
        isEdit={false}
      />
    );

    await user.type(screen.getByLabelText(/Titre/i), "Fail Formation");
    await user.type(screen.getByLabelText(/Présentation Commerciale/i), "Desc");
    await user.type(screen.getByLabelText(/Niveau/i), "Lvl");

    const catOption = screen.getByText("Category 1");
    const catSelect = catOption.closest("select");
    if (catSelect) fireEvent.change(catSelect, { target: { value: catId1 } });

    await user.type(screen.getByLabelText(/Durée Affichée/i), "1d");

    const durationOption = screen.getByText("Matinée ou Après-midi");
    const durationSelect = durationOption.closest("select");
    if (durationSelect) fireEvent.change(durationSelect, { target: { value: "HALF_DAY" } });

    const submitBtn = screen.getByText(/Lancer la formation/i);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Submission Failed/i)).toBeInTheDocument();
    });
  });
});
