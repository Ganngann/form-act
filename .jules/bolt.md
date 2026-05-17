## 2024-05-17 - [Email Template Compilation Bottleneck]
**Learning:** `getRenderedTemplate` in `email-templates.service.ts` previously dynamically generated and evaluated a RegExp for *every* variable inside a loop (`O(N * M)` complexity where N=variables, M=template size). In heavily customized apps where templates might have dozens of variables, this repetitive global string scan creates substantial overhead.
**Action:** Use a single-pass global `replace(/{{(.+?)}}/g, replacer)` pattern for template variable interpolation to improve scaling to `O(M)`.
