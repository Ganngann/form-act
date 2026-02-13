export const getFrontendUrl = (): string => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  // If in production and no frontend URL is set, this is a critical security/configuration issue.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FRONTEND_URL environment variable is not defined in production.",
    );
  }

  // In development/test, we can fallback to a default but log a warning (unless in test env).
  if (process.env.NODE_ENV !== "test") {
    console.warn(
      'WARNING: FRONTEND_URL is not defined. Using default "http://localhost:3000" for development.',
    );
  }

  return "http://localhost:3000";
};
