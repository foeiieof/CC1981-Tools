import '@testing-library/jest-dom'
import Home from "@/app/page"
import { render, screen } from '@testing-library/react'

describe('Home', () => {
  it('Home', () => {
    render(<Home />)
    const heading = screen.getByRole('main')

    expect(heading).toBeInTheDocument()
  })
})
