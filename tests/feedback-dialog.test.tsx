import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FeedbackDialog } from "@/components/feedback-dialog"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("feedback dialog", () => {
  it("posts trimmed feedback to the server and shows confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
    vi.stubGlobal("fetch", fetchMock)

    render(<FeedbackDialog isOpen onClose={() => undefined} />)

    fireEvent.change(screen.getByPlaceholderText("Tell us what you think..."), {
      target: { value: "  The editor feels great.  " },
    })
    fireEvent.change(screen.getByPlaceholderText("Email (optional)"), {
      target: { value: "reader@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          content: "The editor feels great.",
          email: "reader@example.com",
        }),
      }),
    )
    expect(await screen.findByText("Your feedback has been received.")).toBeTruthy()
  })

  it("keeps the dialog open and shows the server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Feedback service is unavailable" }),
      }),
    )
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    render(<FeedbackDialog isOpen onClose={() => undefined} />)

    fireEvent.change(screen.getByPlaceholderText("Tell us what you think..."), {
      target: { value: "Please fix this issue" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }))

    expect(await screen.findByText("Feedback service is unavailable")).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "Send Feedback" })).toBeTruthy()
  })
})
