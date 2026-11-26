"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { AlertDialog, Dialog } from "radix-ui"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { BookOpen, Download, Ellipsis, FolderOpen, Link2, Maximize2, MessageSquare, Minimize2, Moon, NotebookPen, Plus, Search, Sun, Trash2, Type, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor, useEditorState, EditorContent } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import CharacterCount from "@tiptap/extension-character-count"
import { Highlight } from "@tiptap/extension-highlight"
import { TableKit } from "@tiptap/extension-table"
import { EditorToolbar } from "@/components/editor-toolbar"
import { HighlightButton, DEFAULT_HIGHLIGHT_COLOR } from "@/components/highlight-button"
import { toggleNoteHighlight } from "@/lib/note-highlights"
import { NoteImages } from "@/components/note-images"
import { ChartDialog } from "@/components/chart-dialog"
import { NoteImage } from "@/lib/tiptap/note-image"
import { noteStarterKit } from "@/lib/tiptap/note-starter-kit"

import { CreateShareLinkDialog } from "@/components/create-share-link-dialog"
import { ConnectFolderDialog } from "@/components/connect-folder-dialog"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { cn } from "@/lib/utils"
import { FileSystemStorage, fileSystemStorage } from "@/lib/file-system-storage"
import { readLandingDraftHandoff, completeLandingDraftHandoff, landingDraftTitle } from "@/lib/landing-draft"
import { BrowserNotebook, mergeFolderNotes } from "@/lib/browser-notebook"
import { normalizeNoteContent, notePreviewText, richTextToPlainText } from "@/lib/note-content"
import { ParagraphIndent } from "@/lib/tiptap/paragraph-indent"
import { isShareSlug } from "@/lib/share-types"

interface Note {
  id: string
  title: string
  content: string
  lastModified: Date
}

const DEFAULT_FONT_SIZE = 20
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24
const FONT_SIZE_STORAGE_KEY = "nerds-note-font-size"

