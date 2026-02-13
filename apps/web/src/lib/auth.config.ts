export const getJwtSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return new TextEncoder().encode(secret);
};
