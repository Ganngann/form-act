import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  // Use a Map to store request counts per IP
  // Key: IP address
  // Value: { count: number, expiresAt: number }
  private static attempts = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  // Configuration
  private readonly LIMIT = 5; // Max 5 attempts
  private readonly TTL = 60 * 1000; // 60 seconds in milliseconds

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Get IP address, fallback to 'unknown' if not available
    // Note: If behind a proxy, this might require 'trust proxy' setting in main.ts
    const ip = request.ip || "unknown";
    const now = Date.now();

    // Probabilistic cleanup (1% chance) to prevent memory leaks
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    const record = LoginThrottlerGuard.attempts.get(ip);

    if (record) {
      // Check if the record has expired
      if (now > record.expiresAt) {
        // Expired, reset the counter
        LoginThrottlerGuard.attempts.set(ip, {
          count: 1,
          expiresAt: now + this.TTL,
        });
        return true;
      }

      // Check if limit exceeded
      if (record.count >= this.LIMIT) {
        throw new HttpException(
          "Too many login attempts. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment count
      record.count++;
    } else {
      // New record
      LoginThrottlerGuard.attempts.set(ip, {
        count: 1,
        expiresAt: now + this.TTL,
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
