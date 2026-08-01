import { describe, expect, it } from "vitest"

import {
  createBackup,
  loadBrowserNotes,
  NOTES_STORAGE_KEY,
  parseBackup,
  persistBrowserNotes,
  type Note,
} from "@/lib/note-storage"

function createMemoryStorage() {
  const values = new Map<string, string>()

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  }
}

const note: Note = {
  id: "note-1",
  title: "Test note",
  content: "<p>Hello</p>",
  lastModified: new Date("2026-08-01T10:00:00.000Z"),
}

describe("browser note persistence", () => {
  it("persists an empty notebook so the final deleted note cannot return", () => {
    const storage = createMemoryStorage()
    persistBrowserNotes(storage, [])

    expect(storage.values.get(NOTES_STORAGE_KEY)).toBe("[]")
    expect(loadBrowserNotes(storage)).toEqual([])
  })

  it("validates and restores serialized notes", () => {
    const storage = createMemoryStorage()
    persistBrowserNotes(storage, [note])

    expect(loadBrowserNotes(storage)).toEqual([note])
  })

  it("rejects structurally invalid stored data", () => {
    const storage = createMemoryStorage()
    storage.setItem(NOTES_STORAGE_KEY, JSON.stringify([{ title: "Missing fields" }]))

    expect(() => loadBrowserNotes(storage)).toThrow("Invalid note fields")
  })
})

describe("NerdsNote backups", () => {
  it("round-trips a versioned all-notes backup", () => {
    const backup = createBackup([note])

    expect(parseBackup(JSON.stringify(backup))).toEqual([note])
  })

  it("rejects unrelated JSON files", () => {
    expect(() => parseBackup('{"notes":[]}')).toThrow("Unsupported NerdsNote backup")
  })
})
