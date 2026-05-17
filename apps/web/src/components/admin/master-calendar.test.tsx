import { render, screen, waitFor } from "@testing-library/react"
import { MasterCalendar } from "./master-calendar"
import { vi } from "vitest"

// Mock fetch globally
global.fetch = vi.fn()

describe("MasterCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()

    // We mock fetch as resolving to empty arrays normally so it doesn't fail right away
    ;(global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve([])
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("handles fetch errors gracefully and logs them", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    // Force fetch to reject to trigger the error path
    ;(global.fetch as any).mockRejectedValueOnce(new Error("Network Error"))

    render(<MasterCalendar />)

    // Wait for the fetch call and error log to happen
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch trainers", expect.any(Error))
    })

    // Restore the spy
    consoleSpy.mockRestore()
  })

  it("handles sessions fetch errors gracefully and logs them", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    // 1st call: trainers fetch - let it resolve
    ;(global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve([])
    })

    // 2nd call: sessions fetch - let it reject
    ;(global.fetch as any).mockRejectedValueOnce(new Error("Sessions Fetch Error"))

    render(<MasterCalendar />)

    // Wait for the fetch call and error log to happen
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch sessions", expect.any(Error))
    })

    // Restore the spy
    consoleSpy.mockRestore()
  })
})
