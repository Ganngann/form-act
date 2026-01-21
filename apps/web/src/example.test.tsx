import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

const ExampleComponent = () => {
  return <div>Hello Test World</div>
}

describe('Example Component', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />)
    const element = screen.getByText('Hello Test World')
    expect(element).toBeInTheDocument()
  })
})
