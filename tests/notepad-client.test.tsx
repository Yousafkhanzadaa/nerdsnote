import { StrictMode } from "react"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import NotepadClient from "@/components/notepad-client"
import { FileSystemStorage, fileSystemStorage } from "@/lib/file-system-storage"
import { LANDING_DRAFT_HANDOFF_KEY, LANDING_DRAFT_STORAGE_KEY } from "@/lib/landing-draft"

vi.mock("@/lib/firebase", () => ({ db: {} }))

const storageKey = "nerds-note-data"
const savedNotes = [
  {
    id: "first",
    title: "Reading list",
    content: "<p>Books to revisit</p>",
    lastModified: "2026-01-10T12:00:00.000Z",
  },
  {
    id: "second",
    title: "Field notes",
    content: "<p>Along the river</p>",
    lastModified: "2026-01-09T12:00:00.000Z",
  },
]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe("notebook persistence", () => {
  it("can edit each valid legacy record independently when two filenames produced the same ID", async () => {
    const first = { ...savedNotes[0], id: "Plan", title: "Plan", content: "First file" }
    const before = JSON.stringify([first, { ...first, content: "Second file" }])
    localStorage.setItem(storageKey, before)
    render(<NotepadClient />)
    await screen.findByDisplayValue("Plan")
    fireEvent.click(screen.getByRole("button", { name: "Notes" }))
    fireEvent.click(screen.getByRole("button", { name: /Plan.*Second file/ }))
    expect(localStorage.getItem(storageKey)).toBe(before)
    fireEvent.change(screen.getByRole("textbox", { name: "Note title" }), { target: { value: "Second plan" } })
    await waitFor(() => {
      const notes = JSON.parse(localStorage.getItem(storageKey)!)
      expect(notes).toHaveLength(2)
      expect(notes[0]).toEqual(first)
      expect(notes[1]).toMatchObject({ title: "Second plan", content: "Second file" })
      expect(notes[1].id).not.toBe(notes[0].id)
    })
  })

  it("preserves the original plaintext record and its extra fields when another note is edited", async () => {
    const oldNote = {
      ...savedNotes[1],
      content: "A < B & C\r\n  next line",
      lastModified: "2026-01-09T17:00:00+05:00",
      groupId: "work",
    }
    const before = JSON.stringify([savedNotes[0], oldNote], null, 2)
    localStorage.setItem(storageKey, before)
    render(<StrictMode><NotepadClient /></StrictMode>)
    const title = await screen.findByDisplayValue("Reading list")
    expect(localStorage.getItem(storageKey)).toBe(before)
    fireEvent.change(title, { target: { value: "New reading list" } })
    await waitFor(() => expect(JSON.parse(localStorage.getItem(storageKey)!)[0].title).toBe("New reading list"))
    expect(JSON.parse(localStorage.getItem(storageKey)!)[1]).toEqual(oldNote)
  })

  it.each(["{broken", JSON.stringify([savedNotes[0], { unexpected: true }])])(
    "keeps unrecognized stored data intact and surfaces the problem", async (before) => {
      localStorage.setItem(storageKey, before)
      render(<NotepadClient />)
      await screen.findByRole("alert")
      expect(localStorage.getItem(storageKey)).toBe(before)
    },
  )

  it("keeps changes saved by another tab when the current tab has stale notes", async () => {
    localStorage.setItem(storageKey, JSON.stringify(savedNotes))
    render(<NotepadClient />)
    const title = await screen.findByDisplayValue("Reading list")
    const newer = JSON.stringify([savedNotes[0], { ...savedNotes[1], content: "Saved in an older tab" }])
    localStorage.setItem(storageKey, newer)
    fireEvent.change(title, { target: { value: "This tab's edit" } })
    await screen.findByRole("alert")
    expect(localStorage.getItem(storageKey)).toBe(newer)
  })

  it("keeps the remembered handle and browser notes if folder permission needs renewing", async () => {
    const before = JSON.stringify(savedNotes, null, 2)
    localStorage.setItem(storageKey, before)
    vi.spyOn(FileSystemStorage, "isSupported").mockReturnValue(true)
    vi.spyOn(fileSystemStorage, "loadHandle").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "hasPermission").mockResolvedValue(false)
    const disconnect = vi.spyOn(fileSystemStorage, "disconnectDirectory").mockResolvedValue()
    const write = vi.spyOn(fileSystemStorage, "saveNote")
    render(<NotepadClient />)
    await screen.findByDisplayValue("Reading list")
    expect(localStorage.getItem(storageKey)).toBe(before)
    expect(disconnect).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it.each([false, true])("reconnects without rewriting matching files (copy missing notes: %s)", async (copyMissing) => {
    const before = JSON.stringify(savedNotes, null, 2)
    localStorage.setItem(storageKey, before)
    vi.spyOn(FileSystemStorage, "isSupported").mockReturnValue(true)
    vi.spyOn(fileSystemStorage, "loadHandle").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "hasPermission").mockResolvedValue(false)
    vi.spyOn(fileSystemStorage, "connectDirectory").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "getDirectoryName").mockReturnValue("Existing notebook")
    vi.spyOn(fileSystemStorage, "loadNotes").mockResolvedValue([{
      ...savedNotes[0], id: "disk-id", lastModified: new Date(savedNotes[0].lastModified),
    }])
    const write = vi.spyOn(fileSystemStorage, "saveNote").mockResolvedValue()
    render(<NotepadClient />)
    fireEvent.click(await screen.findByRole("button", { name: "Reconnect folder" }))
    const copy = screen.getByRole("checkbox", { name: "Copy existing browser notes into this folder" }) as HTMLInputElement
    expect(copy.checked).toBe(false)
    if (copyMissing) fireEvent.click(copy)
    fireEvent.click(screen.getByRole("button", { name: "Choose folder" }))
    await screen.findByText("Folder · Existing notebook")
    expect(write).toHaveBeenCalledTimes(copyMissing ? 1 : 0)
    if (copyMissing) expect(write).toHaveBeenCalledWith(expect.objectContaining({ title: savedNotes[1].title }))
    expect(localStorage.getItem(storageKey)).toBe(before)
  })

  it("preserves a previous version's connected folder and browser-only notes on first open", async () => {
    const localRecord = { ...savedNotes[0], id: "Reading list", content: "Unflushed browser edit" }
    const before = JSON.stringify([localRecord, savedNotes[1]])
    localStorage.setItem(storageKey, before)
    vi.spyOn(FileSystemStorage, "isSupported").mockReturnValue(true)
    vi.spyOn(fileSystemStorage, "loadHandle").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "hasPermission").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "getDirectoryName").mockReturnValue("Existing notebook")
    vi.spyOn(fileSystemStorage, "loadNotes").mockResolvedValue([{
      ...localRecord, content: "<p>Independently edited on disk</p>", lastModified: new Date(),
    }])
    const write = vi.spyOn(fileSystemStorage, "saveNote")
    const remove = vi.spyOn(fileSystemStorage, "deleteNote")
    render(<NotepadClient />)
    await screen.findByRole("textbox", { name: "Note title" })
    fireEvent.click(screen.getByRole("button", { name: "Notes" }))
    const drawer = within(await screen.findByRole("dialog", { name: "Your notes" }))
    expect(drawer.getByText("Unflushed browser edit")).toBeTruthy()
    expect(drawer.getByText("Independently edited on disk")).toBeTruthy()
    expect(drawer.getByText("Along the river")).toBeTruthy()
    expect(localStorage.getItem(storageKey)).toBe(before)
    expect(write).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
  })

  it("retains a pending quick draft through a failed notebook save and imports it once on retry", async () => {
    localStorage.setItem(storageKey, JSON.stringify(savedNotes))
    localStorage.setItem(LANDING_DRAFT_HANDOFF_KEY, "true")
    localStorage.setItem(LANDING_DRAFT_STORAGE_KEY, "A pending draft")
    const originalSetItem = Storage.prototype.setItem
    const fullStorage = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === storageKey) throw new DOMException("Full", "QuotaExceededError")
      originalSetItem.call(this, key, value)
    })
    const first = render(<NotepadClient />)
    await screen.findByRole("alert")
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe("A pending draft")
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(savedNotes)
    first.unmount()
    fullStorage.mockRestore()
    render(<StrictMode><NotepadClient /></StrictMode>)
    await waitFor(() => expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBeNull())
    const restored = JSON.parse(localStorage.getItem(storageKey)!)
    expect(restored).toHaveLength(3)
    expect(restored.filter((n: { title: string }) => n.title === "A pending draft")).toHaveLength(1)
  })

  it("keeps folder-only notes in the browser when the user disconnects the folder", async () => {
    const before = JSON.stringify(savedNotes, null, 2)
    localStorage.setItem(storageKey, before)
    vi.spyOn(FileSystemStorage, "isSupported").mockReturnValue(true)
    vi.spyOn(fileSystemStorage, "loadHandle").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "hasPermission").mockResolvedValue(true)
    vi.spyOn(fileSystemStorage, "getDirectoryName").mockReturnValue("Paper")
    vi.spyOn(fileSystemStorage, "loadNotes").mockResolvedValue([{
      id: "file-id", title: "Loose page", content: "<p>From disk</p>", lastModified: new Date(),
    }])
    const disconnect = vi.spyOn(fileSystemStorage, "disconnectDirectory").mockResolvedValue()
    const writeFile = vi.spyOn(fileSystemStorage, "saveNote")
    render(<NotepadClient />)
    await screen.findByRole("textbox", { name: "Note title" })
    expect(localStorage.getItem(storageKey)).toBe(before)
    fireEvent.keyDown(screen.getByRole("button", { name: "More options" }), { key: "ArrowDown" })
    fireEvent.click(await screen.findByRole("menuitem", { name: "Disconnect folder" }))
    await waitFor(() => expect(disconnect).toHaveBeenCalled())
    expect(writeFile).not.toHaveBeenCalled()
    const saved = JSON.parse(localStorage.getItem(storageKey)!)
    expect(saved).toHaveLength(3)
    expect(saved).toEqual(expect.arrayContaining([...savedNotes, expect.objectContaining({ id: "file-id", content: "<p>From disk</p>" })]))
  })

  it("keeps saved notes when the editor initializes", async () => {
    localStorage.setItem(storageKey, JSON.stringify(savedNotes))
    render(<StrictMode><NotepadClient /></StrictMode>)

    expect(await screen.findByDisplayValue("Reading list")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Notes" }))
    fireEvent.click(screen.getByRole("button", { name: /^Field notes/ }))

    expect(await screen.findByDisplayValue("Field notes")).toBeTruthy()
    expect((await screen.findByRole("textbox", { name: "Note body" })).textContent).toBe("Along the river")
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(savedNotes)
  })

  it("remembers an empty notebook after the last note is deleted and the editor reopens", async () => {
    localStorage.setItem(storageKey, JSON.stringify([savedNotes[0]]))
    const firstVisit = render(<NotepadClient />)

    await screen.findByDisplayValue("Reading list")
    fireEvent.click(screen.getByRole("button", { name: "Notes" }))
    fireEvent.click(screen.getByRole("button", { name: "Delete Reading list" }))
    const confirmation = await screen.findByRole("alertdialog")
    fireEvent.click(within(confirmation).getByRole("button", { name: "Delete note" }))

    await waitFor(() => expect(localStorage.getItem(storageKey)).toBe("[]"))
    firstVisit.unmount()
    render(<NotepadClient />)

    expect(await screen.findByRole("heading", { name: /notebook is empty/i })).toBeTruthy()
    expect(screen.queryByRole("textbox", { name: "Note title" })).toBeNull()
  })
})
