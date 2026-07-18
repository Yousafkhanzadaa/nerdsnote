import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Heart,
  Lock,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, ogImage } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "About NerdsNote — Why We Built a Private, Local-First Notepad",
  description:
    "The story behind NerdsNote — a fast, private notepad that keeps your writing on your own device. No accounts, no ads, just a clean page to write on.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About NerdsNote — A Private, Local-First Notepad",
    description:
      "Why we built NerdsNote: a fast, private, distraction-free place to write in the browser. No login, no ads, no clutter.",
    url: "https://nerdsnote.com/about",
    images: [ogImage],
  },
}

const heroIntro =
  "NerdsNote started with a small, familiar frustration: wanting to jot something down in the browser and having to sign into a heavy app, dismiss a popup, and hand a server a few private lines first. So we built the opposite — a notepad that opens instantly, keeps your writing on your own device, and asks nothing of you. No account, no ads, no clutter. Just a clean page and a cursor."

const highlights = [
  "No account needed — it opens in seconds",
  "Notes stay private on your own device",
  "Works offline once it has loaded",
  "Autosaves quietly as you type",
  "Dark mode, instant search, import, and export",
  "Your words stay portable as plain text",
]

const story = [
  {
    icon: Lock,
    heading: "Private by design",
    body: "Your notes are saved locally in your browser, not on our servers. What you write stays on your machine unless you deliberately create a share link. There is no email or password to hand over before you start, and no account you can be locked out of. You can export everything as plain text whenever you like, so your words are always yours to keep and back up.",
  },
  {
    icon: Zap,
    heading: "Fast, and out of your way",
    body: "The best notepad is the one you forget you are using. NerdsNote loads in a second or two and drops you straight onto the page. Focus mode strips the screen back to just you and the text, autosave protects drafts from closed tabs and refreshes, and once the app has loaded you can keep writing even if your connection drops.",
  },
  {
    icon: FileText,
    heading: "Plain text, because it lasts",
    body: "We are built around plain text because it outlives apps, formats, and passing trends. Your writing is never trapped inside a proprietary file that only one program can open — what you type today will still open cleanly years from now, on any device, in any editor. Here, portability is the default rather than a premium feature.",
  },
  {
    icon: Users,
    heading: "Who it is for",
    body: "It is for the student capturing lecture notes between classes, the developer pasting snippets and stack traces without breaking flow, the writer drafting in the open, and the planner keeping checklists and meeting notes in one calm place. If you have ever opened a heavy document editor just to write a single line and wished for something simpler, it is for you too.",
  },
]

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
              Why we built{" "}
              <span className="text-brand-gradient">NerdsNote.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {heroIntro}
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

        {/* Story */}
        <section>
          <div className="container mx-auto max-w-3xl space-y-12 px-4 py-16">
            {story.map(({ icon: Icon, heading, body }) => (
              <div key={heading}>
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  {heading}
                </h2>
                <p className="mt-4 leading-8 text-muted-foreground">{body}</p>
              </div>
            ))}

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Who makes NerdsNote
              </h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                NerdsNote is built and maintained by{" "}
                <a
                  href="https://khueonstudios.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Khueon Studios
                </a>
                . The core notepad is free to use, and we intend to keep it that
                way. If you have feedback or run into a problem, we would
                genuinely like to hear about it — reach us any time from the{" "}
                <Link
                  href="/contact"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  contact page
                </Link>
                .
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
                Ready whenever you are.
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
