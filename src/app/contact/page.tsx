import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const contactEmail = "khueonstudios@gmail.com"

export const metadata: Metadata = {
  title: "Contact - NerdsNote",
  description:
    "Contact NerdsNote by email for support, feedback, questions, or product inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact - NerdsNote",
    description:
      "Contact NerdsNote by email for support, feedback, questions, or product inquiries.",
    url: "https://nerdsnote.com/contact",
  },
}

export default function ContactPage() {
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
              <Mail className="h-5 w-5" aria-hidden="true" />
              <span>Contact</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Get in touch with NerdsNote.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Send feedback, support questions, product suggestions, or business
              inquiries by email.
            </p>
          </div>
        </section>

        <section className="bg-muted/25">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <Card className="rounded-md p-6">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Email</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                We read messages sent to this inbox.
              </p>
              <Button className="mt-2 w-fit" asChild>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </Button>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
