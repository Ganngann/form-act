import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(LoginThrottlerGuard.name);

  // Storage for IP tracking: IP -> { count, expiresAt }
  // Static to persist across guard instantiations if any
  private static readonly storage = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  private readonly LIMIT = 5; // Max 5 attempts
  private readonly TTL = 60 * 1000; // 60 seconds window

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    // Note: 'trust proxy' must be configured in main.ts for correct IP behind proxies
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // cleanup with 1% probability to avoid memory leaks
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    const now = Date.now();
    const record = LoginThrottlerGuard.storage.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        // Expired, reset
        LoginThrottlerGuard.storage.set(ip, {
          count: 1,
          expiresAt: now + this.TTL,
        });
      } else {
        // Active window
        if (record.count >= this.LIMIT) {
          this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: "Too many login attempts. Please try again later.",
              error: "Too Many Requests",
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        record.count++;
      }
    } else {
      // New record
      LoginThrottlerGuard.storage.set(ip, {
        count: 1,
        expiresAt: now + this.TTL,
      });
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of LoginThrottlerGuard.storage.entries()) {
      if (now > value.expiresAt) {
        LoginThrottlerGuard.storage.delete(key);
      }
    }
  }
}
