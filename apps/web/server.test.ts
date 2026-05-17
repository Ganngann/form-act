import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as http from 'http';
import * as url from 'url';
import next from 'next';

vi.mock('http');
vi.mock('url');
vi.mock('next');

describe('server.js', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    originalEnv = process.env;
    process.env = { ...originalEnv, PORT: '3001' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  async function setupServerTest(handleRejects = false) {
    const mockListen = vi.fn().mockImplementation((port, cb) => {
      if (cb) cb();
      return { on: vi.fn() };
    });

    vi.mocked(http.createServer).mockReturnValue({ listen: mockListen } as any);
    vi.mocked(url.parse).mockReturnValue({ pathname: '/test' } as any);

    const mockHandle = vi.fn();
    if (handleRejects) {
      mockHandle.mockRejectedValueOnce(new Error('Test error'));
    } else {
      mockHandle.mockResolvedValueOnce(undefined);
    }
    const mockPrepare = vi.fn().mockResolvedValue(undefined);

    vi.mocked(next).mockReturnValue({
      getRequestHandler: () => mockHandle,
      prepare: mockPrepare
    } as any);

    // Using evaluate is actually the safest way to isolate CJS script execution
    // across multiple tests without leaking state, but we need to supply module wrapper correctly.
    // Vitest has issues reloading standard CJS side-effect scripts when vi.resetModules is used.

    const fs = await import('fs');
    const path = await import('path');
    const code = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

    // We wrap it in a function that provides the requires
    const requireMock = (mod: string) => {
        if (mod === 'http') return http;
        if (mod === 'url') return url;
        if (mod === 'next') return next;
        return require(mod);
    };

    // Evaluate in a closure
    const wrapper = new Function('require', 'process', 'console', code);
    wrapper(requireMock, process, console);

    await new Promise(resolve => setTimeout(resolve, 50));

    return { mockHandle };
  }

  it('should handle requests successfully', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { mockHandle } = await setupServerTest(false);

    expect(http.createServer).toHaveBeenCalled();
    const requestHandler = vi.mocked(http.createServer).mock.calls[0][0] as Function;

    const req = { url: '/test', headers: {} };
    const res = { statusCode: 200, end: vi.fn() };

    await requestHandler(req, res);

    expect(req.headers['x-forwarded-proto']).toBe('https');
    expect(mockHandle).toHaveBeenCalledWith(req, res, { pathname: '/test' });

    consoleLogSpy.mockRestore();
  });

  it('should catch errors and return 500 status', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { mockHandle } = await setupServerTest(true);

    const requestHandler = vi.mocked(http.createServer).mock.calls[0][0] as Function;

    const req = { url: '/test', headers: {} };
    const res = { statusCode: 200, end: vi.fn() };

    await requestHandler(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred handling', '/test', expect.any(Error));
    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith('internal server error');

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
