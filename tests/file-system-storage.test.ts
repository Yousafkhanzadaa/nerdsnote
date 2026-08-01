import { beforeEach, describe, expect, it, vi } from "vitest"

import { FileSystemStorage } from "@/lib/file-system-storage"
import type { Note } from "@/lib/note-storage"

vi.mock("idb-keyval", () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}))

interface MemoryFile {
  content: string
  lastModified: number
}

class MemoryDirectory {
  readonly kind = "directory"
  readonly name = "NerdsNote"
  readonly files = new Map<string, MemoryFile>()

  async getFileHandle(name: string, options?: { create?: boolean }) {
    if (!this.files.has(name)) {
      if (!options?.create) {
        throw new DOMException("Missing file", "NotFoundError")
      }
      this.files.set(name, { content: "", lastModified: Date.now() })
    }

    return this.fileHandle(name)
  }

  async removeEntry(name: string) {
    if (!this.files.delete(name)) {
      throw new DOMException("Missing file", "NotFoundError")
    }
  }

  async *values() {
    for (const name of this.files.keys()) {
      yield this.fileHandle(name)
    }
  }

  private fileHandle(name: string) {
    return {
      kind: "file" as const,
      name,
      getFile: async () => {
        const file = this.files.get(name)!
        return {
          lastModified: file.lastModified,
          text: async () => file.content,
        }
      },
      createWritable: async () => {
        let pending = ""
        return {
          write: async (content: string) => {
            pending = content
          },
          close: async () => {
            this.files.set(name, { content: pending, lastModified: Date.now() })
          },
        }
      },
    }
  }
}

function makeNote(id: string, title: string, content: string): Note {
  return { id, title, content, lastModified: new Date() }
}

describe("FileSystemStorage", () => {
  let directory: MemoryDirectory
  let storage: FileSystemStorage

  beforeEach(async () => {
    directory = new MemoryDirectory()
    storage = new FileSystemStorage()
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: vi.fn().mockResolvedValue(directory),
    })
    await storage.connectDirectory()
  })

  it("writes genuinely plain-text .txt files", async () => {
    await storage.saveNote(makeNote("1", "Formatted", "<p><strong>Hello</strong> world</p>"))

    expect(directory.files.get("Formatted.txt")?.content).toBe("Hello world")
  })

  it("serializes rapid renames and leaves only the latest filename", async () => {
    await storage.saveNote(makeNote("1", "Original", "One"))

    await Promise.all([
      storage.saveNote(makeNote("1", "Second", "Two")),
      storage.saveNote(makeNote("1", "Final", "Three")),
    ])

    expect([...directory.files.keys()]).toEqual(["Final.txt"])
    expect(directory.files.get("Final.txt")?.content).toBe("Three")
  })

  it("orders deletion after an in-flight save", async () => {
    const save = storage.saveNote(makeNote("1", "Temporary", "Draft"))
    const remove = storage.deleteNote("1")

    await Promise.all([save, remove])

    expect(directory.files.size).toBe(0)
  })

  it("disambiguates identical note titles without overwriting", async () => {
    await Promise.all([
      storage.saveNote(makeNote("1", "Notes", "First")),
      storage.saveNote(makeNote("2", "Notes", "Second")),
    ])

    expect(directory.files.get("Notes.txt")?.content).toBe("First")
    expect(directory.files.get("Notes (2).txt")?.content).toBe("Second")
  })
})
