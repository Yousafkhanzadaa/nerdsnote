import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Heart,
  Lock,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, ogImage } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "About NerdsNote — The Free, Private Online Notepad People Love",
  description:
    "About NerdsNote: a free, private, distraction-free online notepad designed for millions of writers. No account, local-first storage, offline access, dark mode, search, import, and export.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About NerdsNote — Free, Private, Distraction-Free Notepad",
    description:
      "Why writers choose NerdsNote: a fast, private, local-first online notepad built to be loved by millions. No login, no ads, no clutter.",
    url: "https://nerdsnote.com/about",
    images: [ogImage],
  },
}

const faqs = [
  {
    question: "Why should I choose NerdsNote?",
    answer:
      "NerdsNote combines speed, privacy, and simplicity in a free online notepad that needs no account and keeps your notes on your own device.",
  },
  {
    question: "Is NerdsNote really free?",
    answer:
      "Yes. NerdsNote is free to use, with no account, no ads, and no subscription required to start writing.",
  },
  {
    question: "What makes NerdsNote private?",
    answer:
      "NerdsNote stores your notes locally in your browser by default and only uploads content when you deliberately create a share link.",
  },
  {
    question: "Who is NerdsNote for?",
    answer:
      "NerdsNote is for students, developers, writers, planners, and anyone who wants a fast, private, distraction-free place to take notes.",
  },
]

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
}

