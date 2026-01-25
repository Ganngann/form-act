import { API_URL } from '@/lib/config';
import { Formation, CreateFormationData, UpdateFormationData, Category, Expertise } from '@/types/formation';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
}

export const adminFormationsService = {
  getFormations: (): Promise<Formation[]> => fetchWithAuth('/admin/formations'),
<<<<<<< HEAD

  getExpertises: (): Promise<Expertise[]> => fetchWithAuth('/expertises'),

  getCategories: (): Promise<Category[]> => fetchWithAuth('/categories'),

  createFormation: (data: CreateFormationData): Promise<Formation> =>
=======

  getExpertises: (): Promise<Expertise[]> => fetchWithAuth('/expertises'),

  getCategories: (): Promise<Category[]> => fetchWithAuth('/categories'),

  createFormation: (data: CreateFormationData): Promise<Formation> =>
>>>>>>> 5de36c41870330207a2d22f594d9c5ea644f4144
    fetchWithAuth('/admin/formations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFormation: (id: string, data: UpdateFormationData): Promise<Formation> =>
    fetchWithAuth(`/admin/formations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteFormation: (id: string): Promise<void> =>
    fetchWithAuth(`/admin/formations/${id}`, {
      method: 'DELETE',
    }),
};
