import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  // Store IP -> [timestamp1, timestamp2, ...]
  private static ipRequests = new Map<string, number[]>();
  private readonly LIMIT = 5; // 5 attempts
  private readonly TTL = 60 * 1000; // 1 minute window

  canActivate(context: ExecutionContext): boolean {
    // Memory leak prevention: 1% chance to clean up expired entries
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    const req = context.switchToHttp().getRequest();
    // Use req.ip which handles 'trust proxy' correctly if configured in main.ts
    // Do NOT rely on x-forwarded-for manually to avoid spoofing
    const ip = req.ip || req.connection.remoteAddress;

    const now = Date.now();
    const timestamps = LoginThrottlerGuard.ipRequests.get(ip) || [];

    // Filter out old timestamps (pruning active user entries)
    const windowStart = now - this.TTL;
    const activeTimestamps = timestamps.filter((time) => time > windowStart);

    if (activeTimestamps.length >= this.LIMIT) {
      throw new HttpException(
        "Too many login attempts. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    activeTimestamps.push(now);
    LoginThrottlerGuard.ipRequests.set(ip, activeTimestamps);

    return true;
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.TTL;
    for (const [ip, timestamps] of LoginThrottlerGuard.ipRequests.entries()) {
      // Since timestamps are sorted, check the last one
      const lastTime = timestamps[timestamps.length - 1];
      if (lastTime <= windowStart) {
        LoginThrottlerGuard.ipRequests.delete(ip);
      }
    }
  }
}
