import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"

import NotepadClient from "@/components/notepad-client"
import { readNoteImageFile } from "@/lib/note-images"

vi.mock("@/lib/firebase", () => ({ db: {} }))
vi.mock("@/lib/note-images", async (load) => ({
  ...await load<typeof import("@/lib/note-images")>(),
  readNoteImageFile: vi.fn(),
}))

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"
const source = JSON.stringify(["First", "Second"].map((title) => ({
  id: title, title, content: `<p>${title} body</p>`, lastModified: "2026-01-01T00:00:00.000Z",
})))
const selectedFile = new File(["local input"], "private-name.png", { type: "image/png" })

async function openNotebook() {
  localStorage.setItem("nerds-note-data", source)
  render(<NotepadClient />)
  return screen.findByRole("textbox", { name: "Note body" })
}

function delayDecode() {
  let finish!: (src: string) => void
  vi.mocked(readNoteImageFile).mockReturnValueOnce(new Promise<string>((resolve) => { finish = resolve }))
  return () => act(async () => finish(png))
}

async function openPicker() {
  fireEvent.click(screen.getByRole("button", { name: "Format" }))
  fireEvent.click(screen.getByRole("button", { name: "Insert image" }))
  const dialog = within(await screen.findByRole("dialog"))
  fireEvent.change(dialog.getByLabelText("Image file"), { target: { files: [selectedFile] } })
  fireEvent.submit(dialog.getByRole("button", { name: "Insert image" }).closest("form")!)
  return dialog
}

function selectNote(title: string) {
  fireEvent.click(screen.getByRole("button", { name: "Notes" }))
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: new RegExp(`^${title} `) }))
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.mocked(readNoteImageFile).mockReset()
  localStorage.clear()
})

it("cancels a pending clipboard image when switching away and back to the original note", async () => {
  const body = await openNotebook()
  const finish = delayDecode()
  fireEvent.paste(body, { clipboardData: { files: [selectedFile] } })
  expect(readNoteImageFile).toHaveBeenCalledWith(selectedFile)
  selectNote("Second")
  selectNote("First")
  await finish()
  expect(body.querySelector("img")).toBeNull()
  expect(localStorage.getItem("nerds-note-data")).toBe(source)
})

it("discards an image whose dialog was cancelled while decoding", async () => {
  const body = await openNotebook()
  const finish = delayDecode()
  const dialog = await openPicker()
  expect(readNoteImageFile).toHaveBeenCalledWith(selectedFile)
  fireEvent.click(dialog.getByRole("button", { name: "Cancel" }))
  await finish()
  expect(body.querySelector("img")).toBeNull()
  expect(localStorage.getItem("nerds-note-data")).toBe(source)
})

it("keeps the note unchanged and allows retry after the selected image fails validation", async () => {
  const body = await openNotebook()
  vi.mocked(readNoteImageFile).mockRejectedValueOnce(new Error("Choose a PNG, JPEG, or WebP image."))
  const dialog = await openPicker()
  expect((await dialog.findByRole("alert")).textContent).toMatch(/PNG, JPEG, or WebP/)
  expect((dialog.getByRole("button", { name: "Insert image" }) as HTMLButtonElement).disabled).toBe(false)
  expect(body.querySelector("img")).toBeNull()
  expect(localStorage.getItem("nerds-note-data")).toBe(source)
})

it("keeps a lossless download available after a full browser store and a switch to another note", async () => {
  const body = await openNotebook()
  const setItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "nerds-note-data") throw new DOMException("Storage full", "QuotaExceededError")
    return setItem.call(this, key, value)
  })
  vi.mocked(readNoteImageFile).mockResolvedValueOnce(png)
  fireEvent.paste(body, { clipboardData: { files: [selectedFile] } })
  expect(await screen.findByRole("button", { name: "Download note with images" })).toBeTruthy()
  expect(body.querySelector("img")?.getAttribute("src")).toBe(png)
  selectNote("Second")
  expect(await screen.findByRole("button", { name: "Download First backup" })).toBeTruthy()
  expect(localStorage.getItem("nerds-note-data")).toBe(source)
})
