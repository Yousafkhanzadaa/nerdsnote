import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy - NerdsNote",
  description:
    "Read the NerdsNote privacy policy, including local note storage, share links, analytics, and data control.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy - NerdsNote",
    description:
      "How NerdsNote handles local notes, share links, analytics, and user data.",
    url: "https://nerdsnote.com/privacy",
  },
}

const sections = [
  {
    title: "Local notes",
    body:
      "By default, your notes are stored locally in your browser. NerdsNote does not upload regular notes to its servers unless you choose to create a share link.",
  },
  {
    title: "Share links",
    body:
      "When you create a shareable link, the selected note content is uploaded so anyone with the link can view it. The current app interface creates links that expire after 24 hours.",
  },
  {
    title: "Analytics",
    body:
      "NerdsNote includes Vercel Analytics for aggregate site usage and performance insights. Analytics is not used to read or collect your note content.",
  },
  {
    title: "Backups",
    body:
      "Because local notes live in your browser, clearing browser data or changing devices can remove them. Export important notes regularly.",
  },
  {
    title: "Shared note indexing",
    body:
      "Shared note pages are marked noindex so search engines are instructed not to include personal share URLs in search results.",
  },
]

export default function PrivacyPage() {
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
          <div className="container mx-auto max-w-4xl px-4 py-14">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <Shield className="h-5 w-5" aria-hidden="true" />
              <span>Privacy Policy</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Your notes stay local by default.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              This policy explains how NerdsNote handles note content, share
              links, analytics, and backups.
            </p>
          </div>
        </section>

        <section className="bg-muted/25">
          <div className="container mx-auto grid max-w-4xl gap-4 px-4 py-12">
            {sections.map((section) => (
              <Card key={section.title} className="rounded-md p-6">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {section.body}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
