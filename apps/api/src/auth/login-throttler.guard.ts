import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  // Static map to persist state across requests (singleton behavior is default but static ensures it)
  // Key: IP address, Value: { count: attempts, expires: timestamp }
  private static attempts = new Map<
    string,
    { count: number; expires: number }
  >();

  private readonly LIMIT = 5;
  private readonly TTL = 60 * 1000; // 60 seconds

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Fallback to 'unknown' if ip is missing, though express usually provides it.
    // If behind proxy without trust proxy, this might be the proxy IP.
    const ip = request.ip || "unknown";

    this.cleanup();

    const now = Date.now();
    const record = LoginThrottlerGuard.attempts.get(ip);

    if (record && now < record.expires) {
      if (record.count >= this.LIMIT) {
        throw new HttpException(
          "Too many requests. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      record.count++;
    } else {
      // New record or expired
      LoginThrottlerGuard.attempts.set(ip, {
        count: 1,
        expires: now + this.TTL,
      });
    }

    return true;
  }

  /**
   * probabilistic cleanup to prevent memory leaks
   * 1% chance to run cleanup on each request
   */
  private cleanup() {
    if (Math.random() < 0.01) {
      const now = Date.now();
      for (const [ip, record] of LoginThrottlerGuard.attempts.entries()) {
        if (now > record.expires) {
          LoginThrottlerGuard.attempts.delete(ip);
        }
      }
    }
  }
}
