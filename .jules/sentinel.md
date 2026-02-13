## 2024-05-22 - Missing Global Validation Pipe
**Vulnerability:** The NestJS API lacked a global `ValidationPipe` in `main.ts`, meaning DTO validation decorators (like `@IsEmail`) were ignored at runtime, allowing invalid data to reach controllers.
**Learning:** `class-validator` decorators in NestJS do nothing unless a `ValidationPipe` is activated (globally or per-handler). The default `NestFactory.create` does not enable this.
**Prevention:** Always verify `main.ts` includes `app.useGlobalPipes(new ValidationPipe(...))` and include an integration test that specifically sends invalid data to ensure validation is active.
