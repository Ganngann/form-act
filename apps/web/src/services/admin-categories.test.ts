import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminCategoriesService } from './admin-categories';
import { API_URL } from '@/lib/config';

describe('adminCategoriesService', () => {
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
      status: status,
      statusText: 'Error',
      json: () => Promise.resolve({ message }),
    });
  };

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockData = [{ id: '1', name: 'Test Category' }];
      mockSuccess(mockData);

      const result = await adminCategoriesService.getCategories();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/categories`, expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      }));
    });

    it('should handle API errors', async () => {
      mockError(400, 'Bad Request');

      await expect(adminCategoriesService.getCategories()).rejects.toThrow('Bad Request');
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const mockData = { id: '1', name: 'New Category' };
      const inputData = { name: 'New Category' } as any;
      mockSuccess(mockData);

      const result = await adminCategoriesService.createCategory(inputData);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/categories`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(inputData),
      }));
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const mockData = { id: '1', name: 'Updated Category' };
      const inputData = { name: 'Updated Category' } as any;
      mockSuccess(mockData);

      const result = await adminCategoriesService.updateCategory('1', inputData);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/categories/1`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(inputData),
      }));
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mockSuccess({});

      await adminCategoriesService.deleteCategory('1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/categories/1`, expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
