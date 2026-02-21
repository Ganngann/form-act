import { render, screen } from '@testing-library/react';
import SessionDetailPage from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { notFound } from 'next/navigation';

// Mock next/headers
const mockCookieGet = vi.fn().mockReturnValue({ value: 'token' });
vi.mock('next/headers', () => ({
    cookies: () => ({
        get: mockCookieGet,
    }),
}));

vi.mock('next/navigation', () => ({
    notFound: vi.fn().mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
    }),
    useRouter: vi.fn().mockReturnValue({
        push: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
    }),
}));

// Mock components
vi.mock('@/components/admin/admin-session-controls', () => ({
    AdminSessionControls: () => <div data-testid="admin-session-controls" />,
}));
vi.mock('@/components/admin/admin-billing-controls', () => ({
    AdminBillingControls: () => <div data-testid="admin-billing-controls" />,
}));
vi.mock('@/components/ui/status-badge', () => ({
    StatusBadge: ({ status }: any) => <div data-testid="status-badge">{status}</div>,
}));

// Mock icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>Icon</span>,
    MapPin: () => <span>Icon</span>,
    Calendar: () => <span>Icon</span>,
    Clock: () => <span>Icon</span>,
    User: () => <span>Icon</span>,
    Users: () => <span>Icon</span>,
    Package: () => <span>Icon</span>,
    Tv: () => <span>Icon</span>,
    Wifi: () => <span>Icon</span>,
    FileText: () => <span>Icon</span>,
    Building2: () => <span>Icon</span>,
    Edit2: () => <span>Icon</span>,
    Save: () => <span>Icon</span>,
    Send: () => <span>Icon</span>,
    Check: () => <span>Icon</span>,
}));

describe('SessionDetailPage', () => {
    const mockSession = {
        id: 's1',
        status: 'CONFIRMED',
        date: '2026-05-20T00:00:00.000Z',
        slot: 'AM',
        location: '123 Test St',
        logistics: JSON.stringify({
            wifi: 'yes',
            subsidies: 'no',
            videoMaterial: ['Projector'],
            writingMaterial: ['Whiteboard'],
            accessDetails: 'Gate 5'
        }),
        participants: JSON.stringify([
            { firstName: 'John', lastName: 'Doe', email: 'john@doe.com' }
        ]),
        formation: {
            title: 'Advanced Training',
            category: { name: 'IT' },
            durationType: 'HALF_DAY'
        },
        client: {
            companyName: 'Test Corp',
            user: { email: 'client@test.com' }
        },
        trainer: {
            firstName: 'Jane',
            lastName: 'Trainer',
            email: 'jane@trainer.com'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('/sessions/s1')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockSession,
                });
            }
            if (url.includes('/admin/trainers')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ data: [] }),
                });
            }
            return Promise.resolve({ ok: false });
        });
    });

    it('renders session details correctly', async () => {
        const page = await SessionDetailPage({ params: { id: 's1' } });
        render(page);

        expect(screen.getByText('Advanced Training')).toBeDefined();
        expect(screen.getAllByText('Test Corp').length).toBeGreaterThan(0);
        expect(screen.getByText('Jane Trainer')).toBeDefined();
        expect(screen.getByText('123 Test St')).toBeDefined();
        expect(screen.queryByText('Wallonie')).toBeNull(); // Not in this mock
        expect(screen.getByText('Gate 5')).toBeDefined();
        expect(screen.getByText(/John.*Doe/)).toBeDefined();
    });

    it('calls notFound when session is missing', async () => {
        (global.fetch as any).mockResolvedValueOnce({ ok: false });
        await expect(SessionDetailPage({ params: { id: 'missing' } }))
            .rejects.toThrow('NEXT_NOT_FOUND');
        expect(notFound).toHaveBeenCalled();
    });

    it('handles unassigned trainer', async () => {
        const unassignedSession = { ...mockSession, trainer: null };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => unassignedSession,
        });

        const page = await SessionDetailPage({ params: { id: 's1' } });
        render(page);

        expect(screen.getByText('Non assigné')).toBeDefined();
    });

    it('handles empty/invalid logistics gracefully', async () => {
        const badLogSession = { ...mockSession, logistics: 'INVALID JSON' };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => badLogSession,
        });

        const page = await SessionDetailPage({ params: { id: 's1' } });
        render(page);

        expect(screen.getByText('INVALID JSON')).toBeDefined();
    });
});
