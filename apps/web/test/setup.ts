import '@testing-library/jest-dom/vitest';

// Set a default JWT_SECRET for tests to avoid failures when auth config is used
process.env.JWT_SECRET = 'test-secret';
