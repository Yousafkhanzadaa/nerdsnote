import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  HardDrive,
  Link2,
  Lock,
  Maximize2,
  Moon,
  Search,
  Shield,
  WifiOff,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"

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

// A stylized, in-browser preview of the editor — the hero's focal visual.
function EditorPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 bg-hero-glow"
      />
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-3 flex items-center gap-2 truncate text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Product launch — notes
          </div>
          <div className="ml-auto hidden items-center gap-1.5 rounded-md border border-border bg-background/70 px-2 py-1 text-[11px] font-medium text-primary sm:flex">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Private
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr]">
          {/* Sidebar */}
          <div className="hidden flex-col gap-1.5 border-r border-border bg-muted/20 p-3 sm:flex">
            <div className="mb-1 flex items-center gap-2 rounded-md bg-primary px-2.5 py-2 text-[11px] font-semibold text-primary-foreground shadow-sm">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Product launch
            </div>
            {["Weekly review", "Reading list", "Trip plan"].map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] text-muted-foreground"
              >
                <FileText className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>

          {/* Editor body */}
          <div className="space-y-3 p-5 text-sm">
            <div className="text-base font-semibold text-foreground">
              Launch checklist
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Everything for Thursday, in one private note. Auto-saved as you
              type.
            </p>
            <div className="space-y-2">
              {[
                { label: "Finalize landing page copy", done: true },
                { label: "Ship the new editor", done: true },
                { label: "Schedule announcement", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={
                      item.done
                        ? "flex h-4 w-4 items-center justify-center rounded border border-primary bg-primary text-primary-foreground"
                        : "h-4 w-4 rounded border border-muted-foreground/40"
                    }
                  >
                    {item.done && <Check className="h-3 w-3" aria-hidden="true" />}
                  </span>
                  <span
                    className={
                      item.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
              Stays on this device unless I share it.
            </div>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
              <span>142 words</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-primary">Auto-saved in browser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: typeof Zap
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={`group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg ${className}`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
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
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-hero-glow"
          />
          <div className="container relative mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur">
                <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                Free, private, and local-first — no account required
              </div>
              <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl">
                A private online notepad for{" "}
                <span className="text-brand-gradient">fast, focused writing.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground">
                NerdsNote opens straight into a clean browser notepad with local
                storage, offline access, dark mode, search, import, and export. No
                login, no clutter.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["No account needed", "Works offline", "Opens in seconds"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mx-auto mt-16 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <EditorPreview />
            </div>
          </div>
        </section>

        {/* Bento feature grid */}
        <section className="border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything a simple note taking app should keep close.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Quick notes, private drafts, meeting notes, code snippets, and
                checklists — without a signup wall.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {/* Featured: private + local-first */}
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg md:col-span-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
                />
                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">Private by default</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Your notes stay on your device. Quick ideas, drafts, and
                    personal lists never need an account and never touch a server
                    unless you choose to share them.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { icon: Lock, label: "On-device storage" },
                      { icon: WifiOff, label: "Offline ready" },
                      { icon: Zap, label: "No tracking wall" },
                    ].map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accent card: focus mode */}
              <div className="group relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-elevated transition-transform duration-200 hover:-translate-y-0.5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Maximize2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">Distraction-free focus</h3>
                <p className="mt-1.5 text-sm leading-6 text-primary-foreground/80">
                  Flip into focus mode for a clean full-screen canvas — just you and
                  the words, nothing else on screen.
                </p>
              </div>

              <FeatureCard
                icon={Zap}
                title="Local auto-save"
                description="Saves as you write, protecting drafts from tab closes, refreshes, and interrupted sessions."
              />
              <FeatureCard
                icon={Moon}
                title="Dark mode"
                description="Switch themes when you need softer contrast for longer writing sessions."
              />
              <FeatureCard
                icon={Search}
                title="Instant search"
                description="Find any saved note in a moment by title or text, no matter how many you keep."
              />
              <FeatureCard
                icon={Download}
                title="Import & export"
                description="Bring in .txt and .md files, and export notes as portable plain text whenever you want."
              />
              <FeatureCard
                icon={Link2}
                title="Share links"
                description="Generate a read-only link for a single note when you do want to share, with an expiry you choose."
              />
              <FeatureCard
                icon={HardDrive}
                title="Local folder sync"
                description="On supported desktop browsers, save notes straight to a real folder as .txt files you own."
              />
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built for everyday writing.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.title}
                  className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold">{workflow.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {workflow.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Privacy */}
        <section className="border-b border-border">
          <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm font-medium text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                Privacy and data control
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Local-first, the way notes should be.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                NerdsNote is local-first by default. Your regular notes stay in your
                browser unless you choose to create a share link. Export important
                notes regularly, especially before clearing browser data or
                switching devices.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold">Local by default</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  Notes live in your browser&apos;s local storage unless you
                  explicitly use the Share Links feature.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 sm:mt-8">
                <HardDrive className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold">Backups are yours</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  Export important notes regularly, especially before clearing
                  browser data or switching devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Online notepad questions.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqs.map(({ question, answer }) => (
                <div
                  key={question}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="text-lg font-semibold">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-elevated sm:px-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-hero-glow"
            />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Start writing now.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Local-first notes for the browser. No account, no friction — just
                open it and type.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/notepad">
                    Open NerdsNote
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
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
