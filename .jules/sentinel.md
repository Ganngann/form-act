## 2025-02-21 - [CRITICAL] Prevent Absolute Path Injection Regression
**Vulnerability:** Arbitrary File Read via Absolute Path Injection in `basePath` resolution.
**Learning:** Using `path.resolve(process.cwd(), "uploads", type)` where `type` is dynamically chosen (even if whitelisted) can result in an arbitrary file read vulnerability if `type` evaluates to an absolute path, because `path.resolve` will reset the path base to the absolute path instead of appending it.
**Prevention:** To safely construct a boundary path with user-defined folder types, use `path.join()` for intermediate segments (e.g., `const basePath = join(process.cwd(), "uploads", type)`) and only use `path.resolve()` for appending the filename.
