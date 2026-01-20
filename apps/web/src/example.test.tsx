import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const ExampleComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>
}

describe('Example Component', () => {
  it('renders the text correctly', () => {
    render(<ExampleComponent text="Hello Vitest" />)
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument()
  })
})
