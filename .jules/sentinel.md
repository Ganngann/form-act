## 2024-05-22 - Missing Global Validation Pipe
**Vulnerability:** The NestJS API lacked a global `ValidationPipe` in `main.ts`, meaning DTO validation decorators (like `@IsEmail`) were ignored at runtime, allowing invalid data to reach controllers.
**Learning:** `class-validator` decorators in NestJS do nothing unless a `ValidationPipe` is activated (globally or per-handler). The default `NestFactory.create` does not enable this.
**Prevention:** Always verify `main.ts` includes `app.useGlobalPipes(new ValidationPipe(...))` and include an integration test that specifically sends invalid data to ensure validation is active.

## 2025-05-30 - Insecure Random Filename Generation
**Vulnerability:** File uploads used `Math.random()` for generating filenames, which is not cryptographically secure and can lead to predictable filenames.
**Learning:** Developers often default to `Math.random()` for "random enough" strings, but for security-sensitive contexts (like unique IDs or filenames to prevent collisions/enumeration), `crypto.randomBytes` is required.
**Prevention:** Enforce usage of `crypto.randomBytes` or `uuid` for any random string generation via linting rules or code reviews.

## 2025-06-03 - Unauthorized File Storage (DoS Risk)
**Vulnerability:** NestJS `FileInterceptor` uploads and saves files to disk *before* the controller method executes. If authorization checks fail inside the controller, the unauthorized file remains on disk indefinitely.
**Learning:** Middleware/Interceptors run before Guards/Handlers. Simply throwing `ForbiddenException` in the controller does not undo the side effects (file creation) of the Interceptor.
**Prevention:** Always wrap controller logic in `try...catch` when handling file uploads and explicitly delete the uploaded file in the `catch` block (or `finally` if needed), or use a custom Pipe/Guard that checks authorization before the Interceptor runs (though harder with `FileInterceptor`).

## 2026-02-13 - Timing Attack on User Validation (User Enumeration)
**Vulnerability:** The `validateUser` method in `AuthService` returned immediately if a user was not found, but performed a slow `bcrypt.compare` if the user existed. This timing difference allowed attackers to enumerate valid email addresses.
**Learning:** `bcrypt.compare` is intentionally slow. Any logic that skips it based on a database lookup creates a measurable timing side-channel.
**Prevention:** Always ensure the time taken to reject a login attempt is roughly constant, regardless of whether the user exists. Use a dummy hash for comparison when the user is not found.

## 2026-02-15 - Missing Trust Proxy Configuration (IP Spoofing)
**Vulnerability:** The application relied on `req.ip` for security controls (like rate limiting) but did not enable `trust proxy` in `main.ts`, meaning the IP would always be the load balancer's IP in production.
**Learning:** NestJS/Express defaults to `trust proxy: false`. Without this, any IP-based logic (Rate Limiting, IP Whitelisting) is ineffective behind a proxy and can lead to self-DoS (blocking all users).
**Prevention:** Always verify `app.set('trust proxy', 1)` (or appropriate value) in `main.ts` for any application intended to run behind a reverse proxy.

## 2024-04-16 - Absolute Path Injection in FilesService
**Vulnerability:** A local file inclusion (LFI) vulnerability was found in the `FilesService` due to the use of `path.join` along with a simple `.includes("..")` string check. This allowed an attacker to retrieve arbitrary system files (like `/etc/passwd`) by providing absolute paths, as `path.join` normalizes absolute paths by appending them directly (e.g., `path.join('/app/uploads', '/etc/passwd')` becomes `/app/uploads/etc/passwd`).
**Learning:** `path.join` does not evaluate absolute paths the same way the OS does, leading to simple bypasses of string-based boundary checks. When checking file paths dynamically built from user inputs, `path.resolve` must be used to get the true absolute path.
**Prevention:** Always use `path.resolve` to combine base paths with user-provided filenames, and explicitly check if the resolved `targetPath` strictly `startsWith` the expected `basePath` plus the OS-specific directory separator (`path.sep`). Ensure that absolute path injections are also unit tested.
