import { API_URL } from './config';

describe('Config', () => {
  it('exports API_URL', () => {
    // It might be process.env.NEXT_PUBLIC_API_URL or default
    // We can just check it is a string
    expect(typeof API_URL).toBe('string');
  });
});
