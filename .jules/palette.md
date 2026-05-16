## 2024-05-16 - Add ARIA Labels to Icon-only Buttons
**Learning:** Found multiple icon-only buttons across the application (like delete, remove, previous/next month) that lacked accessible names. When testing with screen readers, these would just read as "button", providing no context.
**Action:** Always add `aria-label` to any `<Button size="icon">` or similar icon-only buttons that don't have visible text content.
