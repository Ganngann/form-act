import { LoginThrottlerGuard } from './login-throttler.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('LoginThrottlerGuard', () => {
  let guard: LoginThrottlerGuard;

  beforeEach(() => {
    guard = new LoginThrottlerGuard();
    // Clear the static map before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LoginThrottlerGuard as any).attempts.clear();
  });

  const createMockContext = (ip: string, xForwardedFor?: string | string[]) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
          headers: {
            'x-forwarded-for': xForwardedFor,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request if under limit', () => {
    const context = createMockContext('127.0.0.1');
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should block request if over limit', () => {
    const context = createMockContext('127.0.0.1');
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it('should treat different IPs separately', () => {
    const context1 = createMockContext('127.0.0.1');
    const context2 = createMockContext('127.0.0.2');

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context1)).toBe(true);
    }
    expect(() => guard.canActivate(context1)).toThrow(HttpException);

    // IP 2 should still be allowed
    expect(guard.canActivate(context2)).toBe(true);
  });

  it('should reset after window expires', async () => {
    const context = createMockContext('127.0.0.1');

    // Mock Date.now
    const realDateNow = Date.now;
    const now = 1000000;
    global.Date.now = jest.fn(() => now);

    // 5 attempts
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    // Fast forward time
    global.Date.now = jest.fn(() => now + 61000);

    // Should be allowed now
    expect(guard.canActivate(context)).toBe(true);

    global.Date.now = realDateNow;
  });

  it('should use x-forwarded-for if available', () => {
     const context = createMockContext('127.0.0.1', '10.0.0.1');
     // Should use 10.0.0.1
     for (let i = 0; i < 5; i++) {
        guard.canActivate(context);
     }
     expect(() => guard.canActivate(context)).toThrow(HttpException);

     // Same proxy IP but different client IP in x-forwarded-for
     const context2 = createMockContext('127.0.0.1', '10.0.0.2');
     expect(guard.canActivate(context2)).toBe(true);
  });
});
