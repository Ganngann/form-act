import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class LoginThrottlerGuard implements CanActivate {
  // Use a static map to persist state across requests if the guard is instantiated per request
  private static attempts = new Map<string, { count: number; expiresAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Simple IP extraction. In production behind a proxy, this might need adjustment
    // (e.g., trusting X-Forwarded-For if configured securely).
    // For now, we use a best-effort approach to avoid blocking all users if behind a proxy without config.
    const xForwardedFor = request.headers['x-forwarded-for'];
    const ip = xForwardedFor
      ? typeof xForwardedFor === 'string'
        ? xForwardedFor.split(',')[0]
        : xForwardedFor[0]
      : request.ip || 'unknown';

    const now = Date.now();

    // Cleanup expired entries (1% chance) to prevent memory leak
    if (Math.random() < 0.01) {
      for (const [key, value] of LoginThrottlerGuard.attempts.entries()) {
        if (value.expiresAt < now) {
          LoginThrottlerGuard.attempts.delete(key);
        }
      }
    }

    let record = LoginThrottlerGuard.attempts.get(ip);

    // If record exists but expired, treat as new
    if (record && record.expiresAt < now) {
      LoginThrottlerGuard.attempts.delete(ip);
      record = undefined;
    }

    if (record) {
      if (record.count >= 5) {
        throw new HttpException(
          'Too many login attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      record.count++;
    } else {
      LoginThrottlerGuard.attempts.set(ip, {
        count: 1,
        expiresAt: now + 60000,
      }); // 1 minute window
    }

    return true;
  }
}
