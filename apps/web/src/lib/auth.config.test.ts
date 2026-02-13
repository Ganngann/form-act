import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getJwtSecretKey } from './auth.config';

describe('getJwtSecretKey', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the secret when JWT_SECRET is defined', () => {
    process.env.JWT_SECRET = 'my-secret';
    process.env.NODE_ENV = 'development';
    const secret = getJwtSecretKey();
    expect(secret).toEqual(new TextEncoder().encode('my-secret'));
  });

  it('should return default secret when JWT_SECRET is undefined and NODE_ENV is not production', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    const secret = getJwtSecretKey();
    expect(secret).toEqual(new TextEncoder().encode('super-secret-key'));
  });

  it('should throw error when JWT_SECRET is undefined and NODE_ENV is production', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    expect(() => getJwtSecretKey()).toThrow('JWT_SECRET is not defined in production environment.');
  });
});
