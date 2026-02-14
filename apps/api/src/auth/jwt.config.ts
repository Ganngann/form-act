export const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  // Allow default only in test environment for convenience
  if (process.env.NODE_ENV === "test") {
    return "test-secret";
  }

  // In all other environments (production, development, staging), we require a secret.
  throw new Error("JWT_SECRET environment variable is not defined.");
};
