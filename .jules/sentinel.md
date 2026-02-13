## 2024-05-22 - Missing Global Validation Pipe
**Vulnerability:** The NestJS API lacked a global `ValidationPipe` in `main.ts`, meaning DTO validation decorators (like `@IsEmail`) were ignored at runtime, allowing invalid data to reach controllers.
**Learning:** `class-validator` decorators in NestJS do nothing unless a `ValidationPipe` is activated (globally or per-handler). The default `NestFactory.create` does not enable this.
**Prevention:** Always verify `main.ts` includes `app.useGlobalPipes(new ValidationPipe(...))` and include an integration test that specifically sends invalid data to ensure validation is active.

## 2025-05-30 - Insecure Random Filename Generation
**Vulnerability:** File uploads used `Math.random()` for generating filenames, which is not cryptographically secure and can lead to predictable filenames.
**Learning:** Developers often default to `Math.random()` for "random enough" strings, but for security-sensitive contexts (like unique IDs or filenames to prevent collisions/enumeration), `crypto.randomBytes` is required.
**Prevention:** Enforce usage of `crypto.randomBytes` or `uuid` for any random string generation via linting rules or code reviews.
