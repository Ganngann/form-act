import { Test, TestingModule } from "@nestjs/testing";
import { LoginThrottlerGuard } from "./login-throttler.guard";
import { ExecutionContext, HttpStatus, HttpException } from "@nestjs/common";

describe("LoginThrottlerGuard", () => {
  let guard: LoginThrottlerGuard;
  let mockContext: Partial<ExecutionContext>;
  let mockRequest: {
    headers: Record<string, string>;
    connection: { remoteAddress: string };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginThrottlerGuard],
    }).compile();

    guard = module.get<LoginThrottlerGuard>(LoginThrottlerGuard);

    mockRequest = {
      headers: {},
      connection: { remoteAddress: "127.0.0.1" },
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    // Reset static map between tests to ensure isolation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).ipRequests.clear();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow request under limit", () => {
    mockRequest.connection.remoteAddress = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    }
  });

  it("should block request over limit", () => {
    mockRequest.connection.remoteAddress = "5.6.7.8";
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext as ExecutionContext);
    }

    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
      new HttpException(
        "Too many login attempts. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );
  });

  it("should reset after TTL", async () => {
    mockRequest.connection.remoteAddress = "9.10.11.12";

    // Fill up the bucket
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext as ExecutionContext);
    }

    // Mock Date.now to be in the future
    const realDateNow = Date.now;
    const futureTime = realDateNow() + 61000; // 61 seconds later
    global.Date.now = jest.fn(() => futureTime);

    // Should be allowed now
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);

    // Restore Date.now
    global.Date.now = realDateNow;
  });

  it("should cleanup expired entries", () => {
    mockRequest.connection.remoteAddress = "9.9.9.9";
    // Add entry
    guard.canActivate(mockContext as ExecutionContext);

    // Check map size
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = (LoginThrottlerGuard as any).ipRequests;
    expect(map.size).toBe(1);

    // Mock Date.now to be in the future
    const realDateNow = Date.now;
    const futureTime = realDateNow() + 61000;
    global.Date.now = jest.fn(() => futureTime);

    // Mock Math.random to force cleanup
    const realRandom = Math.random;
    global.Math.random = jest.fn(() => 0.005);

    // Use a DIFFERENT IP to trigger cleanup but not re-add 9.9.9.9
    mockRequest.connection.remoteAddress = "8.8.8.8";
    guard.canActivate(mockContext as ExecutionContext);

    expect(map.has("9.9.9.9")).toBe(false);
    expect(map.has("8.8.8.8")).toBe(true);

    // Restore
    global.Date.now = realDateNow;
    global.Math.random = realRandom;
  });
});
