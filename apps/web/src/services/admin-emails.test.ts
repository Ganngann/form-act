import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminEmailsService } from './admin-emails';
import { API_URL } from '@/lib/config';

describe('adminEmailsService', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSuccess = (data: any) => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });
  };

  const mockError = (status: number, message: string) => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Error',
      json: () => Promise.resolve({ message }),
    });
  };

  describe('getEmailTemplates', () => {
    it('should fetch email templates successfully', async () => {
      const mockData = [{ id: '1', type: 'WELCOME', subject: 'Welcome', body: 'Hello' }];
      mockSuccess(mockData);

      const result = await adminEmailsService.getEmailTemplates();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/email-templates`, expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      }));
    });

    it('should handle API errors', async () => {
      mockError(400, 'Bad Request');

      await expect(adminEmailsService.getEmailTemplates()).rejects.toThrow('Bad Request');
    });

    it('should handle API errors with invalid JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(adminEmailsService.getEmailTemplates()).rejects.toThrow('An error occurred');
    });

    it('should handle API errors with JSON response but no message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Some other error format' }),
      });

      await expect(adminEmailsService.getEmailTemplates()).rejects.toThrow('Bad Request');
    });
  });

  describe('getTemplate', () => {
    it('should fetch template successfully', async () => {
      const mockData = { id: '1', type: 'WELCOME', subject: 'Welcome', body: 'Hello' };
      mockSuccess(mockData);

      const result = await adminEmailsService.getTemplate('WELCOME');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/email-templates/WELCOME`, expect.anything());
    });

    it('should handle API errors', async () => {
      mockError(404, 'Not Found');

      await expect(adminEmailsService.getTemplate('UNKNOWN')).rejects.toThrow('Not Found');
    });
  });

  describe('updateTemplate', () => {
    it('should update template successfully', async () => {
      const mockData = { id: '1', type: 'WELCOME', subject: 'Updated Welcome', body: 'Hello' };
      const inputData = { subject: 'Updated Welcome' };
      mockSuccess(mockData);

      const result = await adminEmailsService.updateTemplate('WELCOME', inputData);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/email-templates/WELCOME`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(inputData),
      }));
    });

    it('should handle API errors', async () => {
      mockError(400, 'Bad Request');

      await expect(adminEmailsService.updateTemplate('WELCOME', {})).rejects.toThrow('Bad Request');
    });
  });

  describe('sendTestEmail', () => {
    it('should send test email successfully', async () => {
      const mockData = { success: true };
      const inputData = { email: 'test@example.com' };
      mockSuccess(mockData);

      const result = await adminEmailsService.sendTestEmail('WELCOME', inputData);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/email-templates/WELCOME/test`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(inputData),
      }));
    });

    it('should handle API errors', async () => {
      mockError(400, 'Bad Request');

      await expect(adminEmailsService.sendTestEmail('WELCOME', { email: 'test@example.com' })).rejects.toThrow('Bad Request');
    });
  });
});
