import { render, screen } from '@testing-library/react';
import AdminLayout from './layout';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/admin/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar" />,
}));

describe('AdminLayout', () => {
    it('renders children and sidebar', () => {
        render(
            <AdminLayout>
                <div data-testid="test-child">Child</div>
            </AdminLayout>
        );
        expect(screen.getByTestId('sidebar')).toBeDefined();
        expect(screen.getByTestId('test-child')).toBeDefined();
    });
});
