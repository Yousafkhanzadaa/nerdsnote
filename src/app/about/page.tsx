import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SiteFooter, SiteHeader } from "@/components/site-chrome"
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
    heading: "Private by design",
    body: "Your notes are saved locally in your browser, not on our servers. What you write stays on your machine unless you deliberately create a share link. There is no email or password to hand over before you start, and no account you can be locked out of. You can export everything as plain text whenever you like, so your words are always yours to keep and back up.",
  },
  {
    heading: "Fast, and out of your way",
    body: "The best notepad is the one you forget you are using. NerdsNote loads in a second or two and drops you straight onto the page. Focus mode strips the screen back to just you and the text, autosave protects drafts from closed tabs and refreshes, and once the app has loaded you can keep writing even if your connection drops.",
  },
  {
    heading: "Plain text, because it lasts",
    body: "We are built around plain text because it outlives apps, formats, and passing trends. Your writing is never trapped inside a proprietary file that only one program can open — what you type today will still open cleanly years from now, on any device, in any editor. Here, portability is the default rather than a premium feature.",
  },
  {
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

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <SiteHeader />

      <main id="main-content" className="paper-reading flex-1 pb-14 sm:pb-20">
        <article aria-labelledby="about-title">
          <header className="pt-12 sm:pt-20">
            <p className="text-sm font-medium text-primary">About NerdsNote</p>
            <h1 id="about-title" className="paper-title mt-3">Why we built NerdsNote.</h1>
            <p className="paper-lead mt-6">{heroIntro}</p>
          </header>

          <ul aria-label="NerdsNote highlights" className="my-9 grid list-disc gap-x-8 gap-y-2.5 border-y border-border py-6 pl-5 text-sm leading-relaxed marker:text-primary sm:my-12 sm:grid-cols-2 sm:gap-x-10">
            {highlights.map((item) => <li key={item} className="pr-2">{item}</li>)}
          </ul>

          <div className="space-y-9 sm:space-y-12">
            {story.map(({ heading, body }) => (
              <section key={heading}>
                <h2 className="paper-heading">{heading}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
              </section>
            ))}

            <section>
              <h2 className="paper-heading">Who makes NerdsNote</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                NerdsNote is built and maintained by{" "}
                <a href="https://khueonstudios.com" className="paper-link">Khueon Studios</a>.
                The core notepad is free to use, and we intend to keep it that
                way. If you have feedback or run into a problem, we would
                genuinely like to hear about it — reach us any time from the{" "}
                <Link href="/contact" className="paper-link">contact page</Link>.
              </p>
            </section>
          </div>
        </article>

        <section aria-labelledby="questions-title" className="mt-12 border-t border-border pt-8 sm:mt-16 sm:pt-10">
          <h2 id="questions-title" className="paper-heading">Questions about NerdsNote</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map(({ question, answer }) => (
              <div key={question}>
                <dt className="font-serif text-xl leading-snug">{question}</dt>
                <dd className="mt-1.5 leading-7 text-muted-foreground">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 border-t border-border pt-8 sm:mt-16 sm:pt-10">
          <h2 className="paper-heading">Ready whenever you are.</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            NerdsNote opens straight into a clean, private page — no account needed.
          </p>
          <Link href="/notepad" prefetch={false} className="paper-link mt-3 inline-flex min-h-11 items-center gap-2">
            Open NerdsNote <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <SiteFooter currentHref="/about" />
    </div>
  )
}
