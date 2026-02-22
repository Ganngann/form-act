import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EmailTemplatesManager } from './EmailTemplatesManager';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { adminEmailsService } from '@/services/admin-emails';

vi.mock('@/services/admin-emails', () => ({
  adminEmailsService: {
    getEmailTemplates: vi.fn(),
    updateTemplate: vi.fn(),
  },
}));

const mockTemplates = [
  {
    id: '1',
    type: 'TEST_TEMPLATE',
    subject: 'Test Subject',
    body: 'Test Body {{variable}}',
    variables: JSON.stringify(['variable']),
    updatedAt: new Date().toISOString(),
  },
];

describe('EmailTemplatesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (adminEmailsService.getEmailTemplates as any).mockResolvedValue(mockTemplates);
  });

  it('renders templates list', async () => {
    render(<EmailTemplatesManager />);

    await waitFor(() => {
      expect(screen.getByText('TEST_TEMPLATE')).toBeInTheDocument();
      expect(screen.getByText('Test Subject')).toBeInTheDocument();
    });
  });

  it('opens dialog on edit click', async () => {
    render(<EmailTemplatesManager />);

    await waitFor(() => screen.getByText('Modifier'));
    fireEvent.click(screen.getByText('Modifier'));

    await waitFor(() => {
      // Radix UI Dialog creates a portal, so checking role 'dialog' works
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Subject')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Body {{variable}}')).toBeInTheDocument();
    });
  });
});
