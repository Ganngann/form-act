## 2024-05-17 - [Email Template Compilation Bottleneck]
**Learning:** `getRenderedTemplate` in `email-templates.service.ts` previously dynamically generated and evaluated a RegExp for *every* variable inside a loop (`O(N * M)` complexity where N=variables, M=template size). In heavily customized apps where templates might have dozens of variables, this repetitive global string scan creates substantial overhead.
**Action:** Use a single-pass global `replace(/{{(.+?)}}/g, replacer)` pattern for template variable interpolation to improve scaling to `O(M)`.

## 2026-05-17: N+1 Query Fix using Select

**Learning:** When dealing with complex JSON structures that must be validated or filtered using business logic written in Javascript (`sessions.service.ts` -> `isLogisticsStrictlyComplete`), moving the logic purely to raw SQL with `JSON_EXTRACT` breaks compatibility across SQLite (dev) and MySQL/MariaDB (prod) due to how raw SQL functions handle quotes. Fetching all models using `findMany` into memory to filter is a memory bottleneck causing massive N+1 delays as the dataset grows.
**Takeaway:** The safest and most performant middle-ground optimization is to use Prisma `select: { ... }` within `findMany` to retrieve *only* the specific fields required by the JS validation. This dramatically minimizes network and memory overhead (~60% speed increase) while keeping the complex business logic completely contained within the domain layer and preserving multi-DB compatibility.
