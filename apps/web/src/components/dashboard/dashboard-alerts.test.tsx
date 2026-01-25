import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardAlerts } from './dashboard-alerts'
import { addDays } from 'date-fns'

describe('DashboardAlerts', () => {
    it('renders nothing when alerts are empty', () => {
        const { container } = render(<DashboardAlerts alerts={[]} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders warning alert (Orange) for date >= 9 days', () => {
        const futureDate = addDays(new Date(), 10)
        const alerts = [{
            type: 'missing-participants' as const,
            count: 2,
            earliestDate: futureDate
        }]

        render(<DashboardAlerts alerts={alerts} />)

        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveClass('bg-orange-50')
        expect(alert).toHaveClass('border-orange-500')
        expect(alert).toHaveClass('text-orange-700')
    })

    it('renders critical alert (Red) for date < 9 days', () => {
        const urgentDate = addDays(new Date(), 5)
        const alerts = [{
            type: 'missing-participants' as const,
            count: 1,
            earliestDate: urgentDate
        }]

        render(<DashboardAlerts alerts={alerts} />)

        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveClass('bg-red-50')
        expect(alert).toHaveClass('border-red-500')
        expect(alert).toHaveClass('text-red-700')
    })
})
