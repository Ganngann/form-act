import { API_URL } from '@/lib/config';
import { EmailTemplate, UpdateEmailTemplateData } from '@/types/email-template';

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

export const adminEmailsService = {
  getEmailTemplates: (): Promise<EmailTemplate[]> => fetchWithAuth('/email-templates'),

  getTemplate: (type: string): Promise<EmailTemplate> => fetchWithAuth(`/email-templates/${type}`),

  updateTemplate: (type: string, data: UpdateEmailTemplateData): Promise<EmailTemplate> =>
    fetchWithAuth(`/email-templates/${type}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
