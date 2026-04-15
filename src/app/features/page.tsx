import type { Metadata } from "next"
import Link from "next/link"
import {
  Download,
  FileText,
  HardDrive,
  Maximize2,
  Moon,
  Search,
  Shield,
  Upload,
  WifiOff,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Features — NerdsNote | Distraction-Free Online Notepad",
  description:
    "Explore NerdsNote features for private note taking: local auto-save, offline support, dark mode, search, import, export, and distraction-free writing.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features — NerdsNote",
    description:
      "Private online notepad features: local auto-save, dark mode, file export, private storage, offline access, and more.",
    url: "https://nerdsnote.com/features",
  },
}

const features = [
  {
    title: "Distraction-free writing",
    description:
      "A clean browser notepad for quick notes, longer drafts, lists, and plain text writing.",
    icon: FileText,
  },
  {
    title: "Private local storage",
    description:
      "Notes are saved in your browser by default, with no account required to start writing.",
    icon: Shield,
  },
  {
    title: "Automatic saving",
    description:
      "NerdsNote keeps your current work saved locally as you type.",
    icon: Zap,
  },
  {
    title: "Offline support",
    description:
      "Keep writing in modern browsers after the app loads, even when the connection is unreliable.",
    icon: WifiOff,
  },
  {
    title: "Dark mode",
    description:
      "Switch between light and dark themes for comfortable writing at any time of day.",
    icon: Moon,
  },
  {
    title: "Full-screen focus",
    description:
      "Use distraction-free mode when you want the editor to stay out of your way.",
    icon: Maximize2,
  },
  {
    title: "Instant search",
    description:
      "Search saved notes by title or content and get back to the text you need.",
    icon: Search,
  },
  {
    title: "Import text files",
    description:
      "Bring in .txt and .md files to continue writing from existing notes.",
    icon: Upload,
  },
  {
    title: "Export notes",
    description:
      "Download notes as plain text so your writing stays portable.",
    icon: Download,
  },
  {
    title: "Optional folder sync",
    description:
      "Connect a local folder in supported browsers when you want file-based note storage.",
    icon: HardDrive,
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>NerdsNote</span>
          </Link>
          <Button size="sm" asChild>
            <Link href="/notepad">Start writing</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="border-b border-border">
          <div className="container mx-auto max-w-5xl px-4 py-14">
            <p className="text-sm font-medium text-primary">NerdsNote features</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              A free online notepad with private, local-first writing tools.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Write quick notes, draft text, search your saved notes, import
              files, export your work, and keep writing without an account.
            </p>
          </div>
        </section>

        <section className="bg-muted/25">
          <div className="container mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="rounded-md p-6">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="container mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ready for a clean note taking app?</h2>
              <p className="mt-2 text-muted-foreground">
                Open the editor and start writing in your browser.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/notepad">Open NerdsNote</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>NerdsNote - local-first writing in your browser.</p>
          <nav aria-label="Footer navigation" className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
