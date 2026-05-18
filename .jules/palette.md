## 2024-05-16 - Add ARIA Labels to Icon-only Buttons
**Learning:** Found multiple icon-only buttons across the application (like delete, remove, previous/next month) that lacked accessible names. When testing with screen readers, these would just read as "button", providing no context.
**Action:** Always add `aria-label` to any `<Button size="icon">` or similar icon-only buttons that don't have visible text content.

## 2024-05-18 - ARIA Labels on Next.js Links inside shadcn/ui asChild Buttons
**Learning:** When using shadcn/ui's `<Button size="icon" asChild>` pattern wrapped around a Next.js `<Link>` component for icon-only navigation, the `aria-label` MUST be placed on the inner `<Link>` component, not the outer `<Button>`. Since `asChild` passes the button props down, screen readers need the accessible name directly on the rendered anchor tag to properly announce the link's destination.
**Action:** Always place the `aria-label` on the inner `<Link>` (or `<a>` tag) when it is the child of a `<Button asChild size="icon">`.
