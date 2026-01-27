import { API_URL } from '@/lib/config';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/formation';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
}

export const adminCategoriesService = {
  getCategories: (): Promise<Category[]> => fetchWithAuth('/categories'),

  createCategory: (data: CreateCategoryData): Promise<Category> =>
    fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: UpdateCategoryData): Promise<Category> =>
    fetchWithAuth(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string): Promise<void> =>
    fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
