import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  // Simple in-memory storage for rate limiting
  // Key: IP address, Value: { count: number, expiresAt: number }
  private static readonly attempts = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  // Configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 60 * 1000; // 60 seconds

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || "unknown";

    // Clean up expired entries occasionally (1% chance per request)
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    const now = Date.now();
    const record = LoginThrottlerGuard.attempts.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        // Expired, reset
        LoginThrottlerGuard.attempts.set(ip, {
          count: 1,
          expiresAt: now + this.WINDOW_MS,
        });
      } else {
        // Not expired, check limit
        if (record.count >= this.MAX_ATTEMPTS) {
          throw new HttpException(
            "Too many login attempts. Please try again later.",
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        // Increment
        record.count++;
      }
    } else {
      // New entry
      LoginThrottlerGuard.attempts.set(ip, {
        count: 1,
        expiresAt: now + this.WINDOW_MS,
      });
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of LoginThrottlerGuard.attempts.entries()) {
      if (now > value.expiresAt) {
        LoginThrottlerGuard.attempts.delete(key);
      }
    }
  }
}
