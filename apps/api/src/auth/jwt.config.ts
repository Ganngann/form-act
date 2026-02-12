export const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  // If in production and no secret is set, this is a critical security vulnerability.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET environment variable is not defined in production.',
    );
  }

  // In development/test, we can fallback to a default but log a warning (unless in test env).
  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      'WARNING: JWT_SECRET is not defined. Using default insecure secret "super-secret-key" for development.',
    );
  }

  return 'super-secret-key';
};
