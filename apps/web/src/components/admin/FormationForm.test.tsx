import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormationForm } from "./FormationForm";
import { describe, it, expect, vi } from "vitest";

// Mock the service
vi.mock("@/services/admin-formations", () => ({
  adminFormationsService: {
    createFormation: vi.fn(),
    updateFormation: vi.fn(),
  },
}));

// Mock Select components with native select for easier testing in JSDOM
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

// Mock UI components that might cause issues in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Fix Radix Select issue in JSDOM
if (typeof window !== 'undefined') {
  HTMLElement.prototype.hasPointerCapture = vi.fn();
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
}

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("FormationForm", () => {
  const mockCategories = [{ id: "cat-1", name: "Category 1" }, { id: "cat-2", name: "Category 2" }];
  const mockTrainers = [{ id: "tr-1", firstName: "John", lastName: "Doe" }];

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
      // Simulate missing categoryId but present category relation
      categoryId: undefined,
      category: { id: "cat-1", name: "Category 1" },
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
        const wrapper = screen.getByTestId("select-wrapper");
        // Expect value to be cat-1, but currently it is likely undefined
        expect(wrapper).toHaveAttribute("data-value", "cat-1");
    });
  });
});
