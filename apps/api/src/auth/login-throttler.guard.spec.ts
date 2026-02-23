import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;
  let mockContext: ExecutionContext;

  const createMockContext = (ip: string) =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip,
          socket: { remoteAddress: ip },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    // Reset static storage before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).storage.clear();

    guard = new LoginThrottlerGuard();

    mockContext = createMockContext("127.0.0.1");
  });

  it("should allow first 5 requests", () => {
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(mockContext)).toBe(true);
    }
  });

  it("should block 6th request", () => {
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
  });

  it("should reset after TTL", () => {
    jest.useFakeTimers();
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);

    // Advance time by 61 seconds
    jest.advanceTimersByTime(61000);

    expect(guard.canActivate(mockContext)).toBe(true);
    jest.useRealTimers();
  });

  it("should cleanup expired entries correctly", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = (LoginThrottlerGuard as any).storage;
    const now = Date.now();

    // Entry 1: Expired
    storage.set("1.1.1.1", { count: 1, expiresAt: now - 1000 });
    // Entry 2: Not Expired
    storage.set("2.2.2.2", { count: 1, expiresAt: now + 5000 });
    // Entry 3: Not Expired
    storage.set("3.3.3.3", { count: 1, expiresAt: now + 6000 });

    // Trigger cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (guard as any).cleanup();

    expect(storage.has("1.1.1.1")).toBe(false);
    expect(storage.has("2.2.2.2")).toBe(true);
    expect(storage.has("3.3.3.3")).toBe(true);
  });

  it("should maintain insertion order when resetting expired entries", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = (LoginThrottlerGuard as any).storage;
    jest.useFakeTimers();

    const ctx1 = createMockContext("1.1.1.1");
    const ctx2 = createMockContext("2.2.2.2");

    // Add entry 1
    guard.canActivate(ctx1);
    // Add entry 2 slightly later
    jest.advanceTimersByTime(1000);
    guard.canActivate(ctx2);

    // Check order: 1, 2
    expect(Array.from(storage.keys())).toEqual(["1.1.1.1", "2.2.2.2"]);

    // Advance time so entry 1 expires but entry 2 doesn't (assuming TTL 60s)
    // Entry 1 expires at T+60. Entry 2 at T+61.
    // Advance to T+60.5
    jest.advanceTimersByTime(59500);

    // Trigger canActivate for 1. It should reset and move to end.
    guard.canActivate(ctx1);

    // Check order: 2, 1
    expect(Array.from(storage.keys())).toEqual(["2.2.2.2", "1.1.1.1"]);

    jest.useRealTimers();
  });
});
