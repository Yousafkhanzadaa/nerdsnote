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

      <div className="flex h-[calc(100vh-73px)]">
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
      </div>

      {/* Legal & Tutorials Section */}
      {!isDistractFree && (
        <div className="border-t border-border bg-muted/20">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Privacy Policy, Terms & Tutorials for Online Notepad</span>
            </div>
          </div>

          <div className="px-4 pb-6 space-y-6">
            {/* Privacy Policy */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Privacy Policy for NerdsNote Online Notepad</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Data Storage:</strong> All your notes are stored locally in your browser&apos;s localStorage. We don&apos;t collect, store, or transmit any of your data to our servers.</p>
                <p><strong>No Tracking:</strong> We don&apos;t use cookies, analytics, or any tracking mechanisms. Your privacy is completely protected.</p>
                <p><strong>Local Only:</strong> Your notes remain on your device and are never sent to external servers. You have complete control over your data.</p>
                <p><strong>Browser Storage:</strong> Notes are saved in your browser&apos;s localStorage. Clearing your browser data will remove your notes.</p>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Terms and Conditions for Free Note Taking App</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Use at Your Own Risk:</strong> This application is provided &quot;as is&quot; without any warranties. Use it at your own discretion.</p>
                <p><strong>Data Responsibility:</strong> You are responsible for backing up your notes. We recommend exporting important notes regularly.</p>
                <p><strong>No Guarantees:</strong> We don&apos;t guarantee data persistence. Browser updates, clearing data, or technical issues may result in data loss.</p>
                <p><strong>Free Service:</strong> This is a free, open-source application. No payment or registration required.</p>
              </div>
            </Card>

            {/* Tutorials */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">How to Use NerdsNote Online Notepad for Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Getting Started</h4>
                  <p>• Click &quot;New Note&quot; to create your first note</p>
                  <p>• Start typing in the editor - your notes auto-save as you type</p>
                  <p>• Use the search bar to find specific notes</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Keyboard Shortcuts</h4>
                  <p>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + N</kbd> - Create new note</p>
                  <p>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + S</kbd> - Auto-save (automatic)</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Features</h4>
                  <p>• <strong>Distract-free mode:</strong> Click the maximize button for full-screen writing</p>
                  <p>• <strong>Dark/Light theme:</strong> Toggle between themes with the moon/sun button</p>
                  <p>• <strong>Font size:</strong> Adjust text size with A+ and A- buttons</p>
                  <p>• <strong>Export:</strong> Download your notes as text files</p>
                  <p>• <strong>Import:</strong> Upload text files to create new notes</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Tips</h4>
                  <p>• Hover over notes in the sidebar to see the delete button</p>
                  <p>• Use descriptive titles to easily find your notes later</p>
                  <p>• Export important notes regularly as a backup</p>
                  <p>• The app works offline - no internet connection required</p>
                </div>
              </div>
            </Card>

            {/* About NerdsNote */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">About NerdsNote: Free Online Notepad and Note Taking App</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>NerdsNote</strong> is a fast, privacy‑first online notepad built for developers, writers, and anyone who needs a distraction‑free place to jot ideas. It runs in the browser, requires no account, and saves notes locally so your writing remains on your device.</p>
                <p>Designed for speed and clarity, NerdsNote supports dark mode, offline use, keyboard shortcuts, quick search, import/export, and adjustable font size for long writing sessions.</p>
                <p>Built with a minimal UI so you can focus on what matters most: your words.</p>
              </div>
            </Card>

            {/* Built By */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Built by Khueon Studios - Creators of Online Notepad Tools</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>This project is crafted and maintained by <a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Khueon Studios</a>. We create clean, performant, and user‑friendly tools for the web.</p>
                <p className="flex items-center gap-1"><a href="https://www.khueonstudios.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">Visit khueonstudios.com <ExternalLink className="h-3 w-3" /></a></p>
              </div>
            </Card>

            {/* SEO‑Optimized Overview */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Free Online Notepad for Distraction‑Free Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>NerdsNote is a free online notepad and minimal note‑taking app. Write instantly in your browser with auto‑save, no sign‑up, and no ads. It is perfect for quick notes, drafting blog posts, code snippets, and study plans.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Privacy‑first: notes are saved in localStorage on your device</li>
                  <li>Works offline with fast load times</li>
                  <li>Dark mode and adjustable font size for comfort</li>
                  <li>Import .txt files and export any note with one click</li>
                  <li>Search across all notes to find ideas quickly</li>
                </ul>
                <p>Relevant keywords: free online notepad, distraction‑free writing app, browser‑based notes, local notes, privacy‑friendly notepad, simple notepad for developers, quick notes app, no login notes.</p>
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Frequently Asked Questions about Online Notepad and Note Taking</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground">Is NerdsNote free?</p>
                  <p>Yes. NerdsNote is completely free to use and does not require an account.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Where are my notes stored?</p>
                  <p>All notes are stored locally in your browser using localStorage. Clearing browser data will remove them, so export important notes regularly.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Do I need an internet connection?</p>
                  <p>No. After the first load, NerdsNote works offline in most modern browsers.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">How do I export a note?</p>
                  <p>Click the Download button to save the active note as a .txt file.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">How do I import a .txt file?</p>
                  <p>Use the Upload button and choose a .txt file. It will create a new note using the file name.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Does NerdsNote support Markdown?</p>
                  <p>NerdsNote is plain text. You can write Markdown syntax and export as .txt for use elsewhere.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Can I change the font size or theme?</p>
                  <p>Yes. Use A+ / A- to adjust text size and the Sun/Moon toggle to switch themes.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Is there cloud sync?</p>
                  <p>Not yet. All notes are stored locally on your device. Export notes to create backups.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Which browsers are supported?</p>
                  <p>NerdsNote supports recent versions of Chrome, Edge, Firefox, and Safari.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">Who built NerdsNote?</p>
                  <p>NerdsNote is built by Khueon Studios. Visit khueonstudios.com to learn more.</p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      )}

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

      {/* Status Bar */}
      {!isDistractFree && activeNote && (
        <footer className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
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

      {/* Add FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is NerdsNote free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. NerdsNote is completely free to use and does not require an account."
                }
              },
              {
                "@type": "Question",
                "name": "Where are my notes stored?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "All notes are stored locally in your browser using localStorage. Clearing browser data will remove them, so export important notes regularly."
                }
              },
              // Add the rest of the FAQs similarly
              {
                "@type": "Question",
                "name": "Do I need an internet connection?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. After the first load, NerdsNote works offline in most modern browsers."
                }
              },
              {
                "@type": "Question",
                "name": "How do I export a note?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Click the Download button to save the active note as a .txt file."
                }
              },
              {
                "@type": "Question",
                "name": "How do I import a .txt file?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the Upload button and choose a .txt file. It will create a new note using the file name."
                }
              },
              {
                "@type": "Question",
                "name": "Does NerdsNote support Markdown?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote is plain text. You can write Markdown syntax and export as .txt for use elsewhere."
                }
              },
              {
                "@type": "Question",
                "name": "Can I change the font size or theme?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Use A+ / A- to adjust text size and the Sun/Moon toggle to switch themes."
                }
              },
              {
                "@type": "Question",
                "name": "Is there cloud sync?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not yet. All notes are stored locally on your device. Export notes to create backups."
                }
              },
              {
                "@type": "Question",
                "name": "Which browsers are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote supports recent versions of Chrome, Edge, Firefox, and Safari."
                }
              },
              {
                "@type": "Question",
                "name": "Who built NerdsNote?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NerdsNote is built by Khueon Studios. Visit khueonstudios.com to learn more."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
