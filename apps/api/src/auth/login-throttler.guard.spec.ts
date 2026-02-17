import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;

  // Mock ExecutionContext
  const createMockContext = (ip: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ ip }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new LoginThrottlerGuard();
    // Clear static attempts map between tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).attempts.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow request if under limit", () => {
    const context = createMockContext("127.0.0.1");
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should increment count for same IP", () => {
    const context = createMockContext("127.0.0.1");

    guard.canActivate(context); // 1
    guard.canActivate(context); // 2

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attempts = (LoginThrottlerGuard as any).attempts;
    // Map stores { count, expires }
    expect(attempts.get("127.0.0.1").count).toBe(2);
  });

  it("should block request if limit exceeded", () => {
    const context = createMockContext("127.0.0.1");

    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    // 6th attempt should fail
    expect(() => guard.canActivate(context)).toThrow(HttpException);
    try {
      guard.canActivate(context);
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe(
          "Too many requests. Please try again later.",
        );
        expect(error.getStatus()).toBe(429);
      } else {
        throw error;
      }
    }
  });

  it("should track different IPs separately", () => {
    const context1 = createMockContext("127.0.0.1");
    const context2 = createMockContext("192.168.1.1");

    for (let i = 0; i < 5; i++) {
      guard.canActivate(context1);
    }

    // IP 1 is blocked
    expect(() => guard.canActivate(context1)).toThrow(HttpException);

    // IP 2 is still allowed
    expect(guard.canActivate(context2)).toBe(true);
  });

  it("should reset count after TTL", () => {
    const context = createMockContext("127.0.0.1");

    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    // Blocked now
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    // Advance time by 61 seconds
    jest.advanceTimersByTime(61000);

    // Should be allowed again
    expect(guard.canActivate(context)).toBe(true);
  });
});
