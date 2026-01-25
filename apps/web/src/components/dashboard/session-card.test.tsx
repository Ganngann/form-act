import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SessionCard, Session } from './session-card'

const mockSession: Session = {
    id: '123',
    date: '2023-10-10T10:00:00.000Z',
    slot: 'AM',
    status: 'CONFIRMED',
    formation: {
        title: 'Formation Test',
        programLink: null
    },
    trainer: {
        firstName: 'John',
        lastName: 'Doe'
    }
}

describe('SessionCard', () => {
    it('renders session details correctly', () => {
        render(<SessionCard session={mockSession} />)
        expect(screen.getByText('Formation Test')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Confirmée')).toBeInTheDocument() // StatusBadge converts CONFIRMED to Confirmée
    })

    it('shows "Détails" button by default', () => {
        render(<SessionCard session={mockSession} />)
        expect(screen.getByText('Détails')).toBeInTheDocument()
        expect(screen.queryByText('Compléter la logistique')).not.toBeInTheDocument()
    })

    it('shows "Compléter la logistique" button when isActionRequired is true', () => {
        render(<SessionCard session={mockSession} isActionRequired={true} />)
        expect(screen.getByText('Compléter la logistique')).toBeInTheDocument()
        expect(screen.queryByText('Détails')).not.toBeInTheDocument()
    })

    it('shows "Programme (PDF)" button when programLink is present', () => {
        const sessionWithProgram = {
            ...mockSession,
            formation: {
                ...mockSession.formation,
                programLink: 'https://example.com/program.pdf'
            }
        }
        render(<SessionCard session={sessionWithProgram} />)
        expect(screen.getByText('Programme (PDF)')).toBeInTheDocument()
        expect(screen.getByText('Programme (PDF)').closest('a')).toHaveAttribute('href', 'https://example.com/program.pdf')
    })
})
