import { render, screen, waitFor } from '@testing-library/react';
import { AdminBillingControls } from './admin-billing-controls';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

// Mock API_URL
vi.mock('@/lib/config', () => ({
    API_URL: 'http://api.test',
}));

describe('AdminBillingControls', () => {
    const mockSession = {
        id: 's1',
        proofUrl: null,
        billedAt: null,
        billingData: null,
        client: {
            companyName: 'Test Corp',
            vatNumber: 'BE123',
            address: 'Street 1'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('renders "Indisponible" state when no proof is uploaded', () => {
        render(<AdminBillingControls session={mockSession} />);
        expect(screen.getByText('Facturation Indisponible')).toBeDefined();
        expect(screen.getByText(/En attente de preuve/i)).toBeDefined();
    });

    it('renders read-only billed state when already billed', () => {
        const billedSession = {
            ...mockSession,
            billedAt: '2026-02-13T10:00:00Z',
            billingData: JSON.stringify({
                basePrice: 500,
                optionsFee: 50,
                distanceFee: 20,
                adminAdjustment: -10,
                finalPrice: 560
            })
        };

        render(<AdminBillingControls session={billedSession} />);
        expect(screen.getByText('Session Facturée')).toBeDefined();
        expect(screen.getByText(/560/)).toBeDefined();
    });

    it('fetches and renders preview when proof is available', async () => {
        const proofSession = { ...mockSession, proofUrl: 'http://proof.com' };
        const mockPreview = {
            basePrice: 1000,
            optionsFee: 100,
            optionsDetails: ['Option 1'],
            distanceFee: 50
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockPreview
        });

        render(<AdminBillingControls session={proofSession} />);

        await waitFor(() => {
            expect(screen.getAllByText(/1000/).length).toBeGreaterThan(0);
            expect(screen.getByText('Option 1')).toBeDefined();
        });

        // Check total: 1000 + 100 + 50 = 1150
        expect(screen.getAllByText(/1150/).length).toBeGreaterThan(0);
    });

    it('updates total when distance or adjustment changes', async () => {
        const user = userEvent.setup();
        const proofSession = { ...mockSession, proofUrl: 'http://proof.com' };
        const mockPreview = {
            basePrice: 1000,
            optionsFee: 0,
            optionsDetails: [],
            distanceFee: 0
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockPreview
        });

        render(<AdminBillingControls session={proofSession} />);

        await waitFor(() => expect(screen.getAllByText(/1000/).length).toBeGreaterThan(0));

        const distanceInput = screen.getByLabelText(/Frais Déplacement/i);
        await user.clear(distanceInput);
        await user.type(distanceInput, '100');

        const adjustmentInput = screen.getByLabelText(/Ajustement/i);
        await user.type(adjustmentInput, '50');

        // Total should be 1000 + 100 + 50 = 1150
        expect(screen.getAllByText(/1150/).length).toBeGreaterThan(0);
    });

    it('submits billing data when clicking Valider', async () => {
        const user = userEvent.setup();
        const proofSession = { ...mockSession, proofUrl: 'http://proof.com' };
        const mockPreview = {
            basePrice: 1000,
            optionsFee: 0,
            optionsDetails: [],
            distanceFee: 0
        };

        (global.fetch as any)
            .mockResolvedValueOnce({ ok: true, json: async () => mockPreview }) // preview
            .mockResolvedValueOnce({ ok: true }); // billing submission

        render(<AdminBillingControls session={proofSession} />);

        await waitFor(() => {
            expect(screen.getAllByText(/1000/).length).toBeGreaterThan(0);
        });

        await user.click(screen.getByText(/Valider & Envoyer/i));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/bill'),
                expect.objectContaining({ method: 'POST' })
            );
        });
    });
});
