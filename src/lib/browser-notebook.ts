import type { Note } from "@/lib/file-system-storage"
import { normalizeNoteContent } from "@/lib/note-content"

const STORAGE_KEY = "nerds-note-data"
type StoredNote = Record<string, unknown> & { id: string; title: string; content: string; lastModified: string | number }
type Update = Partial<Pick<Note, "title" | "content">>

function isStoredNote(value: unknown): value is StoredNote {
  if (typeof value !== "object" || value === null) return false
  const record = value as Partial<StoredNote>
  return typeof record.id === "string" && !!record.id && typeof record.title === "string" &&
    typeof record.content === "string" && (typeof record.lastModified === "string" || typeof record.lastModified === "number") &&
    Number.isFinite(new Date(record.lastModified).getTime())
}

// The records retain their original fields and representations until an explicit
// edit, even if rendering the editing surface required transforming the content.
export class BrowserNotebook {
  source: string | null = null
  warning: string | null = null
  private records = new Map<string, StoredNote>()
  private savedIds = new Set<string>()
  private pendingWrites = false

  read(storage: Pick<Storage, "getItem">): Note[] {
    try {
      this.source = storage.getItem(STORAGE_KEY)
      if (this.source === null) return []
      const collection: unknown = JSON.parse(this.source)
      if (!Array.isArray(collection)) throw new Error("Unrecognized notebook")
      const used = new Set(collection.filter(isStoredNote).map((record) => record.id))
      for (const original of collection) {
        if (!isStoredNote(original)) {
          this.warning = "Some stored notes could not be read. Browser saving is paused to protect the original notebook."
          continue
        }
        // The previous folder loader used the filename stem as an ID.
        // Plan.txt and Plan.md could therefore produce two valid records with the same ID.
        let record = original
        if (this.records.has(original.id)) {
          let id: string = crypto.randomUUID()
          while (used.has(id)) id = crypto.randomUUID()
          used.add(id)
          record = { ...original, id }
        }
        this.records.set(record.id, record)
        this.savedIds.add(record.id)
      }
    } catch {
      this.warning = "Could not read the stored notebook. Browser saving is paused to protect your notes."
    }
    return Array.from(this.records.values(), (record) => ({
      id: record.id, title: record.title, content: record.content, lastModified: new Date(record.lastModified),
    }))
  }

  hasRecord(id: string) {
    return this.records.has(id)
  }

  containsSaved(id: string) {
    return this.savedIds.has(id)
  }

  check(storage: Pick<Storage, "getItem">) {
    if (this.warning) throw new Error(this.warning)
    if (storage.getItem(STORAGE_KEY) !== this.source) {
      this.warning = "The stored notebook changed in another tab. Download your edits and reopen the notebook before saving."
      throw new Error(this.warning)
    }
  }

  private write(storage: Storage) {
    this.check(storage)
    const updated = JSON.stringify(Array.from(this.records.values()))
    storage.setItem(STORAGE_KEY, updated)
    this.source = updated
    this.savedIds = new Set(this.records.keys())
    this.pendingWrites = false
  }

  save(storage: Storage, note: Note, changes?: Update) {
    const original = this.records.get(note.id)
    const record = original && changes
      ? { ...original, ...changes, lastModified: note.lastModified.toISOString() }
      : { ...original, ...note, lastModified: note.lastModified.toISOString() }
    if (original) this.records.set(note.id, record)
    else this.records = new Map([[note.id, record], ...this.records])
    this.pendingWrites = true
    this.write(storage)
  }

  retain(storage: Storage, notes: Note[]) {
    this.check(storage)
    for (const note of notes) {
      if (this.records.has(note.id)) continue
      this.records.set(note.id, { ...note, lastModified: note.lastModified.toISOString() })
      this.pendingWrites = true
    }
    if (this.pendingWrites) this.write(storage)
  }

  remove(storage: Storage, id: string) {
    // A failed delete must keep its record available for subsequent saves.
    const before = this.records
    this.records = new Map(before)
    this.records.delete(id)
    try {
      this.write(storage)
    } catch (error) {
      this.records = before
      throw error
    }
  }
}

export function mergeFolderNotes(local: Note[], files: Note[]) {
  const notes = [...local]
  const folderIds = new Map<string, string>()
  const unmatched = new Set(local)
  const equivalent = (first: Note, second: Note) => first.title === second.title &&
    normalizeNoteContent(first.content) === normalizeNoteContent(second.content)

  // Resolve identity matches before matching legacy browser IDs by title and
  // content. Each disk file may account for at most one visible note.
  const byId = new Map(local.map((note) => [note.id, note]))
  const remaining: Note[] = []
  for (const file of files) {
    const original = byId.get(file.id)
    if (original && equivalent(original, file)) {
      folderIds.set(original.id, file.id)
      unmatched.delete(original)
    } else {
      remaining.push(file)
    }
  }
  const contentKey = (note: Note) => JSON.stringify([note.title, normalizeNoteContent(note.content)])
  const candidates = new Map<string, Note[]>()
  for (const note of unmatched) {
    const key = contentKey(note)
    const matches = candidates.get(key)
    if (matches) matches.push(note)
    else candidates.set(key, [note])
  }
  for (const file of remaining) {
    const matches = candidates.get(contentKey(file))
    let original: Note | undefined
    if (matches?.length) {
      const sameTime = matches.findIndex((note) => note.lastModified.getTime() === file.lastModified.getTime())
      original = matches.splice(sameTime === -1 ? 0 : sameTime, 1)[0]
    }
    if (original) {
      folderIds.set(original.id, file.id)
      unmatched.delete(original)
    } else {
      const id = byId.has(file.id) ? crypto.randomUUID() : file.id
      notes.push({ ...file, id })
      folderIds.set(id, file.id)
    }
  }
  const linked = new Set(folderIds.keys())
  // A different disk version may already own a browser note's ID. Reserve
  // a fresh identity for that browser copy if the writer chooses to edit it.
  const existingFileIds = new Set(files.map((file) => file.id))
  for (const note of unmatched) {
    if (existingFileIds.has(note.id)) folderIds.set(note.id, crypto.randomUUID())
  }
  return { notes, folderIds, linked }
}
