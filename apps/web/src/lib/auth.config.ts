export const getJwtSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not defined in production environment.');
    }
    // In development/test, fallback to default but warn (optional, maybe not in edge)
    return new TextEncoder().encode('super-secret-key');
  }

  return new TextEncoder().encode(secret);
};
