import { Test, TestingModule } from "@nestjs/testing";
import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginThrottlerGuard],
    }).compile();

    guard = module.get<LoginThrottlerGuard>(LoginThrottlerGuard);
    // Reset static map before each test
    (LoginThrottlerGuard as any).attempts.clear();
  });

  const mockContext = (ip: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow first request", () => {
    const context = mockContext("127.0.0.1");
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should block after 5 attempts", () => {
    const context = mockContext("127.0.0.1");
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it("should allow different IPs independently", () => {
    const context1 = mockContext("127.0.0.1");
    const context2 = mockContext("127.0.0.2");

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context1)).toBe(true);
    }
    expect(() => guard.canActivate(context1)).toThrow(HttpException);

    // IP 2 should still be allowed
    expect(guard.canActivate(context2)).toBe(true);
  });

  it("should reset after expiration", async () => {
    const context = mockContext("127.0.0.1");

    // Simulate expiration by mocking Date.now
    const realDateNow = Date.now;
    let time = 1000;
    global.Date.now = jest.fn(() => time);

    // Fill up attempts
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    // Fast forward time > 60 seconds
    time += 61000;

    // Should be allowed again
    expect(guard.canActivate(context)).toBe(true);

    // Restore Date.now
    global.Date.now = realDateNow;
  });
});
