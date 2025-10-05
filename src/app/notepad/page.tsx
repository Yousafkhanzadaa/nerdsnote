"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, Upload, Search, Plus, Trash2, Moon, Sun, FileText, Maximize2, Minimize2, Shield, FileText as FileTextIcon, BookOpen, Info, ExternalLink, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  lastModified: Date
}

export default function NerdsNote() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isDistractFree, setIsDistractFree] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("nerds-note-data")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        lastModified: new Date(note.lastModified),
      }))
      setNotes(parsedNotes)
      if (parsedNotes.length > 0) {
        setActiveNoteId(parsedNotes[0].id)
      }
    } else {
      // Create initial note
      const initialNote: Note = {
        id: "1",
        title: "Welcome to NerdsNote",
        content:
          "Start typing your notes here...\n\nFeatures:\n• Auto-save\n• Multiple themes\n• Keyboard shortcuts\n• Export options",
        lastModified: new Date(),
      }
      setNotes([initialNote])
      setActiveNoteId(initialNote.id)
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("nerds-note-theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("nerds-note-data", JSON.stringify(notes))
    }
  }, [notes])

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

  const activeNote = notes.find((note) => note.id === activeNoteId)

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      lastModified: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates, lastModified: new Date() } : note)))
  }

  const deleteNote = (id: string) => {
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
    const blob = new Blob([activeNote.content], { type: "text/plain" })
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
        content,
        lastModified: new Date(),
      }
      setNotes((prev) => [newNote, ...prev])
      setActiveNoteId(newNote.id)
    }
    reader.readAsText(file)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                disabled={fontSize <= 12}
              >
                A-
              </Button>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
                disabled={fontSize >= 24}
              >
                A+
              </Button>
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
                <h2 className="text-lg font-semibold">Notes</h2>
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
                  placeholder="Search notes..."
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
                    <Input
                      value={activeNote.title}
                      onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                      className="text-lg font-medium border-none bg-transparent p-0 focus-visible:ring-0"
                      placeholder="Note title..."
                    />
                  </div>
                )}

                <div className="flex-1 p-4 min-h-0 overflow-hidden">
                  <Textarea
                    ref={textareaRef}
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Start typing your notes here..."
                    className={cn(
                      "w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 font-mono leading-relaxed overflow-y-auto scrollbar-theme",
                      isDistractFree && "p-8",
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                  />
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
          {activeNote && (
            <footer className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between items-center flex-shrink-0">
              <div className="flex gap-4">
                <span>Words: {activeNote.content.split(/\s+/).filter(Boolean).length}</span>
                <span>Characters: {activeNote.content.length}</span>
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
      {isDistractFree && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDistractFree(false)}
          className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          Exit Full Screen
        </Button>
      )}


      {/* Delete Confirmation Dialog */}
      {noteToDelete && (
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
      )}

    </div>
  )
}
