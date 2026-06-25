"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Upload, Search, Plus, Trash2, Moon, Sun, FileText, Maximize2, Minimize2, Menu, X, MessageSquare, Link2, Sparkles, FolderOpen, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import CharacterCount from "@tiptap/extension-character-count"
import { EditorToolbar } from "@/components/editor-toolbar"

import { CreateShareLinkDialog } from "@/components/create-share-link-dialog"
import { ConnectFolderDialog } from "@/components/connect-folder-dialog"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { cn } from "@/lib/utils"
import { FileSystemStorage, fileSystemStorage } from "@/lib/file-system-storage"
import { normalizeNoteContent, notePreviewText, richTextToPlainText } from "@/lib/note-content"

interface Note {
  id: string
  title: string
  content: string
  lastModified: Date
}

const DEFAULT_FONT_SIZE = 16
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false)
  const [isConnectFolderDialogOpen, setIsConnectFolderDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [folderSyncNotice, setFolderSyncNotice] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  // File System Storage State
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(false)
  const [connectedDirectoryName, setConnectedDirectoryName] = useState<string | null>(null)
  // Per-note debounce timers for folder saves, so editing note A then quickly
  // switching to note B never drops A's pending save.
  const saveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearFolderSaveTimers = () => {
    for (const timeout of saveTimeoutsRef.current.values()) {
      clearTimeout(timeout)
    }
    saveTimeoutsRef.current.clear()
  }

  const loadLocalStorageNotes = () => {
    const savedNotes = localStorage.getItem("nerds-note-data")

    if (savedNotes) {
      let parsedNotes: Note[]
      try {
        parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          content: normalizeNoteContent(note.content),
          lastModified: new Date(note.lastModified),
        }))
      } catch (error) {
        // Corrupt data shouldn't blank the app — start fresh and let the next
        // save overwrite the bad value.
        console.error("Failed to parse saved notes:", error)
        setNotes([])
        setActiveNoteId(null)
        return null
      }
      setNotes(parsedNotes)
      if (parsedNotes.length > 0) {
        setActiveNoteId(parsedNotes[0].id)
      } else {
        setActiveNoteId(null)
      }
      return savedNotes
    }

    setNotes([])
    setActiveNoteId(null)
    return null
  }

  const isFileSystemPermissionError = (error: unknown) =>
    error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")

  const handleFolderSyncUnavailable = async (
    message = "Folder access expired. Reconnect your folder to keep syncing to local files.",
  ) => {
    clearFolderSaveTimers()

    await fileSystemStorage.disconnectDirectory()
    setConnectedDirectoryName(null)
    setFolderSyncNotice(message)
  }

  const ensureDirectoryWriteAccess = async (interactive = false) => {
    if (!connectedDirectoryName) {
      return false
    }

    try {
      const hasAccess = interactive
        ? await fileSystemStorage.verifyPermission("readwrite")
        : await fileSystemStorage.hasPermission("readwrite")

      if (hasAccess) {
        setFolderSyncNotice(null)
        return true
      }
    } catch (error) {
      console.error("Failed to verify folder permission:", error)
    }

    await handleFolderSyncUnavailable()
    return false
  }

  const saveNoteToDirectory = async (note: Note, interactive = false) => {
    // An immediate save supersedes any pending debounced save for this note, so
    // a stale timer can't fire afterwards and clobber a rename.
    const pending = saveTimeoutsRef.current.get(note.id)
    if (pending) {
      clearTimeout(pending)
      saveTimeoutsRef.current.delete(note.id)
    }

    if (!(await ensureDirectoryWriteAccess(interactive))) {
      return false
    }

    try {
      await fileSystemStorage.saveNote(note)
      setFolderSyncNotice(null)
      return true
    } catch (error) {
      if (isFileSystemPermissionError(error)) {
        await handleFolderSyncUnavailable()
      } else {
        console.error("Failed to sync note to folder:", error)
      }
      return false
    }
  }

  const scheduleFolderSave = (note: Note) => {
    const timeouts = saveTimeoutsRef.current
    const existing = timeouts.get(note.id)
    if (existing) {
      clearTimeout(existing)
    }
    timeouts.set(
      note.id,
      setTimeout(() => {
        timeouts.delete(note.id)
        void saveNoteToDirectory(note, false)
      }, 1000),
    )
  }

  const deleteNoteFromDirectory = async (noteId: string) => {
    if (!(await ensureDirectoryWriteAccess(false))) {
      return false
    }

    try {
      await fileSystemStorage.deleteNote(noteId)
      setFolderSyncNotice(null)
      return true
    } catch (error) {
      if (isFileSystemPermissionError(error)) {
        await handleFolderSyncUnavailable()
      } else {
        console.error("Failed to delete note from folder:", error)
      }
      return false
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
    ],
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: "full",
    },
    editorProps: {
      attributes: {
        class: "note-rich-content prose dark:prose-invert focus:outline-none max-w-none h-full min-h-[50vh] px-4 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content: editor.getHTML() })
      }
    },
  })

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = loadLocalStorageNotes()
    if (!savedNotes) {
      // Create initial note
      const initialNote: Note = {
        id: "1",
        title: "NerdsNote",
        content: normalizeNoteContent("Create a new note to get started with this distraction-free online notepad. Perfect for quick notes, note taking, and private writing. No login required, works offline, and auto-saves to your browser."),
        lastModified: new Date(),
      }
      setNotes([initialNote])
      setActiveNoteId(initialNote.id)
    }

    // Check if user has seen the new features announcement
    const hasSeenAnnouncement = localStorage.getItem("nerds-note-seen-v6-features")
    if (savedNotes && !hasSeenAnnouncement) {
      // Only show to existing users (who have saved notes)
      setShowAnnouncement(true)
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("nerds-note-theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    const savedFontSize = parseStoredFontSize(localStorage.getItem(FONT_SIZE_STORAGE_KEY))
    if (savedFontSize !== null) {
      setFontSize(savedFontSize)
    }

    // Handle openShared URL parameter to import shared notes
    const urlParams = new URLSearchParams(window.location.search)
    const openSharedSlug = urlParams.get("openShared")
    if (openSharedSlug) {
      // Fetch the shared note and create a local copy
      fetch(`/api/share/${openSharedSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.content) {
            const importedNote: Note = {
              id: Date.now().toString(),
              title: "New Note",
              content: normalizeNoteContent(data.content),
              lastModified: new Date(),
            }
            setNotes(prev => [importedNote, ...prev])
            setActiveNoteId(importedNote.id)
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        })
        .catch(() => {
          // Failed to fetch shared note, ignore
        })
    }
  }, [])

  // Initialize File System Storage
  useEffect(() => {
    if (FileSystemStorage.isSupported()) {
      setIsFileSystemSupported(true)
      fileSystemStorage.loadHandle().then(async (success) => {
        if (success) {
          const hasWriteAccess = await fileSystemStorage.hasPermission("readwrite")
          if (!hasWriteAccess) {
            await handleFolderSyncUnavailable()
            return
          }

          const name = fileSystemStorage.getDirectoryName()
          setConnectedDirectoryName(name)
          setFolderSyncNotice(null)
          // If connected, load notes from FS
          try {
            const fsNotes = await fileSystemStorage.loadNotes()
            if (fsNotes.length > 0) {
              setNotes(fsNotes)
              setActiveNoteId(fsNotes[0].id)
            }
          } catch (error) {
            if (isFileSystemPermissionError(error)) {
              await handleFolderSyncUnavailable()
            } else {
              console.error("Failed to load notes from connected folder:", error)
            }
          }
        }
      })
    }
  }, [])

  const handleConnectDirectory = async () => {
    try {
      await fileSystemStorage.connectDirectory()
      const directoryName = fileSystemStorage.getDirectoryName()
      if (!directoryName) {
        return
      }

      setConnectedDirectoryName(directoryName)
      setFolderSyncNotice(null)

      // Save existing notes to the new folder (Migration)
      for (const note of notes) {
        await fileSystemStorage.saveNote(note)
      }

      // Reload from FS to ensure consistency
      const fsNotes = await fileSystemStorage.loadNotes()
      setNotes(fsNotes)
      if (fsNotes.length > 0 && !activeNoteId) {
        setActiveNoteId(fsNotes[0].id)
      }
    } catch (error) {
      console.error("Failed to connect directory:", error)
      if (isFileSystemPermissionError(error)) {
        await handleFolderSyncUnavailable("Folder access was denied. Reconnect the folder to enable local sync.")
      }
    }
  }

  const handleDisconnectDirectory = async () => {
    await fileSystemStorage.disconnectDirectory()
    setConnectedDirectoryName(null)
    setFolderSyncNotice(null)
    // Reload notes from localStorage
    loadLocalStorageNotes()
  }

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      try {
        localStorage.setItem("nerds-note-data", JSON.stringify(notes))
        setStorageError(null)
      } catch (error) {
        // Most likely QuotaExceededError. Surface it instead of failing silently.
        console.error("Failed to save notes to browser storage:", error)
        setStorageError(
          "Browser storage is full — recent changes may not be saved. Export important notes or connect a local folder.",
        )
      }
    }
  }, [notes])

  useEffect(() => {
    return () => {
      clearFolderSaveTimers()
    }
  }, [])

  // Toggle theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("nerds-note-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("nerds-note-theme", "light")
    }
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize))
  }, [fontSize])

  const activeNote = notes.find((note) => note.id === activeNoteId)

  // Sync editor content when active note changes
  const prevActiveNoteIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (editor && activeNote && activeNote.id !== prevActiveNoteIdRef.current) {
      editor.commands.setContent(normalizeNoteContent(activeNote.content), {
        emitUpdate: false,
        parseOptions: {
          preserveWhitespace: "full",
        },
      })
      prevActiveNoteIdRef.current = activeNote.id
    }
  }, [activeNoteId, activeNote, editor])

  const createNewNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      lastModified: new Date(),
    }

    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)

    if (connectedDirectoryName) {
      void saveNoteToDirectory(newNote, true)
    }
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => {
      if (note.id === id) {
        const updatedNote = { ...note, ...updates, lastModified: new Date() }

        // Sync to File System
        if (connectedDirectoryName) {
          // Check for rename
          if (typeof updates.title === "string" && updates.title !== note.title) {
            // saveNote moves the underlying file and cleans up the old one,
            // so a rename is just an immediate save.
            void saveNoteToDirectory(updatedNote, false)
          } else if (Object.prototype.hasOwnProperty.call(updates, "content")) {
            // Debounce content saves, keyed per note so switching notes mid-edit
            // doesn't drop a pending save.
            scheduleFolderSave(updatedNote)
          }
        }

        return updatedNote
      }
      return note
    }))
  }

  const deleteNote = (id: string) => {
    if (connectedDirectoryName) {
      void deleteNoteFromDirectory(id)
    }

    setNotes((prev) => {
      const filtered = prev.filter((note) => note.id !== id)
      if (activeNoteId === id && filtered.length > 0) {
        setActiveNoteId(filtered[0].id)
      } else if (filtered.length === 0) {
        setActiveNoteId(null)
      }
      return filtered
    })
  }

  const exportNote = () => {
    if (!activeNote) return
    const content = richTextToPlainText(editor?.getHTML() || activeNote.content)

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeNote.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newNote: Note = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: normalizeNoteContent(content),
        lastModified: new Date(),
      }
      setNotes((prev) => [newNote, ...prev])
      setActiveNoteId(newNote.id)

      if (connectedDirectoryName) {
        void saveNoteToDirectory(newNote, true)
      }
    }
    reader.readAsText(file)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      richTextToPlainText(note.content).toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const isSavingToFolder = Boolean(connectedDirectoryName)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            document.getElementById("search-input")?.focus()
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
  }, [activeNote, editor])

  return (
    <div
      className={cn(
        "min-h-[100dvh] overflow-x-hidden bg-background text-foreground transition-all duration-300",
        isDistractFree && "overflow-hidden",
      )}
    >
      {/* Header */}
      {!isDistractFree && (
        <header className="sticky top-0 z-10 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              {/* Mobile hamburger menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="h-9 w-9 shrink-0 p-0 md:hidden"
                aria-label="Open notes sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <h1 className="truncate text-lg font-bold text-primary sm:text-xl">NerdsNote</h1>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Search notes... (Ctrl+F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsFeedbackDialogOpen(true)} className="hidden sm:flex">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {isFileSystemSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!connectedDirectoryName) {
                      setIsConnectFolderDialogOpen(true)
                    }
                  }}
                  className={cn(
                    "hidden max-w-56 gap-2 border-border/70 bg-background/70 text-xs sm:flex",
                    connectedDirectoryName && "border-primary/30 bg-primary/5 text-primary",
                  )}
                >
                  {connectedDirectoryName ? (
                    <FolderOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <HardDrive className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {connectedDirectoryName ? `Saving to ${connectedDirectoryName}` : "Browser storage"}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateLinkDialogOpen(true)}
                className="h-9 px-2 font-medium text-primary sm:px-3"
                disabled={!activeNote}
                aria-label="Create share link"
              >
                <Link2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Link</span>
              </Button>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDistractFree(true)}
                title="Enter focus mode"
                aria-label="Enter focus mode"
                className="h-9 w-9 gap-2 p-0 sm:w-auto sm:px-3"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="hidden lg:inline">Focus</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="h-9 w-9 p-0 sm:w-auto sm:px-3"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className={cn(
        "flex min-w-0",
        isDistractFree ? "h-[100dvh]" : "h-[calc(100dvh-65px)] sm:h-[calc(100dvh-73px)]"
      )}>
        {/* Mobile Overlay */}
        {!isDistractFree && isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {!isDistractFree && (
          <aside className={cn(
            "w-[min(20rem,calc(100vw-2rem))] border-r border-border bg-sidebar flex flex-col transition-transform duration-300 md:w-80",
            "md:translate-x-0 md:static md:z-auto md:h-full",
            isMobileSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 h-[100dvh] translate-x-0"
              : "fixed inset-y-0 left-0 z-50 h-[100dvh] -translate-x-full"
          )}>
            <div className="p-4 border-b border-sidebar-border">
              {/* Mobile close button */}
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h2 className="text-lg font-semibold">NerdsNote</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile search bar */}
              <div className="relative mb-4 md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes... (Ctrl+F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  createNewNote()
                  setIsMobileSidebarOpen(false)
                }} size="sm" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                <Button variant="outline" size="sm" onClick={exportNote} disabled={!activeNote}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="h-4 w-4" />
                    <input type="file" accept=".txt,.md" onChange={importFile} className="hidden" />
                  </label>
                </Button>
              </div>

              {isFileSystemSupported && (
                <Card
                  className={cn(
                    "mt-4 gap-3 rounded-md border-border/70 bg-background/70 p-3 shadow-none",
                    isSavingToFolder && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-md bg-muted p-2 text-muted-foreground",
                        isSavingToFolder && "bg-primary/10 text-primary",
                      )}
                    >
                      {isSavingToFolder ? (
                        <FolderOpen className="h-4 w-4" />
                      ) : (
                        <HardDrive className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {isSavingToFolder ? "Storage: Local folder" : "Storage: Browser only"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {isSavingToFolder
                          ? `Saving to: ${connectedDirectoryName}`
                          : "Notes are saved in this browser."}
                      </p>
                    </div>
                  </div>

                  {folderSyncNotice && (
                    <p className="rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                      {folderSyncNotice}
                    </p>
                  )}

                  {isSavingToFolder ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsConnectFolderDialogOpen(true)}
                        className="h-8 text-xs"
                      >
                        Change folder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDisconnectDirectory}
                        className="h-8 text-xs text-muted-foreground"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConnectFolderDialogOpen(true)}
                      className="h-8 w-full gap-2 border-primary/40 bg-primary/5 text-xs text-primary hover:bg-primary/10"
                    >
                      <HardDrive className="h-3.5 w-3.5" />
                      Save to a local folder
                    </Button>
                  )}
                </Card>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-theme">
              {filteredNotes.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? "No notes found" : "No notes yet"}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={cn(
                        "group p-3 cursor-pointer transition-colors hover:bg-accent/50",
                        activeNoteId === note.id && "bg-accent text-accent-foreground",
                      )}
                      onClick={() => {
                        setActiveNoteId(note.id)
                        setIsMobileSidebarOpen(false)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm">{note.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notePreviewText(note.content) || "Empty note"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{note.lastModified.toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setNoteToDelete(note.id)
                          }}
                          className="ml-2 h-7 w-7 shrink-0 p-0 opacity-100 hover:bg-destructive hover:text-destructive-foreground sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`Delete ${note.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </aside>
        )}

        {/* Main Editor Container */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Main Editor */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeNote ? (
              <>
                {!isDistractFree && (
                  <div className="border-b border-border px-3 py-3 sm:p-4">
                    <Input
                      value={activeNote.title}
                      onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                      className="border-none bg-transparent p-0 text-base font-medium focus-visible:ring-0 sm:text-lg"
                      placeholder="Note title..."
                    />
                  </div>
                )}

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <EditorToolbar
                    editor={editor}
                    fontSize={fontSize}
                    onFontSizeChange={setFontSize}
                    contained={isDistractFree}
                    endContent={
                      isDistractFree ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDistractFree(false)}
                          className="h-8 gap-2 bg-background/80"
                        >
                          <Minimize2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Exit Full Screen</span>
                          <span className="sm:hidden">Exit</span>
                        </Button>
                      ) : undefined
                    }
                  />
                  <div
                    className={cn(
                      "scrollbar-theme flex-1 overflow-x-hidden overflow-y-auto bg-transparent",
                      isDistractFree && "mx-auto w-full max-w-3xl p-4 sm:p-8",
                      !isDistractFree && "p-0"
                    )}
                    onClick={() => editor?.chain().focus().run()}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <EditorContent editor={editor} className="h-full min-h-[50vh]" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-8 text-center sm:flex sm:items-center sm:justify-center">
                <div className="max-w-xl px-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium text-muted-foreground mb-2">Welcome to NerdsNote: Free Online Notepad for Note Taking</h2>
                  <p className="text-muted-foreground mb-5">Create a new note to get started with this distraction-free online notepad. Perfect for quick notes, note taking, and private writing. No login required, works offline, and auto-saves to your browser.</p>
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button onClick={createNewNote}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Note
                    </Button>
                    {isFileSystemSupported && !connectedDirectoryName && (
                      <Button
                        variant="outline"
                        onClick={() => setIsConnectFolderDialogOpen(true)}
                        className="gap-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                      >
                        <HardDrive className="h-4 w-4" />
                        Save notes to a local folder
                      </Button>
                    )}
                  </div>
                  {connectedDirectoryName && (
                    <p className="mt-4 text-sm text-primary">
                      New notes will save to {connectedDirectoryName}.
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Status Bar - Always visible at bottom */}
          {activeNote && editor && (
            <footer className="flex shrink-0 flex-col gap-1 border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Words: {editor.storage.characterCount?.words() || 0}</span>
                <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
              </div>
              <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 sm:justify-end">
                {storageError && (
                  <span className="text-destructive">{storageError}</span>
                )}
                <span className="min-w-0 truncate">{connectedDirectoryName ? `Saving to ${connectedDirectoryName}` : folderSyncNotice ? "Saved locally only" : "Auto-saved in browser"}</span>
                <span className="whitespace-nowrap">Last modified: {activeNote.lastModified.toLocaleTimeString()}</span>
              </div>
            </footer>
          )}
        </div>
      </div>


      {/* Create Share Link Dialog */}
      <CreateShareLinkDialog
        isOpen={isCreateLinkDialogOpen}
        onClose={() => setIsCreateLinkDialogOpen(false)}
        noteContent={activeNote ? (editor?.getHTML() || activeNote.content) : ""}
      />

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
      />

      {/* Connect Folder Dialog */}
      <ConnectFolderDialog
        isOpen={isConnectFolderDialogOpen}
        onClose={() => setIsConnectFolderDialogOpen(false)}
        onConfirm={handleConnectDirectory}
      />

      {/* Delete Confirmation Dialog */}
      {
        noteToDelete && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md p-5 sm:p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setNoteToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteNote(noteToDelete)
                    setNoteToDelete(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )
      }

      {/* Feature Announcement Modal */}
      {
        showAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md p-5 animate-in fade-in zoom-in-95 duration-200 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">New Features: Share & Save!</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                We've added powerful new features to give you full control over your data.
              </p>
              <div className="space-y-6 mb-8">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary">
                    <Link2 className="h-4 w-4" />
                    Share Links
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                    Need to share a quick thought? Generate a secure, read-only public link for any note.
                  </p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 ml-1">
                    <li>Click "Create Link" in the top bar</li>
                    <li>You choose when links expire (up to 30 days)</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary">
                    <HardDrive className="h-4 w-4" />
                    Local Folder Storage
                    <span className="text-[10px] uppercase font-bold bg-background text-muted-foreground px-1.5 py-0.5 rounded border border-border ml-auto">Desktop Only</span>
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                    Prevent data loss by connecting a real folder on your device. Your notes will be saved as .txt files.
                  </p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 ml-1">
                    <li>Click "Connect Local Folder" in the sidebar</li>
                    <li>Files auto-sync instantly</li>
                  </ul>
                </div>
              </div>
              <Button
                className="w-full font-semibold"
                onClick={() => {
                  localStorage.setItem("nerds-note-seen-v6-features", "true")
                  setShowAnnouncement(false)
                }}
              >
                Awesome, Let's Go!
              </Button>
            </Card>
          </div>
        )
      }

    </div >
  )
}
