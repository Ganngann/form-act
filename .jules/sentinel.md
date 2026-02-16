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

## 2026-02-16 - Missing Trust Proxy for Rate Limiting
**Vulnerability:** The API implemented rate limiting but failed to enable `trust proxy` in `main.ts`. When deployed behind a load balancer or proxy, `req.ip` defaults to the proxy's IP, causing the rate limiter to block all users after a few failed attempts by anyone (or fail to limit individual attackers properly).
**Learning:** Rate limiting logic that relies on `req.ip` is fundamentally flawed in production environments unless the application is explicitly configured to trust the `X-Forwarded-For` header from the upstream proxy.
**Prevention:** Always verify `app.getHttpAdapter().getInstance().set('trust proxy', 1)` (or equivalent for Fastify) is present in `main.ts` when implementing IP-based security controls. Add an integration test that simulates `X-Forwarded-For` headers to verify correct IP resolution.
