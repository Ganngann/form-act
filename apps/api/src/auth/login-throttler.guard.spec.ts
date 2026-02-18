import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;
  let context: ExecutionContext;

  beforeEach(() => {
    guard = new LoginThrottlerGuard();
    // Access private static property to clear it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).attempts.clear();

    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: "127.0.0.1",
        }),
      }),
    } as unknown as ExecutionContext;
  });

  it("should allow requests under the limit", () => {
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true); // 5th attempt
  });

  it("should block requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it("should reset count after expiry", async () => {
    // Fill up attempts
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    // Mock Date.now to fast forward time
    const realDateNow = Date.now.bind(global.Date);
    const future = realDateNow() + 61000;
    global.Date.now = jest.fn(() => future);

    // Should work now
    expect(guard.canActivate(context)).toBe(true);

    // Restore Date.now
    global.Date.now = realDateNow;
  });

  it("should handle multiple IPs independently", () => {
    const context2 = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: "192.168.1.1",
        }),
      }),
    } as unknown as ExecutionContext;

    // IP 1 fills up
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    // IP 2 should still be allowed
    expect(guard.canActivate(context2)).toBe(true);
  });

  it("should handle missing IP (unknown)", () => {
    const contextUnknown = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(contextUnknown)).toBe(true);
  });
});
