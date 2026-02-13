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

  it('should throw error when JWT_SECRET is undefined, regardless of environment', () => {
    delete process.env.JWT_SECRET;

    // Test in development
    process.env.NODE_ENV = 'development';
    expect(() => getJwtSecretKey()).toThrow('JWT_SECRET environment variable is not defined');

    // Test in production
    process.env.NODE_ENV = 'production';
    expect(() => getJwtSecretKey()).toThrow('JWT_SECRET environment variable is not defined');
  });
});
