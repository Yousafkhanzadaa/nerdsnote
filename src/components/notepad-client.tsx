"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Upload, Search, Plus, Trash2, Moon, Sun, FileText, Maximize2, Minimize2, Menu, X, MessageSquare, Link2, Sparkles, Folder, FolderOpen, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import CharacterCount from "@tiptap/extension-character-count"
import { EditorToolbar } from "@/components/editor-toolbar"

import { CreateShareLinkDialog } from "@/components/create-share-link-dialog"
import { ConnectFolderDialog } from "@/components/connect-folder-dialog"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { cn } from "@/lib/utils"
import { FileSystemStorage, fileSystemStorage, type Note as FileSystemNote } from "@/lib/file-system-storage"

interface Note {
  id: string
  title: string
  content: string
  lastModified: Date
  groupId?: string | null
}

interface NoteGroup {
  id: string
  name: string
  createdAt: Date
}

const ALL_NOTES_FILTER = "__all__"
const CORE_NOTES_FILTER = "__core__"

const NOTES_STORAGE_KEY = "nerds-note-data"
const GROUPS_STORAGE_KEY = "nerds-note-groups"
const GROUP_FILTER_STORAGE_KEY = "nerds-note-group-filter"
const THEME_STORAGE_KEY = "nerds-note-theme"
const SEEN_ANNOUNCEMENT_KEY = "nerds-note-seen-v6-features"

