import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const { addDocMock, collectionMock, dbMock } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  collectionMock: vi.fn(),
  dbMock: {},
}))

vi.mock("@/lib/firebase", () => ({ db: dbMock }))
vi.mock("firebase/firestore", () => ({
  addDoc: addDocMock,
  collection: collectionMock,
}))

import { FeedbackDialog } from "@/components/feedback-dialog"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("feedback dialog", () => {
  it("writes feedback to Firestore and shows confirmation", async () => {
    const feedbackCollection = { path: "nerdsnote" }
    collectionMock.mockReturnValue(feedbackCollection)
    addDocMock.mockResolvedValue({ id: "feedback-id" })

    render(<FeedbackDialog isOpen onClose={() => undefined} />)

    fireEvent.change(screen.getByPlaceholderText("Tell us what you think..."), {
      target: { value: "  The editor feels great.  " },
    })
    fireEvent.change(screen.getByPlaceholderText("Email (optional)"), {
      target: { value: "reader@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }))

    await waitFor(() => expect(addDocMock).toHaveBeenCalledTimes(1))
    expect(collectionMock).toHaveBeenCalledWith(dbMock, "nerdsnote")
    expect(addDocMock).toHaveBeenCalledWith(
      feedbackCollection,
      expect.objectContaining({
        content: "The editor feels great.",
        email: "reader@example.com",
        timestamp: expect.any(Date),
        userAgent: navigator.userAgent,
      }),
    )
    expect(await screen.findByText("Your feedback has been received.")).toBeTruthy()
  })

  it("keeps the dialog open and shows an error when Firestore rejects the write", async () => {
    collectionMock.mockReturnValue({ path: "nerdsnote" })
    addDocMock.mockRejectedValue(new Error("permission denied"))
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    render(<FeedbackDialog isOpen onClose={() => undefined} />)

    fireEvent.change(screen.getByPlaceholderText("Tell us what you think..."), {
      target: { value: "Please fix this issue" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send Feedback" }))

    expect(await screen.findByText("Failed to send feedback. Please try again.")).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "Send Feedback" })).toBeTruthy()
  })
})
