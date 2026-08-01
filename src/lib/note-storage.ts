import { normalizeNoteContent } from "@/lib/note-content"

export const NOTES_STORAGE_KEY = "nerds-note-data"
export const BACKUP_FORMAT = "nerdsnote-backup"
export const BACKUP_VERSION = 1

export interface Note {
  id: string
  title: string
  content: string
  lastModified: Date
}

interface SerializedNote {
  id: string
  title: string
  content: string
  lastModified: string
}

export interface NerdsNoteBackup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  notes: SerializedNote[]
}

type ReadStorage = Pick<Storage, "getItem">
type WriteStorage = Pick<Storage, "setItem">

function parseSerializedNote(value: unknown): Note {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid note entry")
  }

  const candidate = value as Partial<SerializedNote>
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.content !== "string" ||
    typeof candidate.lastModified !== "string"
  ) {
    throw new Error("Invalid note fields")
  }

  const lastModified = new Date(candidate.lastModified)
  if (Number.isNaN(lastModified.getTime())) {
    throw new Error("Invalid note date")
  }

  return {
    id: candidate.id,
    title: candidate.title,
    content: normalizeNoteContent(candidate.content),
    lastModified,
  }
}

function serializeNote(note: Note): SerializedNote {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    lastModified: note.lastModified.toISOString(),
  }
}

export function loadBrowserNotes(storage: ReadStorage): Note[] | null {
  const savedNotes = storage.getItem(NOTES_STORAGE_KEY)
  if (savedNotes === null) {
    return null
  }

  const parsed: unknown = JSON.parse(savedNotes)
  if (!Array.isArray(parsed)) {
    throw new Error("Stored notes must be an array")
  }

  return parsed.map(parseSerializedNote)
}

export function persistBrowserNotes(storage: WriteStorage, notes: readonly Note[]) {
  storage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes.map(serializeNote)))
}

export function createBackup(notes: readonly Note[]): NerdsNoteBackup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    notes: notes.map(serializeNote),
  }
}

export function parseBackup(value: string): Note[] {
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup file")
  }

  const backup = parsed as Partial<NerdsNoteBackup>
  if (
    backup.format !== BACKUP_FORMAT ||
    backup.version !== BACKUP_VERSION ||
    !Array.isArray(backup.notes)
  ) {
    throw new Error("Unsupported NerdsNote backup")
  }

  return backup.notes.map(parseSerializedNote)
}
