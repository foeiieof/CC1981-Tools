import '@testing-library/jest-dom'
import CampaignPage from "@/app/campaign/page"
import { render, screen } from "@testing-library/react"

// describe('Campaign', () => {
//   it('Campaign', async () => {
//     render(<CampaignPage />)

//     // Variable Search byn 
//     expect(await screen.findByText('Channel Type')).toBeInTheDocument()
//     // expect(screen.getByText('Channel Type')).toBeInTheDocument()
//   })
// })


describe('Campaign Page', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [] }),
      })
    ) as jest.Mock
  })

  it('renders page', async () => {
    render(<CampaignPage />)
    expect(await screen.findByText('Channel Type')).toBeInTheDocument()
  })
})
