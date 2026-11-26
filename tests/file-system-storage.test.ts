import { update } from "idb-keyval"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FileSystemStorage, type Note } from "@/lib/file-system-storage"

const { database } = vi.hoisted(() => ({ database: new Map<string, unknown>() }))
vi.mock("idb-keyval", () => ({
  getMany: async (keys: string[]) => keys.map(key => database.get(key)),
  update: vi.fn(async (key: string, updater: (value: unknown) => unknown) => {
    database.set(key, updater(database.get(key)))
  }),
  setMany: async (entries: [string, unknown][]) => {
    for (const [key, value] of entries) database.set(key, value)
  },
  delMany: async (keys: string[]) => {
    for (const key of keys) database.delete(key)
  },
}))

function memoryFile(name: string, initialText: string) {
  const file = {
    kind: "file",
    name,
    text: initialText,
    isSameEntry: async (other: unknown): Promise<boolean> => other === file,
    getFile: async () => ({ text: async (): Promise<string> => file.text, lastModified: 1000 }),
    createWritable: async () => {
      let pending = ""
      return {
        write: async (text: string) => { pending = text },
        close: async () => { file.text = pending },
        abort: async () => {},
      }
    },
  }
  return file
}

function memoryDirectory(name: string, initial: Record<string, string>) {
  const files = new Map(Object.entries(initial).map(([filename, text]) => [filename, memoryFile(filename, text)]))
  const directory = {
    name,
    files,
    values: () => files.values(),
    isSameEntry: async (other: unknown): Promise<boolean> => other === directory,
    getFileHandle: async (filename: string, options?: { create: boolean }) => {
      if (options?.create && !files.has(filename)) files.set(filename, memoryFile(filename, ""))
      const file = files.get(filename)
      if (!file) throw new DOMException("File not found", "NotFoundError")
      return file
    },
    removeEntry: async (filename: string) => {
      if (!files.delete(filename)) throw new DOMException("File not found", "NotFoundError")
    },
  }
  return directory
}

function note(id: string, title: string, content: string): Note {
  return { id, title, content, lastModified: new Date(1000) }
}

afterEach(() => {
  database.clear()
  vi.unstubAllGlobals()
})

