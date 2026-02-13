import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "./profile-form";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  /* eslint-disable-next-line @next/next/no-img-element */
  default: (props: any) => <img {...props} alt={props.alt || ""} />,
}));

// Mock API_URL
vi.mock("@/lib/config", () => ({
  API_URL: "http://api.test",
}));

describe("ProfileForm", () => {
  const trainer = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@doe.com",
    bio: "My bio",
    avatarUrl: "/avatar.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders initial data", () => {
    render(<ProfileForm trainer={trainer} />);
    expect(screen.getByText("JD")).toBeDefined();
    expect(screen.getByDisplayValue("My bio")).toBeDefined();
  });

  it("submits bio update", async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({ ok: true });

    render(<ProfileForm trainer={trainer} />);

    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "New bio");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://api.test/trainers/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ bio: "New bio" }),
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });
});