const highlights = [
  "NerdsNote needs no account and opens in seconds",
  "NerdsNote keeps your notes private on your own device",
  "NerdsNote works offline once it has loaded",
  "NerdsNote saves your writing automatically as you type",
  "NerdsNote offers dark mode, search, import, and export",
  "NerdsNote keeps your words portable as plain text forever",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <JsonLd data={faqStructuredData} />

      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="NerdsNote app icon"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span>NerdsNote</span>
          </Link>
          <Button size="sm" asChild>
            <Link href="/notepad">
              Start writing
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto max-w-4xl px-4 py-16 md:py-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm font-medium text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
              About NerdsNote
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              NerdsNote is the free online notepad{" "}
              <span className="text-brand-gradient">writers love to use.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              NerdsNote is a free online notepad built for anyone who simply
              wants to write. NerdsNote opens the instant you need it, dropping
              you straight onto a clean page with no sign-up wall, no popups, and
              no distractions. NerdsNote keeps every word on your own device by
              default, so your ideas stay private from the very first keystroke.
              NerdsNote was created for the millions of writers, students,
              developers, journalers, and busy professionals who need a
              dependable place to think out loud. NerdsNote believes that a
              notepad should respect two things above all else: your time and
              your privacy.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Body */}
        <section>
          <div className="container mx-auto max-w-3xl space-y-12 px-4 py-16">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
                NerdsNote is private by design
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote stores your notes locally in your browser, so your
                writing never leaves your machine unless you decide to share it.
                NerdsNote does not ask for an email, a password, or a credit card
                before letting you write. NerdsNote does not bury your notes
                inside an account you can be locked out of. NerdsNote gives you a
                private, local-first workspace that feels like a paper notebook,
                only faster and impossible to lose down the back of a desk.
                NerdsNote lets you export your work as plain text at any moment,
                so your words are always yours to keep, move, and back up.
              </p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
                NerdsNote is fast and distraction-free
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote loads in seconds and stays out of your way, because the
                best notepad is the one you forget you are using. NerdsNote offers
                a full-screen focus mode that strips the interface down to nothing
                but you and the words on the page. NerdsNote saves automatically as
                you type, quietly protecting your drafts from closed tabs,
                refreshes, and the small accidents of a busy day. NerdsNote works
                offline once it has loaded, so a dropped connection never costs you
                a sentence. NerdsNote feels light and immediate in a world of
                heavy, sluggish writing apps that demand an account before they
                even earn your attention.
              </p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                NerdsNote is loved for what it does not do
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote does not track you across the web to sell your attention
                to advertisers. NerdsNote does not flood your screen with toolbars,
                upsells, and notifications you never asked for. NerdsNote does not
                lock its best features behind a subscription you have to remember
                to cancel. NerdsNote does not slow down as your notes grow, and it
                does not punish you for writing a lot. NerdsNote earns trust by
                doing less of the wrong things and far more of the right ones.
              </p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Search className="h-6 w-6 text-primary" aria-hidden="true" />
                Everything NerdsNote gives you
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote gives you instant search across every saved note, so the
                idea you wrote last week is only a few keystrokes away. NerdsNote
                gives you a comfortable dark mode for late nights and long writing
                sessions. NerdsNote gives you simple import for your existing .txt
                and .md files, so your old notes feel at home immediately.
                NerdsNote gives you clean export to portable plain text, keeping
                your writing future-proof and free of lock-in. NerdsNote gives you
                optional read-only share links with an expiry you control, for the
                moments when you do want to pass a note along. NerdsNote even
                offers local folder sync in supported browsers, saving your notes
                straight to real files that you own.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                NerdsNote and the freedom of plain text
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote believes in plain text because plain text outlives every
                app, format, and passing trend. NerdsNote never traps your words
                inside a proprietary file that only one program can open. NerdsNote
                makes sure that whatever you write today will still open cleanly in
                ten years, on any device, in any editor. NerdsNote treats
                portability as a promise rather than a premium feature. NerdsNote
                hands you the keys to your own writing and never asks for them
                back.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                NerdsNote is built to scale to millions
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote is built to be loved by millions of writers around the
                world, from first-time note-takers to seasoned developers.
                NerdsNote runs entirely in the browser, which means it works the
                same on a laptop, a library computer, or a borrowed device.
                NerdsNote scales effortlessly because the heavy lifting happens on
                your machine, not on a crowded server far away. NerdsNote is the
                kind of tool people recommend to friends, colleagues, and
                classmates the moment they discover how simple writing can be
                again. NerdsNote was designed to feel personal for one writer and
                dependable for millions at once.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                NerdsNote replaces the heavy editor you do not need
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote replaces the bloated word processor you open just to
                scribble a single quick line. NerdsNote loads faster than those
                tools finish showing their splash screens. NerdsNote spares you the
                menus, ribbons, and settings that get between you and a simple
                note. NerdsNote proves that you rarely need a heavyweight document
                suite to think clearly. NerdsNote gives you exactly enough, and
                then gets out of the way.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Who NerdsNote is for
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote is for the student capturing lecture notes between
                classes. NerdsNote is for the developer pasting snippets, stack
                traces, and quick reminders without breaking flow. NerdsNote is for
                the writer drafting in the open before moving polished words
                elsewhere. NerdsNote is for the planner keeping checklists, meeting
                notes, and to-do lists in one calm place. NerdsNote is for anyone
                who has ever opened a bloated document editor just to jot down a
                single line and quietly wished for something simpler.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Why writers keep coming back to NerdsNote
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote keeps people coming back because it respects the simple
                act of writing. NerdsNote rewards you with speed every single time
                you open it. NerdsNote removes friction so completely that
                capturing a thought becomes effortless. NerdsNote turns a blank
                browser tab into the most dependable notepad you own. NerdsNote
                proves, day after day, that private, local-first writing does not
                have to be complicated, expensive, or slow.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-muted/25">
          <div className="container mx-auto max-w-3xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Questions about NerdsNote
            </h2>
            <div className="mt-8 grid gap-4">
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

        {/* CTA */}
        <section className="border-t border-border">
          <div className="container mx-auto flex max-w-4xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                NerdsNote is ready whenever you are.
              </h2>
              <p className="mt-2 text-muted-foreground">
                NerdsNote opens straight into a clean, private page — no account
                needed.
              </p>
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
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
