"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { FileText, Moon, Sun, Download, Upload, Search, Maximize2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Features() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("nerds-note-theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("nerds-note-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("nerds-note-theme", "light")
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple header with theme toggle */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">NerdsNote Features</h1>
        <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Features of NerdsNote: Free Online Notepad and Note Taking App</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Distraction-Free Writing</h2>
            <p>Focus on your notes with a clean, minimal interface. Perfect for online notepad users seeking simplicity.</p>
          </Card>

          <Card className="p-6">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Private and Local Storage</h2>
            <p>All notes saved locally in your browser - no servers, no tracking. Ideal for private note taking.</p>
          </Card>

          <Card className="p-6">
            <Moon className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Dark Mode Support</h2>
            <p>Switch between light and dark themes for comfortable note taking anytime.</p>
          </Card>

          <Card className="p-6">
            <Maximize2 className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Full-Screen Mode</h2>
            <p>Enter distraction-free full-screen for immersive writing in your online notepad.</p>
          </Card>

          <Card className="p-6">
            <Download className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Export Notes</h2>
            <p>Easily download your notes as text files from this free note taking app.</p>
          </Card>

          <Card className="p-6">
            <Upload className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Import Files</h2>
            <p>Upload text files to create new notes in your browser notepad.</p>
          </Card>

          <Card className="p-6">
            <Search className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Quick Search</h2>
            <p>Search across all your notes instantly in this online note taking tool.</p>
          </Card>
        </div>

        <p className="mt-8 text-center text-muted-foreground">
          Discover why NerdsNote is the best free online notepad for your note taking needs.
        </p>
      </div>
    </div>
  )
}
