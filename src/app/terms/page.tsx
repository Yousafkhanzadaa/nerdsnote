import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Scale } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms and Conditions - NerdsNote",
  description:
    "Read the NerdsNote terms covering local notes, share links, backups, acceptable use, and data responsibility.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms and Conditions - NerdsNote",
    description:
      "Terms for using NerdsNote as a local-first online notepad and share-link tool.",
    url: "https://nerdsnote.com/terms",
  },
}

const terms = [
  {
    title: "Use of the app",
    body:
      "NerdsNote is provided as a free browser-based notepad. Use it for lawful note taking, writing, drafting, and personal productivity.",
  },
  {
    title: "Your responsibility",
    body:
      "You are responsible for the notes you create, keep, export, delete, or share. Export important notes regularly to keep your own backups.",
  },
  {
    title: "Share links",
    body:
      "When you create a share link, anyone with the URL can view that note until the link expires. Do not share sensitive, confidential, or regulated information through public links.",
  },
  {
    title: "Local storage",
    body:
      "Local browser storage can be cleared by browser settings, device cleanup tools, private browsing mode, or profile changes. NerdsNote cannot recover notes removed from local storage.",
  },
  {
    title: "Service changes",
    body:
      "NerdsNote may update features, limits, expiry behavior, or availability over time to keep the app reliable and safe.",
  },
]

export default function TermsPage() {
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
              <Scale className="h-5 w-5" aria-hidden="true" />
              <span>Terms and Conditions</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Simple terms for a simple notepad.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              These terms explain user responsibility, share links, local
              storage, backups, and acceptable use.
            </p>
          </div>
        </section>

        <section className="bg-muted/25">
          <div className="container mx-auto grid max-w-4xl gap-4 px-4 py-12">
            {terms.map((term) => (
              <Card key={term.title} className="rounded-md p-6">
                <h2 className="text-xl font-semibold">{term.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {term.body}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