describe("connected folder storage", () => {
  it("keeps image-only note HTML intact through browser serialization and a folder restore", async () => {
    const directory = memoryDirectory("Notes", {})
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(directory))
    const storage = new FileSystemStorage()
    await storage.connectDirectory()
    const html = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC" alt="Swatch">'
    const imageNote = note("drawing", "Swatch", html)
    expect(JSON.parse(JSON.stringify(imageNote)).content).toBe(html)
    await storage.saveNote(imageNote)
    expect(directory.files.get("Swatch.txt")?.text).toBe(html)
    const restored = new FileSystemStorage()
    await restored.loadHandle()
    expect((await restored.loadNotes())[0].content).toBe(html)
  })

  it("restores an old folder handle, differentiates equal stems and preserves Markdown filenames", async () => {
    const directory = memoryDirectory("Notes", { "List.md": "# List", "List.txt": "Shopping" })
    database.set("nerds-note-directory-handle", directory)
    const storage = new FileSystemStorage()
    expect(await storage.loadHandle()).toBe(true)

    const files = await storage.loadNotes()
    expect(new Set(files.map(file => file.id)).size).toBe(2)
    expect(files.map(file => file.title)).toEqual(["List", "List"])
    const markdown = files.find(file => file.content.includes("# List"))!
    await storage.saveNote(markdown)
    expect(directory.files.get("List.md")?.text).toBe("# List")

    await storage.saveNote({ ...markdown, content: "<p>Edited</p>" })
    expect(directory.files.get("List.md")?.text).toBe("<p>Edited</p>")
    expect(directory.files.get("List.txt")?.text).toBe("Shopping")
    const reopened = new FileSystemStorage()
    await reopened.loadHandle()
    expect((await reopened.loadNotes()).map(file => file.id)).toEqual(files.map(file => file.id))
    await reopened.deleteNote(markdown.id)
    expect([...directory.files.keys()]).toEqual(["List.txt"])
  })

  it("allocates separate filenames for concurrent same-title saves and keeps IDs across renames and reloads", async () => {
    const directory = memoryDirectory("Notes", { "Ideas.txt": "Original" })
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(directory))
    const storage = new FileSystemStorage()
    await storage.connectDirectory()

    const first = note("one", "Ideas", "<p>One</p>")
    const second = note("two", "Ideas", "<p>Two</p>")
    await Promise.all([storage.saveNote(first), storage.saveNote(second)])
    const renamed = { ...first, title: "Revised" }
    await storage.saveNote(renamed)
    await storage.saveNote({ ...second, content: "<p>Later</p>" })
    expect(directory.files.has("Ideas (2).txt")).toBe(false)
    expect(directory.files.get("Ideas (3).txt")?.text).toBe("<p>Later</p>")
    expect(directory.files.get("Ideas.txt")?.text).toBe("Original")

    const reopened = new FileSystemStorage()
    await reopened.loadHandle()
    const files = await reopened.loadNotes()
    expect(files.find(file => file.id === "one")).toMatchObject(renamed)
    expect(files.find(file => file.id === "two")).toMatchObject({ ...second, content: "<p>Later</p>" })
  })

  it("preserves an external edit made since the scan on save, rename, and delete", async () => {
    const directory = memoryDirectory("Notes", { "Draft.txt": "Original" })
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(directory))
    const storage = new FileSystemStorage()
    await storage.connectDirectory()
    const [draft] = await storage.loadNotes()
    directory.files.get("Draft.txt")!.text = "Changed in another editor"

    await expect(storage.saveNote({ ...draft, content: "Browser edit" })).rejects.toThrow("changed")
    await expect(storage.saveNote({ ...draft, title: "Renamed" })).rejects.toThrow("changed")
    await expect(storage.deleteNote(draft.id)).rejects.toThrow("changed")
    expect([...directory.files.keys()]).toEqual(["Draft.txt"])
    expect(directory.files.get("Draft.txt")?.text).toBe("Changed in another editor")
  })

  it("preserves the selection on cancel and clears old filename ownership when switching folders", async () => {
    const oldFolder = memoryDirectory("Former", {})
    const newFolder = memoryDirectory("Next", { "Notes.txt": "Keep me" })
    const pick = vi.fn().mockResolvedValueOnce(oldFolder)
      .mockRejectedValueOnce(new DOMException("Canceled", "AbortError")).mockResolvedValueOnce(newFolder)
    vi.stubGlobal("showDirectoryPicker", pick)
    const storage = new FileSystemStorage()
    const draft = note("mine", "Notes", "<p>My text</p>")
    await storage.connectDirectory()
    await storage.saveNote(draft)
    expect(await storage.connectDirectory()).toBe(false)
    expect(storage.getDirectoryName()).toBe("Former")

    await storage.connectDirectory()
    await storage.saveNote(draft)
    await storage.deleteNote(draft.id)
    expect(newFolder.files.get("Notes.txt")?.text).toBe("Keep me")
    expect(oldFolder.files.get("Notes.txt")?.text).toBe("<p>My text</p>")
  })

  it("keeps a legacy folder readable when its first index write fails, retrying before editing", async () => {
    const directory = memoryDirectory("Legacy", { "Readme.md": "Keep this" })
    database.set("nerds-note-directory-handle", directory)
    const storage = new FileSystemStorage()
    await storage.loadHandle()
    vi.mocked(update).mockRejectedValueOnce(new Error("No space"))
    const [draft] = await storage.loadNotes()
    expect(draft.content).toBe("<p>Keep this</p>")

    vi.mocked(update).mockRejectedValueOnce(new Error("No space"))
    await expect(storage.saveNote({ ...draft, content: "Updated" })).rejects.toThrow("No space")
    expect(directory.files.get("Readme.md")?.text).toBe("Keep this")
    await storage.saveNote({ ...draft, content: "Updated" })
    expect(directory.files.get("Readme.md")?.text).toBe("<p>Updated</p>")
  })

  it("refuses a stale tab's rename or deletion after a different folder is selected", async () => {
    const first = memoryDirectory("First", { "List.txt": "First folder" })
    const second = memoryDirectory("Second", { "List.txt": "Second folder" })
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second))
    const oldTab = new FileSystemStorage()
    await oldTab.connectDirectory()
    const [oldNote] = await oldTab.loadNotes()
    const newTab = new FileSystemStorage()
    await newTab.connectDirectory()
    const [newNote] = await newTab.loadNotes()

    await expect(oldTab.saveNote({ ...oldNote, title: "Renamed" })).rejects.toThrow("another tab")
    await expect(oldTab.deleteNote(oldNote.id)).rejects.toThrow("another tab")
    await oldTab.disconnectDirectory()
    const reopened = new FileSystemStorage()
    await reopened.loadHandle()
    expect(await reopened.loadNotes()).toEqual([newNote])
    expect([...first.files.keys()]).toEqual(["List.txt"])
  })

  it("removes its staged copy when an existing file cannot be removed during a rename", async () => {
    const directory = memoryDirectory("Notes", { "Original.md": "Source" })
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(directory))
    const storage = new FileSystemStorage()
    await storage.connectDirectory()
    const [draft] = await storage.loadNotes()
    vi.spyOn(directory, "removeEntry").mockRejectedValueOnce(new Error("File in use"))

    await expect(storage.saveNote({ ...draft, title: "Renamed" })).rejects.toThrow("File in use")
    expect([...directory.files.keys()]).toEqual(["Original.md"])
    await storage.saveNote({ ...draft, title: "Renamed" })
    expect([...directory.files.keys()]).toEqual(["Renamed.md"])
    expect(directory.files.get("Renamed.md")?.text).toBe("Source")
  })

  it("remembers removed IDs without assigning them to new files at the same path", async () => {
    const directory = memoryDirectory("Notes", { "Original.md": "One", "Draft.txt": "Two" })
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockResolvedValue(directory))
    const storage = new FileSystemStorage()
    await storage.connectDirectory()
    const files = await storage.loadNotes()
    const original = files.find(file => file.title === "Original")!
    const draft = files.find(file => file.title === "Draft")!
    await storage.deleteNote(draft.id)
    directory.files.delete("Original.md")
    expect(await storage.loadNotes()).toEqual([])

    directory.files.set("Original.md", memoryFile("Original.md", "A different note"))
    const reopened = new FileSystemStorage()
    await reopened.loadHandle()
    const [replacement] = await reopened.loadNotes()
    expect(replacement.id).not.toBe(original.id)
    expect(reopened.wasRemoved(original.id)).toBe(true)
    expect(reopened.wasRemoved(draft.id)).toBe(true)
    await expect(reopened.saveNote(original)).rejects.toThrow("removed")
    expect(directory.files.get("Original.md")?.text).toBe("A different note")
  })
})
