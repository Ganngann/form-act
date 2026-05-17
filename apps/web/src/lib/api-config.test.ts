import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSiteConfig, updateSiteConfig } from './api-config';
import { API_URL } from './config';

describe('api-config', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getSiteConfig', () => {
    it('returns null and logs error if fetch throws', async () => {
      const mockError = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(mockError);

      const result = await getSiteConfig('HOME_PAGE_CONTENT');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error fetching config for HOME_PAGE_CONTENT:', mockError);
    });

    it('returns null and logs error if JSON parse fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid json'),
      } as Response);

      const result = await getSiteConfig('HOME_PAGE_CONTENT');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid JSON for HOME_PAGE_CONTENT:', 'invalid json');
    });

    it('returns null if response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      const result = await getSiteConfig('HOME_PAGE_CONTENT');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch config for HOME_PAGE_CONTENT: Not Found');
    });

    it('returns parsed JSON if fetch is successful', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"title":"Test"}'),
      } as Response);

      const result = await getSiteConfig('HOME_PAGE_CONTENT');

      expect(result).toEqual({ title: 'Test' });
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('updateSiteConfig', () => {
    it('returns false and logs error if fetch throws', async () => {
      const mockError = new Error('Network error');
      vi.mocked(fetch).mockRejectedValueOnce(mockError);

      const result = await updateSiteConfig('HOME_PAGE_CONTENT', { title: 'Test' });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error updating config for HOME_PAGE_CONTENT:', mockError);
    });

    it('returns false and logs error if response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid data'),
      } as Response);

      const result = await updateSiteConfig('HOME_PAGE_CONTENT', { title: 'Test' });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to update config for HOME_PAGE_CONTENT: Bad Request', 'Invalid data');
    });

    it('returns true if fetch is successful', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await updateSiteConfig('HOME_PAGE_CONTENT', { title: 'Test' });

      expect(result).toBe(true);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
