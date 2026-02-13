import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

// Wrapper to test controlled component
const TestDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog Content</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

describe("Dialog", () => {
  it("opens when controlled state changes", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    expect(screen.queryByText("Dialog Content")).toBeNull();

    await user.click(screen.getByText("Open"));

    expect(screen.getByText("Dialog Title")).toBeDefined();
    expect(screen.getByText("Dialog Content")).toBeDefined();

    // Test closing (via backdrop or close button if available, but checking existance first)
    // The simplified dialog has an X button and backdrop click handler
  });
});