const normalizeGroupName = (name: string): string => name.replace(/\s+/g, " ").trim()
const createGroupId = (): string => `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([])
  const [groups, setGroups] = useState<NoteGroup[]>([])
  const groupsRef = useRef<NoteGroup[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>(ALL_NOTES_FILTER)
  const [newGroupName, setNewGroupName] = useState("")
  const [isGroupComposerOpen, setIsGroupComposerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isDistractFree, setIsDistractFree] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false)
  const [isConnectFolderDialogOpen, setIsConnectFolderDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  // File System Storage State
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(false)
  const [connectedDirectoryName, setConnectedDirectoryName] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const groupLookup = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups])

  const getGroupNameForStorage = (groupId?: string | null): string | undefined => {
    if (!groupId) return undefined
    return groupLookup.get(groupId)?.name
  }

  const getStorageOptionsForNote = (note: Pick<Note, "groupId">) => ({
    groupName: getGroupNameForStorage(note.groupId),
  })

  const mapFileSystemNotesToAppNotes = (fsNotes: FileSystemNote[]): Note[] => {
    const existingGroups = groupsRef.current
    const nextGroups = [...existingGroups]
    const nameToGroupId = new Map<string, string>()

    for (const group of existingGroups) {
      nameToGroupId.set(group.name.toLowerCase(), group.id)
    }

    const mappedNotes = fsNotes.map((fsNote) => {
      const normalizedGroupName = normalizeGroupName(fsNote.groupName ?? "")
      let groupId: string | null = null

      if (normalizedGroupName.length > 0) {
        const lookupKey = normalizedGroupName.toLowerCase()
        const existingGroupId = nameToGroupId.get(lookupKey)
        if (existingGroupId) {
          groupId = existingGroupId
        } else {
          groupId = createGroupId()
          nameToGroupId.set(lookupKey, groupId)
          nextGroups.push({
            id: groupId,
            name: normalizedGroupName,
            createdAt: new Date(),
          })
        }
      }

      return {
        id: fsNote.id,
        title: fsNote.title,
        content: fsNote.content,
        lastModified: new Date(fsNote.lastModified),
        groupId,
      }
    })

    if (nextGroups.length !== existingGroups.length) {
      setGroups(nextGroups)
    }

    return mappedNotes
  }

  const editor = useEditor({
    extensions: [StarterKit, Underline, CharacterCount],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert focus:outline-none max-w-none h-full min-h-[50vh] px-4 py-2",
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
    let parsedGroups: NoteGroup[] = []
    const savedGroups = localStorage.getItem(GROUPS_STORAGE_KEY)
    if (savedGroups) {
      try {
        parsedGroups = JSON.parse(savedGroups).map((group: any) => ({
          id: group.id,
          name: group.name,
          createdAt: new Date(group.createdAt),
        }))
      } catch (error) {
        console.error("Failed to parse saved groups:", error)
      }
    }
    setGroups(parsedGroups)
    groupsRef.current = parsedGroups

    const validGroupIds = new Set(parsedGroups.map((group) => group.id))
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY)
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          id: String(note.id),
          title: String(note.title ?? "Untitled"),
          content: String(note.content ?? ""),
          lastModified: new Date(note.lastModified ?? Date.now()),
          groupId: typeof note.groupId === "string" && validGroupIds.has(note.groupId) ? note.groupId : null,
        }))
        setNotes(parsedNotes)
        if (parsedNotes.length > 0) {
          setActiveNoteId(parsedNotes[0].id)
        }
      } catch (error) {
        console.error("Failed to parse saved notes:", error)
      }
    } else {
      // Create initial note
      const initialNote: Note = {
        id: "1",
        title: "NerdsNote",
        content: "Create a new note to get started with this distraction-free online notepad. Perfect for quick notes, note taking, and private writing. No login required, works offline, and auto-saves to your browser.",
        lastModified: new Date(),
        groupId: null,
      }
      setNotes([initialNote])
      setActiveNoteId(initialNote.id)
    }

    const savedGroupFilter = localStorage.getItem(GROUP_FILTER_STORAGE_KEY)
    if (savedGroupFilter && (savedGroupFilter === ALL_NOTES_FILTER || savedGroupFilter === CORE_NOTES_FILTER || validGroupIds.has(savedGroupFilter))) {
      setActiveGroupFilter(savedGroupFilter)
    }

    // Check if user has seen the new features announcement
    const hasSeenAnnouncement = localStorage.getItem(SEEN_ANNOUNCEMENT_KEY)
    if (savedNotes && !hasSeenAnnouncement) {
      // Only show to existing users (who have saved notes)
      setShowAnnouncement(true)
    }

    // Load theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
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
              content: data.content,
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
    groupsRef.current = groups
  }, [groups])

  useEffect(() => {
    if (FileSystemStorage.isSupported()) {
      setIsFileSystemSupported(true)
      fileSystemStorage.loadHandle().then(async (success) => {
        if (success) {
          const name = fileSystemStorage.getDirectoryName()
          setConnectedDirectoryName(name)
          const fsNotes = await fileSystemStorage.loadNotes()
          if (fsNotes.length > 0) {
            const mappedNotes = mapFileSystemNotesToAppNotes(fsNotes)
            setNotes(mappedNotes)
            setActiveNoteId((currentId) => {
              if (currentId && mappedNotes.some((note) => note.id === currentId)) {
                return currentId
              }
              return mappedNotes[0]?.id ?? null
            })
          }
        }
      })
    }
  }, [])

  const handleConnectDirectory = async () => {
    try {
      await fileSystemStorage.connectDirectory()
      setConnectedDirectoryName(fileSystemStorage.getDirectoryName())

      for (const group of groups) {
        await fileSystemStorage.ensureGroupDirectory(group.name)
      }

      // Save existing notes to the new folder (Migration)
      for (const note of notes) {
        await fileSystemStorage.saveNote(note, getStorageOptionsForNote(note))
      }

      // Reload from FS to ensure consistency
      const fsNotes = await fileSystemStorage.loadNotes()
      const mappedNotes = mapFileSystemNotesToAppNotes(fsNotes)
      setNotes(mappedNotes)
      if (mappedNotes.length > 0 && !activeNoteId) {
        setActiveNoteId(mappedNotes[0].id)
      }
    } catch (error) {
      console.error("Failed to connect directory:", error)
    }
  }

  const handleDisconnectDirectory = async () => {
    await fileSystemStorage.disconnectDirectory()
    setConnectedDirectoryName(null)
    // Reload notes from localStorage
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY)
    if (savedNotes) {
      try {
        const validGroupIds = new Set(groupsRef.current.map((group) => group.id))
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          id: String(note.id),
          title: String(note.title ?? "Untitled"),
          content: String(note.content ?? ""),
          lastModified: new Date(note.lastModified ?? Date.now()),
          groupId: typeof note.groupId === "string" && validGroupIds.has(note.groupId) ? note.groupId : null,
        }))
        setNotes(parsedNotes)
        if (parsedNotes.length > 0) setActiveNoteId(parsedNotes[0].id)
      } catch (error) {
        console.error("Failed to parse saved notes while disconnecting folder:", error)
      }
    } else {
      setNotes([])
      setActiveNoteId(null)
    }
  }

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

  useEffect(() => {
    localStorage.setItem(GROUP_FILTER_STORAGE_KEY, activeGroupFilter)
  }, [activeGroupFilter])

  // Toggle theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem(THEME_STORAGE_KEY, "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem(THEME_STORAGE_KEY, "light")
    }
  }, [isDarkMode])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (activeGroupFilter === ALL_NOTES_FILTER || activeGroupFilter === CORE_NOTES_FILTER) return
    if (!groups.some((group) => group.id === activeGroupFilter)) {
      setActiveGroupFilter(ALL_NOTES_FILTER)
    }
  }, [groups, activeGroupFilter])

  const activeNote = notes.find((note) => note.id === activeNoteId)

  // Sync editor content when active note changes
  const prevActiveNoteIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (editor && activeNote && activeNote.id !== prevActiveNoteIdRef.current) {
      editor.commands.setContent(activeNote.content)
      prevActiveNoteIdRef.current = activeNote.id
    }
  }, [activeNoteId, activeNote, editor])

  const createNewNote = async () => {
    const defaultGroupId = activeGroupFilter !== ALL_NOTES_FILTER && activeGroupFilter !== CORE_NOTES_FILTER
      ? activeGroupFilter
      : null

    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      lastModified: new Date(),
      groupId: defaultGroupId,
    }

    if (connectedDirectoryName) {
      await fileSystemStorage.saveNote(newNote, getStorageOptionsForNote(newNote))
    }

    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => {
      if (note.id === id) {
        const updatedNote = { ...note, ...updates, lastModified: new Date() }

        // Sync to File System
        if (connectedDirectoryName) {
          const previousGroupName = getGroupNameForStorage(note.groupId)
          const nextGroupName = getGroupNameForStorage(updatedNote.groupId)
          const groupChanged = updates.groupId !== undefined && updates.groupId !== note.groupId

          // Check for rename
          if ((updates.title && updates.title !== note.title) || groupChanged) {
            fileSystemStorage.deleteNoteByTitle(note.title, {
              groupName: previousGroupName,
            })
            fileSystemStorage.saveNote(updatedNote, {
              groupName: nextGroupName,
            })
          } else if (updates.content !== undefined) {
            // Debounce content saves
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = setTimeout(() => {
              fileSystemStorage.saveNote(updatedNote, {
                groupName: nextGroupName,
              })
            }, 1000)
          }
        }

        return updatedNote
      }
      return note
    }))
  }

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id)
    if (noteToDelete && connectedDirectoryName) {
      fileSystemStorage.deleteNoteByTitle(noteToDelete.title, getStorageOptionsForNote(noteToDelete))
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
    // Use editor to get plain text if available, otherwise strip HTML
    let content = activeNote.content
    if (editor) {
      content = editor.getText()
    } else {
      // Fallback: simple strip tags (not perfect but works for basic)
      const tmp = document.createElement("DIV")
      tmp.innerHTML = content
      content = tmp.textContent || ""
    }

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
      // Import as plain text, TipTap will handle it (wrap in <p>)
      const newNote: Note = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: content.split('\n').map(line => `<p>${line}</p>`).join(''), // Basic conversion to preserve newlines
        lastModified: new Date(),
        groupId: activeGroupFilter !== ALL_NOTES_FILTER && activeGroupFilter !== CORE_NOTES_FILTER
          ? activeGroupFilter
          : null,
      }
      if (connectedDirectoryName) {
        fileSystemStorage.saveNote(newNote, getStorageOptionsForNote(newNote))
      }
      setNotes((prev) => [newNote, ...prev])
      setActiveNoteId(newNote.id)
    }
    reader.readAsText(file)
  }

  const createGroup = async () => {
    const normalizedName = normalizeGroupName(newGroupName)
    if (!normalizedName) return

    const existingGroup = groups.find((group) => group.name.toLowerCase() === normalizedName.toLowerCase())
    if (existingGroup) {
      setActiveGroupFilter(existingGroup.id)
      setNewGroupName("")
      setIsGroupComposerOpen(false)
      return
    }

    if (connectedDirectoryName) {
      try {
        await fileSystemStorage.ensureGroupDirectory(normalizedName)
      } catch (error) {
        console.error("Failed to create group folder:", error)
      }
    }

    const newGroup: NoteGroup = {
      id: createGroupId(),
      name: normalizedName,
      createdAt: new Date(),
    }

    setGroups((prev) => [newGroup, ...prev])
    setActiveGroupFilter(newGroup.id)
    setNewGroupName("")
    setIsGroupComposerOpen(false)
  }

  const searchedNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredNotes = searchedNotes.filter((note) => {
    if (activeGroupFilter === ALL_NOTES_FILTER) return true
    if (activeGroupFilter === CORE_NOTES_FILTER) return !note.groupId
    return note.groupId === activeGroupFilter
  })

  const groupNoteCounts = notes.reduce<Record<string, number>>((acc, note) => {
    if (note.groupId) {
      acc[note.groupId] = (acc[note.groupId] || 0) + 1
    }
    return acc
  }, {})
  const coreNoteCount = notes.filter((note) => !note.groupId).length

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
  }, [])

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground transition-all duration-300",
        isDistractFree && "overflow-hidden",
      )}
    >
      {/* Header */}
      {!isDistractFree && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">NerdsNote</h1>
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

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCreateLinkDialogOpen(true)} className="text-primary font-medium" disabled={!activeNote}>
                <Link2 className="h-4 w-4 mr-2" />
                Create Link
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="sm" onClick={() => setIsDistractFree(!isDistractFree)}>
                {isDistractFree ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className={cn(
        "flex",
        isDistractFree ? "h-screen" : "h-[calc(100vh-73px)]"
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
            "w-80 border-r border-border bg-sidebar flex flex-col transition-transform duration-300",
            "md:translate-x-0 md:static md:z-auto md:h-full",
            isMobileSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 translate-x-0 h-screen"
              : "fixed inset-y-0 left-0 z-50 -translate-x-full h-screen"
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

              <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Folder className="h-3.5 w-3.5" />
                    <span>Groups</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGroupComposerOpen((prev) => !prev)}
                    className="h-6 px-2 text-[11px]"
                  >
                    {isGroupComposerOpen ? "Close" : "New"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant={activeGroupFilter === ALL_NOTES_FILTER ? "default" : "outline"}
                    className="h-7 text-[11px] px-2"
                    onClick={() => setActiveGroupFilter(ALL_NOTES_FILTER)}
                  >
                    All ({notes.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeGroupFilter === CORE_NOTES_FILTER ? "default" : "outline"}
                    className="h-7 text-[11px] px-2"
                    onClick={() => setActiveGroupFilter(CORE_NOTES_FILTER)}
                  >
                    Core ({coreNoteCount})
                  </Button>
                  {groups.map((group) => (
                    <Button
                      key={group.id}
                      size="sm"
                      variant={activeGroupFilter === group.id ? "default" : "outline"}
                      className="h-7 text-[11px] px-2 max-w-full"
                      onClick={() => setActiveGroupFilter(group.id)}
                      title={group.name}
                    >
                      <span className="truncate">{group.name}</span>
                      <span className="text-[10px] opacity-80">({groupNoteCounts[group.id] || 0})</span>
                    </Button>
                  ))}
                </div>

                {isGroupComposerOpen && (
                  <div className="flex gap-2">
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          void createGroup()
                        }
                      }}
                      placeholder="New group name"
                      className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={() => void createGroup()} className="h-8 text-xs px-3">
                      Add
                    </Button>
                  </div>
                )}
              </div>
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
                          {note.groupId && groupLookup.get(note.groupId) && (
                            <span className="inline-flex items-center gap-1 mt-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                              <Folder className="h-2.5 w-2.5" />
                              {groupLookup.get(note.groupId)?.name}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {note.content.slice(0, 100)}...
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
                          className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Storage Footer */}
            {isFileSystemSupported && (
              <div className="p-3 border-t border-sidebar-border bg-muted/20">
                {connectedDirectoryName ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-primary font-medium px-1">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span className="truncate">Saving to: {connectedDirectoryName}</span>
                    </div>
                    <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
                      <p className="text-[11px] font-medium">Grouped notes save into folders automatically</p>
                      <p className="text-[10px] text-muted-foreground">
                        Ungrouped notes stay in the main folder.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectDirectory}
                      className="w-full text-xs h-7"
                    >
                      Disconnect Folder
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConnectFolderDialogOpen(true)}
                    className="w-full text-xs h-8 gap-2 bg-background/50"
                  >
                    <HardDrive className="h-3.5 w-3.5" />
                    Connect Local Folder
                  </Button>
                )}
              </div>
            )}
          </aside>
        )}

        {/* Main Editor Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Main Editor */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeNote ? (
              <>
                {!isDistractFree && (
                  <div className="border-b border-border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        value={activeNote.title}
                        onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                        className="text-lg font-medium border-none bg-transparent p-0 focus-visible:ring-0 sm:flex-1"
                        placeholder="Note title..."
                      />
                      <div className="flex items-center gap-2 sm:w-[240px]">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={activeNote.groupId ?? ""}
                          onChange={(e) => updateNote(activeNote.id, { groupId: e.target.value || null })}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                        >
                          <option value="">Core (Ungrouped)</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <EditorToolbar editor={editor} fontSize={fontSize} onFontSizeChange={setFontSize} />
                  <div
                    className={cn(
                      "flex-1 overflow-y-auto scrollbar-theme bg-transparent",
                      isDistractFree && "p-8 max-w-3xl mx-auto w-full",
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
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium text-muted-foreground mb-2">Welcome to NerdsNote: Free Online Notepad for Note Taking</h2>
                  <p className="text-muted-foreground mb-4">Create a new note to get started with this distraction-free online notepad. Perfect for quick notes, note taking, and private writing. No login required, works offline, and auto-saves to your browser.</p>
                  <Button onClick={createNewNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Note
                  </Button>
                </div>
              </div>
            )}
          </main>

          {/* Status Bar - Always visible at bottom */}
          {activeNote && editor && (
            <footer className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between items-center shrink-0">
              <div className="flex gap-4">
                <span>Words: {editor.storage.characterCount?.words() || 0}</span>
                <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
              </div>
              <div className="flex gap-4">
                <span>Auto-saved</span>
                <span>Last modified: {activeNote.lastModified.toLocaleTimeString()}</span>
              </div>
            </footer>
          )}
        </div>
      </div>


      {/* Exit Full Screen Button - Only visible in distract free mode */}
      {
        isDistractFree && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDistractFree(false)}
            className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Full Screen
          </Button>
        )
      }


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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
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
                    <li>Links auto-expire in 24 hours</li>
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
                  localStorage.setItem(SEEN_ANNOUNCEMENT_KEY, "true")
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
