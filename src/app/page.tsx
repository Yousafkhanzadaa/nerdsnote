import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  HardDrive,
  Moon,
  Search,
  Shield,
  WifiOff,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "NerdsNote - Free Online Notepad for Private Notes",
  description:
    "Use NerdsNote as a free online notepad for quick notes, private writing, local auto-save, offline access, dark mode, search, import, and export. No account required.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NerdsNote - Free Online Notepad",
    description:
      "A private browser notepad with local auto-save, offline access, search, dark mode, import, and export. No login required.",
    url: "https://nerdsnote.com",
    type: "website",
  },
}

const coreBenefits = [
  {
    title: "Private browser notes",
    description:
      "Your notes stay on your device by default, so quick ideas, drafts, and personal lists do not need an account.",
    icon: Shield,
  },
  {
    title: "Local auto-save",
    description:
      "NerdsNote saves as you write, helping protect drafts from tab closes, refreshes, and interrupted sessions.",
    icon: Zap,
  },
  {
    title: "Offline writing",
    description:
      "Keep writing after the first load, even when the connection drops or you need a focused browser notepad.",
    icon: WifiOff,
  },
]

const features = [
  "Free online notepad with no login",
  "Dark mode for comfortable writing",
  "Instant search across saved notes",
  "Import .txt and .md files",
  "Export notes as text files",
  "Optional local folder sync in supported browsers",
]

const workflows = [
  {
    title: "Quick notes",
    description:
      "Capture ideas, meeting notes, lists, and reminders without opening a heavy document editor.",
  },
  {
    title: "Private drafts",
    description:
      "Draft copy, code snippets, outlines, and personal text locally before moving it anywhere else.",
  },
  {
    title: "Portable text files",
    description:
      "Import and export plain text so your notes remain simple, readable, and easy to move.",
  },
]

const faqs = [
  {
    question: "Is NerdsNote free?",
    answer:
      "Yes. NerdsNote is a free online notepad and does not require an account to start writing.",
  },
  {
    question: "Where are my notes stored?",
    answer:
      "Notes are stored locally in your browser by default. Export important notes if you plan to clear browser data.",
  },
  {
    question: "Does NerdsNote work offline?",
    answer:
      "Yes. After the app loads, you can keep using the notepad in modern browsers even if the connection drops.",
  },
  {
    question: "Can I import and export notes?",
    answer:
      "Yes. You can import text and Markdown files, then export individual notes as plain text files.",
  },
  {
    question: "Does NerdsNote support Markdown?",
    answer:
      "You can write Markdown-style text and import .md files. Notes export as portable plain text.",
  },
  {
    question: "Is there cloud sync?",
    answer:
      "Not by default. Notes stay local unless you create a share link or use an optional local folder workflow in a supported browser.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="NerdsNote app icon"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span>NerdsNote</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/features">Features</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/notepad">
                Start writing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-border">
          <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
            <div className="mb-5 flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Free online notepad. No login. Local auto-save.</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              A private online notepad for fast, focused writing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              NerdsNote opens straight into a clean browser notepad with local
              storage, offline access, dark mode, search, import, and export.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/notepad">
                  Open the notepad
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">See all features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
            {coreBenefits.map(({ title, description, icon: Icon }) => (
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

        <section className="border-b border-border">
          <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Everything a simple note taking app should keep close.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Use it for quick notes, private drafts, meeting notes, code
                snippets, checklists, and plain text writing without a signup
                wall.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm leading-6">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for everyday writing.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {workflows.map((workflow) => (
                <Card key={workflow.title} className="rounded-md p-6">
                  <h3 className="text-xl font-semibold">{workflow.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {workflow.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            <div className="flex gap-3">
              <Moon className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Dark mode</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Switch themes when you need softer contrast for longer notes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Search className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Search</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Find saved notes quickly by title or text.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Download className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Import and export</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Keep your notes portable as plain text files.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-3xl font-bold tracking-tight">
              Online notepad questions.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faqs.map(({ question, answer }) => (
                <Card key={question} className="rounded-md p-6">
                  <h3 className="text-lg font-semibold">{question}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Privacy and data control.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                NerdsNote is local-first by default. Your regular notes stay in
                your browser unless you choose to create a share link.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/privacy">Privacy policy</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/terms">Terms</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-md p-6">
                <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Local by default</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Notes are stored in your browser's local storage unless you
                  explicitly use the Share Links feature.
                </p>
              </Card>
              <Card className="rounded-md p-6">
                <HardDrive className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Backups are yours</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Export important notes regularly, especially before clearing
                  browser data or switching devices.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section>
          <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Local-first notes for the browser</span>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Start writing now.
              </h2>
            </div>
            <Button size="lg" asChild>
              <Link href="/notepad">
                Open NerdsNote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>NerdsNote - free, private online notepad.</p>
          <nav aria-label="Footer navigation" className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/features" className="hover:text-foreground">
              Features
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