function parseStoredFontSize(value: string | null) {
  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return null
  }

  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, parsedValue))
}

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isDistractFree, setIsDistractFree] = useState(false)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isFormatOpen, setIsFormatOpen] = useState(false)
  const [highlightColor, setHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR)
  const markerColor = useRef(highlightColor)
  const writingSpace = useRef<HTMLElement>(null)
  const [mediaDialog, setMediaDialog] = useState<{ noteId: string; type: "image" | "chart" } | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const libraryTrigger = useRef<HTMLButtonElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const focusNewNote = useRef(false)
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false)
  const [isConnectFolderDialogOpen, setIsConnectFolderDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [folderSyncNotice, setFolderSyncNotice] = useState<string | null>(null)
  const [shareImportNotice, setShareImportNotice] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)
  const unsavedNoteIds = useRef(new Set<string>())
  const [isStorageReady, setIsStorageReady] = useState(false)

  const [isFileSystemSupported, setIsFileSystemSupported] = useState(false)
  const [connectedDirectoryName, setConnectedDirectoryName] = useState<string | null>(null)
  const [folderBusy, setFolderBusy] = useState(false)
  const transitioning = useRef(false)
  const notebook = useRef(new BrowserNotebook())
  const currentNotes = useRef<Note[]>([])
  const starterId = useRef<string | null>(null)
  const folder = useRef<{ name: string; ids: Map<string, string>; linked: Set<string> } | null>(null)
  const folderTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const activeWrites = useRef(new Set<Promise<void>>())
  const deferredFolderEdits = useRef(new Set<string>())

  function showNotes(next: Note[]) {
    currentNotes.current = next
    setNotes(next)
  }

  function storageFailure(error: unknown) {
    setStorageError(notebook.current.warning ?? (error instanceof DOMException && error.name === "QuotaExceededError"
      ? "Browser storage is full. Download your edits before leaving this page."
      : "Browser saving is unavailable. Download your edits to keep a copy."))
  }

  function saveBrowser(note: Note, changes?: Partial<Pick<Note, "title" | "content">>) {
    try {
      notebook.current.save(localStorage, note, changes)
      unsavedNoteIds.current.clear()
      setStorageError(null)
      return true
    } catch (error) {
      unsavedNoteIds.current.add(note.id)
      storageFailure(error)
      return false
    }
  }

  function cancelFolderTimer(id: string) {
    const pending = folderTimers.current.get(id)
    if (pending) clearTimeout(pending)
    folderTimers.current.delete(id)
  }

  function writeFolder(note: Note) {
    cancelFolderTimer(note.id)
    const destination = folder.current
    if (!destination || notebook.current.warning) return Promise.resolve(false)
    const fileId = destination.ids.get(note.id) ??
      (fileSystemStorage.wasRemoved(note.id) ? crypto.randomUUID() : note.id)
    destination.ids.set(note.id, fileId)
    // Submit directly to the adapter's serial queue before any picker or
    // disconnect can switch its target directory.
    const result = fileSystemStorage.saveNote({ ...note, id: fileId }).then(() => {
      destination.linked.add(note.id)
      return true
    }).catch((error) => {
      console.error("Folder save failed:", error)
      if (folder.current === destination) setFolderSyncNotice("Could not save a change to your folder. Reconnect to review its files.")
      return false
    })
    const pending = result.then(() => {})
    activeWrites.current.add(pending)
    void pending.then(() => { activeWrites.current.delete(pending) })
    return result
  }

  function scheduleFolderSave(note: Note) {
    if (!folder.current) return
    cancelFolderTimer(note.id)
    folderTimers.current.set(note.id, setTimeout(() => { void writeFolder(note) }, 1000))
  }

  function flushFolderSaves() {
    for (const id of folderTimers.current.keys()) {
      const note = currentNotes.current.find((entry) => entry.id === id)
      if (note) void writeFolder(note)
      else cancelFolderTimer(id)
    }
  }

  function finishTransition() {
    transitioning.current = false
    editor?.setEditable(true, false)
    setFolderBusy(false)
    // A file reader or shared-link request can finish while the picker is open.
    for (const id of deferredFolderEdits.current) {
      const note = currentNotes.current.find((entry) => entry.id === id)
      if (note) void writeFolder(note)
    }
    deferredFolderEdits.current.clear()
  }

  function applyFolder(files: Note[], name: string) {
    const local = files.length ? currentNotes.current.filter((note) => note.id !== starterId.current) : currentNotes.current
    const merged = mergeFolderNotes(local, files)
    folder.current = { name, ids: merged.folderIds, linked: merged.linked }
    setConnectedDirectoryName(name)
    showNotes(merged.notes)
    setActiveNoteId((previous) => merged.notes.some((note) => note.id === previous) ? previous : merged.notes[0]?.id ?? null)
    return merged
  }

  const editor = useEditor({
    extensions: [
      ...noteStarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.extend({
        addKeyboardShortcuts() {
          return { "Mod-Shift-h": () => toggleNoteHighlight(this.editor, markerColor.current) }
        },
      }).configure({ multicolor: true }),
      TableKit.configure({
        table: {
          allowTableNodeSelection: true,
          cellMinWidth: 120,
          renderWrapper: true,
          resizable: true,
        },
      }),
      ParagraphIndent,
      NoteImage,
      CharacterCount,
    ],
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: "full",
    },
    editorProps: {
      attributes: {
        class: "note-rich-content prose dark:prose-invert font-serif text-foreground focus:outline-none max-w-none min-h-[50vh] leading-[1.8]",
        role: "textbox",
        "aria-label": "Note body",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content: editor.getHTML() })
      }
    },
  })

  useEffect(() => {
    let cancelled = false
    const browser = new BrowserNotebook()
    notebook.current = browser
    let local: Note[] = []
    try {
      local = browser.read(localStorage)
    } catch (error) {
      browser.warning = "Could not access browser storage. Download your edits to keep a copy."
      storageFailure(error)
    }
    setStorageError(browser.warning)
    if (!local.length && browser.source === null && !browser.warning) {
      const blank = { id: crypto.randomUUID(), title: "", content: "", lastModified: new Date() }
      starterId.current = blank.id
      local = [blank]
    }
    showNotes(local)
    setActiveNoteId(local[0]?.id ?? null)
    try {
      setIsDarkMode(localStorage.getItem("nerds-note-theme") === "dark")
      const size = parseStoredFontSize(localStorage.getItem(FONT_SIZE_STORAGE_KEY))
      if (size !== null) setFontSize(size)
    } catch {
      // Preferences are optional when the browser disallows storage.
    }

    async function restore() {
      try {
        if (!FileSystemStorage.isSupported()) return
        setIsFileSystemSupported(true)
        if (!await fileSystemStorage.loadHandle() || cancelled) return
        if (!await fileSystemStorage.hasPermission("readwrite")) {
          if (!cancelled) setFolderSyncNotice("Folder access has expired. Reconnect your folder to resume saving files.")
          return
        }
        if (cancelled) return
        const files = await fileSystemStorage.loadNotes()
        const name = fileSystemStorage.getDirectoryName()
        if (!cancelled && name) applyFolder(files, name)
      } catch {
        if (!cancelled) setFolderSyncNotice("Could not open your remembered folder. Reconnect to try again.")
      } finally {
        if (!cancelled) setIsStorageReady(true)
      }
    }
    void restore()
    window.addEventListener("pagehide", flushFolderSaves)
    return () => {
      cancelled = true
      window.removeEventListener("pagehide", flushFolderSaves)
      flushFolderSaves()
    }
  }, [])

  useEffect(() => {
    if (!isStorageReady) return
    let cancelled = false
    // Handle openShared URL parameter to import shared notes
    const urlParams = new URLSearchParams(window.location.search)
    const openSharedSlug = urlParams.get("openShared")
    if (openSharedSlug && !isShareSlug(openSharedSlug)) {
      setShareImportNotice("This share link is incomplete. Open the original link to save a copy.")
    } else if (openSharedSlug) {
      // Fetch the shared note and create a local copy
      fetch(`/api/share/${openSharedSlug}`)
        .then(res => {
          if (!res.ok) throw new Error("Shared note unavailable")
          return res.json()
        })
        .then(data => {
          if (!cancelled && data && data.content) {
            const importedNote: Note = {
              id: crypto.randomUUID(),
              title: typeof data.title === "string" ? data.title : "",
              content: normalizeNoteContent(data.content),
              lastModified: new Date(),
            }
            if (addNote(importedNote)) {
              window.history.replaceState({}, document.title, window.location.pathname)
            }
          }
        })
        .catch(() => {
          if (!cancelled) setShareImportNotice("Could not open the shared note. Check your connection or ask the writer for a fresh link.")
        })
    }
    return () => { cancelled = true }
  }, [isStorageReady])

  useEffect(() => {
    if (!isStorageReady) return
    try {
      const handoff = readLandingDraftHandoff(localStorage)
      if (!handoff) return
      const previous = currentNotes.current.find((note) => note.id === handoff.id)
      if (previous && notebook.current.containsSaved(handoff.id)) {
        completeLandingDraftHandoff(localStorage, handoff)
        setActiveNoteId(handoff.id)
        return
      }
      const note = previous ?? {
        id: handoff.id, title: landingDraftTitle(handoff.draft),
        content: normalizeNoteContent(handoff.draft), lastModified: new Date(),
      }
      if (addNote(note)) completeLandingDraftHandoff(localStorage, handoff)
    } catch {
      setStorageError("Could not finish moving the quick draft. Your draft remains on the home page.")
    }
  }, [isStorageReady])

  async function handleConnectDirectory(copyExistingNotes: boolean) {
    if (transitioning.current) return
    transitioning.current = true
    editor?.setEditable(false, false)
    setFolderBusy(true)
    flushFolderSaves()
    const previous = folder.current
    try {
      // The picker needs a user gesture. Flushed writes have already entered
      // the adapter queue ahead of its selected-directory change.
      const changed = await fileSystemStorage.connectDirectory()
      if (!changed) return
      folder.current = null
      setConnectedDirectoryName(null)
      const files = await fileSystemStorage.loadNotes()
      const name = fileSystemStorage.getDirectoryName()
      if (!name) return
      const merged = applyFolder(files, name)
      setFolderSyncNotice(null)
      if (copyExistingNotes && !notebook.current.warning) {
        try {
          notebook.current.check(localStorage)
        } catch (error) {
          storageFailure(error)
          return
        }
        for (const note of merged.notes) {
          if (!notebook.current.hasRecord(note.id) || merged.linked.has(note.id) ||
              previous?.linked.has(note.id) || fileSystemStorage.wasRemoved(note.id)) continue
          await writeFolder(note)
        }
      }
    } catch {
      setFolderSyncNotice("Could not finish opening the folder. Your notebook is still available here.")
    } finally {
      finishTransition()
    }
  }

  async function handleDisconnectDirectory() {
    if (transitioning.current) return
    transitioning.current = true
    editor?.setEditable(false, false)
    setFolderBusy(true)
    try {
      flushFolderSaves()
      await Promise.all(activeWrites.current)
      // Disconnect used to leave folder notes available in the browser. Make
      // that copy durable before releasing the only remembered folder handle.
      try {
        notebook.current.retain(localStorage, currentNotes.current.filter((note) => note.id !== starterId.current))
      } catch (error) {
        storageFailure(error)
        setFolderSyncNotice("The folder is still connected because its notes could not be saved in this browser.")
        return
      }
      await fileSystemStorage.disconnectDirectory()
      folder.current = null
      setConnectedDirectoryName(null)
      setFolderSyncNotice(null)
      setStorageError(null)
    } catch {
      setFolderSyncNotice("Could not finish disconnecting the folder.")
    } finally {
      finishTransition()
    }
  }

  useEffect(() => {
    if (!isStorageReady) return
    document.documentElement.classList.toggle("dark", isDarkMode)
    try {
      localStorage.setItem("nerds-note-theme", isDarkMode ? "dark" : "light")
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize))
    } catch {
      // Appearance settings still apply for this session.
    }
  }, [isDarkMode, fontSize, isStorageReady])

  const activeNote = notes.find((note) => note.id === activeNoteId)
  useEffect(() => {
    if (mediaDialog && mediaDialog.noteId !== activeNoteId) setMediaDialog(null)
  }, [mediaDialog, activeNoteId])

  // Sync editor content when active note changes
  const prevActiveNoteIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (isStorageReady && editor && activeNote && activeNote.id !== prevActiveNoteIdRef.current) {
      editor.commands.setContent(normalizeNoteContent(activeNote.content), {
        emitUpdate: false,
        parseOptions: {
          preserveWhitespace: "full",
        },
      })
      prevActiveNoteIdRef.current = activeNote.id
      if (focusNewNote.current) {
        focusNewNote.current = false
        editor.commands.focus("start")
      }
    }
  }, [activeNoteId, activeNote, editor, isStorageReady])

  function addNote(note: Note) {
    const previous = currentNotes.current.filter((existing) => existing.id !== starterId.current && existing.id !== note.id)
    starterId.current = null
    showNotes([note, ...previous])
    setActiveNoteId(note.id)
    const saved = saveBrowser(note)
    if (transitioning.current) deferredFolderEdits.current.add(note.id)
    else void writeFolder(note)
    return saved
  }

  function createNewNote() {
    if (transitioning.current) return
    focusNewNote.current = true
    setIsLibraryOpen(false)
    addNote({ id: crypto.randomUUID(), title: "", content: "", lastModified: new Date() })
  }

  function updateNote(id: string, changes: Partial<Pick<Note, "content" | "title">>) {
    const existing = currentNotes.current.find((note) => note.id === id)
    if (!existing) return
    if (starterId.current === id) starterId.current = null
    const updated = { ...existing, ...changes, lastModified: new Date() }
    showNotes(currentNotes.current.map((note) => note.id === id ? updated : note))
    saveBrowser(updated, changes)
    if (transitioning.current) {
      deferredFolderEdits.current.add(id)
    } else {
      if (changes.title !== undefined) void writeFolder(updated)
      else scheduleFolderSave(updated)
    }
  }

  async function deleteNote(id: string) {
    if (transitioning.current) return
    transitioning.current = true
    editor?.setEditable(false, false)
    setFolderBusy(true)
    try {
      notebook.current.check(localStorage)
      cancelFolderTimer(id)
      const destination = folder.current
      if (destination && destination.ids.has(id)) {
        // The adapter orders a confirmed deletion after any already-submitted
        // write, and refuses it if the file changed externally.
        await fileSystemStorage.deleteNote(destination.ids.get(id)!)
        destination.ids.delete(id)
        destination.linked.delete(id)
      }
      notebook.current.remove(localStorage, id)
      const remaining = currentNotes.current.filter((note) => note.id !== id)
      showNotes(remaining)
      setActiveNoteId((previous) => previous === id ? remaining[0]?.id ?? null : previous)
      setStorageError(null)
    } catch (error) {
      if (notebook.current.warning || error instanceof DOMException && error.name === "QuotaExceededError") storageFailure(error)
      else setFolderSyncNotice("Could not finish deleting the note. Its current contents remain available here.")
    } finally {
      finishTransition()
    }
  }

  function downloadFile(content: string, mime: string, filename: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const exportNote = () => {
    if (!activeNote) return
    const content = richTextToPlainText(editor?.getHTML() || activeNote.content)

    downloadFile(content, "text/plain", `${activeNote.title.trim() || "Untitled"}.txt`)
  }

  function exportRichNote(note: Note) {
    downloadFile(normalizeNoteContent(note.content), "text/plain", `${note.title.trim() || "Untitled"}.txt`)
  }

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: normalizeNoteContent(content),
        lastModified: new Date(),
      }
      addNote(newNote)
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const filteredNotes = isLibraryOpen ? notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      richTextToPlainText(note.content).toLowerCase().includes(searchQuery.toLowerCase()),
  ) : []

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStorageReady || transitioning.current || isCreateLinkDialogOpen || isFeedbackDialogOpen || isConnectFolderDialogOpen || (mediaDialog && mediaDialog.noteId === activeNoteId) || noteToDelete) return
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault()
            createNewNote()
            break
          case "s":
            e.preventDefault()
            // Auto-save is already handled
            break
          case "f":
            e.preventDefault()
            setIsDistractFree(false)
            setIsLibraryOpen(true)
            searchRef.current?.focus()
            break
        }
      }
      if (e.key === "F11") {
        e.preventDefault()
        setIsDistractFree((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isStorageReady, isCreateLinkDialogOpen, isFeedbackDialogOpen, isConnectFolderDialogOpen, mediaDialog, activeNoteId, noteToDelete, connectedDirectoryName])

  const editorDetails = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      let hasImages = false
      instance?.state.doc.descendants((node) => {
        if (node.type.name === "noteImage") hasImages = true
        return !hasImages
      })
      return {
        empty: instance?.isEmpty ?? true, hasImages,
        highlighted: instance?.isActive("highlight") ?? false,
        words: instance?.storage.characterCount?.words() ?? 0,
        characters: instance?.storage.characterCount?.characters() ?? 0,
      }
    },
  })
  const wordCount = editorDetails?.words ?? 0
  const characterCount = editorDetails?.characters ?? 0
  const hasImages = editorDetails?.hasImages ?? false
  const otherUnsavedNotes = storageError
    ? notes.filter((note) => note.id !== activeNoteId && unsavedNoteIds.current.has(note.id))
    : []

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
      {isDistractFree ? (
        <div className="flex justify-end px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setIsDistractFree(false)} className="text-muted-foreground" title="Exit focus mode (F11)">
            <Minimize2 /> Exit focus
          </Button>
        </div>
      ) : (
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <Link href="/" aria-label="NerdsNote home" className="flex items-center gap-2 text-foreground">
              <NotebookPen className="size-5 text-primary" strokeWidth={1.6} />
              <span className="hidden font-serif text-xl tracking-tight sm:inline">NerdsNote</span>
            </Link>
            <span aria-hidden="true" className="h-4 w-px bg-border" />
            <Button ref={libraryTrigger} variant="ghost" size="sm" onClick={() => setIsLibraryOpen(true)} aria-haspopup="dialog">
              <BookOpen /> Notes
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" aria-controls="editor-formatting" aria-expanded={isFormatOpen}
              disabled={!activeNote || folderBusy} onClick={() => setIsFormatOpen(!isFormatOpen)} className={cn("text-muted-foreground", isFormatOpen && "bg-accent text-foreground")}>
              <Type /> Format
            </Button>
            <Button variant="ghost" size="sm" aria-label="Enter focus mode" title="Enter focus mode (F11)"
              disabled={!activeNote} onClick={() => setIsDistractFree(true)} className="text-muted-foreground">
              <Maximize2 /><span className="hidden sm:inline">Focus</span>
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="More options" title="More options"><Ellipsis /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={createNewNote} disabled={!isStorageReady || folderBusy}><Plus /> New note</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsCreateLinkDialogOpen(true)} disabled={!activeNote}><Link2 /> Share note</DropdownMenuItem>
                <DropdownMenuItem onSelect={exportNote} disabled={!activeNote}><Download /> Download text file</DropdownMenuItem>
                {hasImages && activeNote && <DropdownMenuItem onSelect={() => exportRichNote(activeNote)}><Download /> Download note with images</DropdownMenuItem>}
                <DropdownMenuItem onSelect={() => importRef.current?.click()} disabled={!isStorageReady || folderBusy}><Upload /> Import a file</DropdownMenuItem>
                <DropdownMenuSeparator />
                {isFileSystemSupported && (
                  <DropdownMenuItem onSelect={() => setIsConnectFolderDialogOpen(true)} disabled={!isStorageReady || folderBusy}>
                    <FolderOpen /> {connectedDirectoryName ? "Change folder" : "Connect a folder"}
                  </DropdownMenuItem>
                )}
                {connectedDirectoryName && (
                  <DropdownMenuItem onSelect={() => void handleDisconnectDirectory()}><X /> Disconnect folder</DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun /> : <Moon />} {isDarkMode ? "Light appearance" : "Dark appearance"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsFeedbackDialogOpen(true)}><MessageSquare /> Send feedback</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      <input ref={importRef} type="file" accept=".txt,.md" onChange={importFile} className="hidden" aria-label="Import a text or Markdown file" />
      {(storageError || folderSyncNotice || shareImportNotice) && (
        <div role="alert" className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-border bg-muted px-4 py-2 text-sm">
          {storageError && <span>{storageError}</span>}
          {folderSyncNotice && <span>{folderSyncNotice}</span>}
          {shareImportNotice && <span>{shareImportNotice}</span>}
          {storageError && notebook.current.warning && notebook.current.source !== null && (
            <button onClick={() => downloadFile(notebook.current.source!, "application/json", "nerdsnote-original.json")} className="font-medium underline">
              Download original notebook
            </button>
          )}
          {storageError && activeNote && (unsavedNoteIds.current.has(activeNote.id) || !otherUnsavedNotes.length) && (
            <button onClick={hasImages ? () => exportRichNote(activeNote) : exportNote} className="font-medium underline">
              {hasImages ? "Download note with images" : "Download note"}
            </button>
          )}
          {otherUnsavedNotes.map((note) => (
            <button key={note.id} onClick={() => exportRichNote(note)} className="font-medium underline">
              Download {note.title || "untitled note"} backup
            </button>
          ))}
          {folderSyncNotice && isFileSystemSupported && (
            <button onClick={() => setIsConnectFolderDialogOpen(true)} className="font-medium underline">Reconnect folder</button>
          )}
        </div>
      )}
      {editor && activeNote && isStorageReady && (
        <NoteImages key={activeNote.id} editor={editor} open={mediaDialog?.type === "image" && mediaDialog.noteId === activeNote.id}
          onClose={() => setMediaDialog(null)} />
      )}
      {editor && activeNote && mediaDialog?.type === "chart" && mediaDialog.noteId === activeNote.id && (
        <ChartDialog key={activeNote.id} editor={editor} onClose={() => setMediaDialog(null)} />
      )}
      {activeNote && isFormatOpen && !isDistractFree && !folderBusy && (
        <div id="editor-formatting"><EditorToolbar editor={editor} fontSize={fontSize} onFontSizeChange={setFontSize} onImageAction={() => setMediaDialog({ noteId: activeNote.id, type: "image" })}
          highlightColor={highlightColor} onHighlightColorChange={color => { markerColor.current = color; setHighlightColor(color) }}
          onChartAction={() => setMediaDialog({ noteId: activeNote.id, type: "chart" })} contained /></div>
      )}

      <main ref={writingSpace} className="scrollbar-theme min-h-0 flex-1 overflow-y-auto" aria-label="Writing space">
        {isStorageReady && (activeNote ? (
          <div className="mx-auto w-full max-w-[47rem] px-6 pt-[clamp(3rem,9vh,7rem)] pb-16 sm:px-12">
            <input
              aria-label="Note title"
              readOnly={folderBusy}
              value={activeNote.title}
              onChange={(event) => updateNote(activeNote.id, { title: event.target.value })}
              placeholder="Untitled"
              className="block w-full min-w-0 rounded-none border-0 bg-transparent p-0 font-serif text-[clamp(2.35rem,5vw,3.4rem)] leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/80"
            />
            <div className="relative mt-6">
              {editorDetails?.empty && (
                <span aria-hidden="true" className="pointer-events-none absolute top-0 font-serif leading-[1.8] text-muted-foreground" style={{ fontSize }}>
                  Start writing…
                </span>
              )}
              <EditorContent editor={editor} style={{ fontSize }} />
              {editor && (!isFormatOpen || isDistractFree) && !folderBusy && (
                <BubbleMenu editor={editor} pluginKey="selectionHighlight"
                  options={{ placement: "bottom", offset: 8, flip: true, shift: { padding: 8 }, scrollTarget: writingSpace.current ?? undefined }}
                  shouldShow={({ editor, view, element, state, from, to }) =>
                    editor.isEditable && (view.hasFocus() || element.contains(document.activeElement)) &&
                    from < to && !!state.doc.textBetween(from, to).length
                  }
                  className="rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                  <HighlightButton editor={editor} color={highlightColor} pressed={editorDetails?.highlighted ?? false} showLabel />
                </BubbleMenu>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[47rem] flex-col items-start px-6 pt-[clamp(4rem,14vh,9rem)] sm:px-12">
            <BookOpen className="mb-5 size-7 text-primary" strokeWidth={1.4} />
            <h1 className="font-serif text-4xl tracking-tight">{notebook.current.warning ? "Your stored notebook needs attention." : "Your notebook is empty."}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{notebook.current.warning ? "New writing stays in this session. Download a copy before closing the page." : "Create a note or open a text file to begin."}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button onClick={createNewNote}><Plus /> New note</Button>
              <Button variant="ghost" onClick={() => importRef.current?.click()}><Upload /> Import a file</Button>
            </div>
          </div>
        ))}
      </main>

      {isStorageReady && activeNote && !isDistractFree && (
        <footer className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground sm:px-8">
          <span className="truncate">{storageError ? "Browser save unavailable" : connectedDirectoryName && folder.current?.linked.has(activeNote.id) ? `Folder · ${connectedDirectoryName}` : notebook.current.containsSaved(activeNote.id) ? "Saved in this browser" : starterId.current === activeNote.id ? "Saves in this browser" : "Available in this session"}</span>
          <span className="shrink-0 tabular-nums" title={`${characterCount} characters · Edited ${activeNote.lastModified.toLocaleString()}`}>
            {wordCount} {wordCount === 1 ? "word" : "words"}<span className="hidden sm:inline"> · {characterCount} characters</span>
          </span>
        </footer>
      )}

      <Dialog.Root open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-30 bg-black/15" />
          <Dialog.Content aria-describedby={undefined}
            onOpenAutoFocus={(event) => { event.preventDefault(); searchRef.current?.focus() }}
            onCloseAutoFocus={(event) => { event.preventDefault(); if (focusNewNote.current) editor?.commands.focus(); else libraryTrigger.current?.focus() }}
            className="fixed inset-y-0 left-0 z-40 flex w-[min(23rem,calc(100vw-2rem))] flex-col border-r border-border bg-sidebar text-sidebar-foreground outline-none">
            <div className="flex items-center justify-between px-5 py-4">
              <Dialog.Title className="font-serif text-2xl">Your notes</Dialog.Title>
              <Dialog.Close asChild><Button size="icon" variant="ghost" aria-label="Close notes"><X /></Button></Dialog.Close>
            </div>
            <div className="px-5 pb-4">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input type="search" ref={searchRef} aria-label="Search notes" placeholder="Search notes" value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm focus-visible:outline-ring" />
              </div>
              <Button onClick={createNewNote} disabled={!isStorageReady || folderBusy} className="w-full"><Plus /> New note</Button>
            </div>
            <div className="scrollbar-theme flex-1 overflow-y-auto border-t border-border/70 px-3 py-2">
              {filteredNotes.length === 0 && <p className="px-3 py-5 text-sm text-muted-foreground">{searchQuery ? "No matching notes." : "No notes yet."}</p>}
              {filteredNotes.map((note) => (
                <div key={note.id} className={cn("group my-1 flex items-center rounded-md hover:bg-accent/55", activeNoteId === note.id && "bg-accent")}>
                  <button type="button" onClick={() => { setActiveNoteId(note.id); setIsLibraryOpen(false) }}
                    aria-current={activeNoteId === note.id ? "true" : undefined} className="min-w-0 flex-1 px-3 py-3 text-left">
                    <span className="block truncate font-serif text-lg">{note.title || "Untitled"}</span>{" "}
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{notePreviewText(note.content) || "Empty note"}</span>
                  </button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${note.title || "untitled note"}`}
                    disabled={folderBusy} onClick={() => setNoteToDelete(note.id)} className="mr-1 text-muted-foreground sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CreateShareLinkDialog isOpen={isCreateLinkDialogOpen} onClose={() => setIsCreateLinkDialogOpen(false)}
        noteContent={isCreateLinkDialogOpen && activeNote ? (editor?.getHTML() ?? normalizeNoteContent(activeNote.content)) : ""} />
      <FeedbackDialog isOpen={isFeedbackDialogOpen} onClose={() => setIsFeedbackDialogOpen(false)} />
      <ConnectFolderDialog isOpen={isConnectFolderDialogOpen} onClose={() => setIsConnectFolderDialogOpen(false)} defaultCopyExisting={!folderSyncNotice && !connectedDirectoryName} onConfirm={handleConnectDirectory} />
      <AlertDialog.Root open={noteToDelete !== null} onOpenChange={(open) => { if (!open) setNoteToDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/25" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6">
            <AlertDialog.Title className="font-serif text-2xl">Delete this note?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              This permanently removes the note{connectedDirectoryName ? " and its connected file" : " from this browser"}.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild><Button variant="outline">Cancel</Button></AlertDialog.Cancel>
              <AlertDialog.Action asChild><Button variant="destructive" onClick={() => { if (noteToDelete) deleteNote(noteToDelete) }}>Delete note</Button></AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
