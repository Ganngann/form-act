import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    // Reset static storage before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).storage.clear();

    guard = new LoginThrottlerGuard();

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: "127.0.0.1",
          socket: { remoteAddress: "127.0.0.1" },
        }),
      }),
    } as unknown as ExecutionContext;
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
});
