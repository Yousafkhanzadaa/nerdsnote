import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { MiniNotepadPreview } from "@/components/mini-notepad-preview"
import { LANDING_DRAFT_STORAGE_KEY } from "@/lib/landing-draft"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

it("leaves the saved draft alone on open and protects changes made in another tab", () => {
  localStorage.setItem(LANDING_DRAFT_STORAGE_KEY, "Earlier draft")
  const write = vi.spyOn(Storage.prototype, "setItem")
  render(<MiniNotepadPreview />)
  const field = screen.getByRole("textbox", { name: "Quick draft" })
  expect((field as HTMLTextAreaElement).value).toBe("Earlier draft")
  expect(write).not.toHaveBeenCalled()
  localStorage.setItem(LANDING_DRAFT_STORAGE_KEY, "Newer draft from another tab")
  fireEvent.change(field, { target: { value: "This tab's edit" } })
  expect(screen.getByRole("status").textContent).toContain("another tab")
  expect((field as HTMLTextAreaElement).value).toBe("This tab's edit")
  expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe("Newer draft from another tab")
})
