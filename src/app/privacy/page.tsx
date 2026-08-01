import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, ogImage } from "@/lib/structured-data"

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
    images: [ogImage],
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
      "When you create a shareable link, the selected note content is stored in our Redis provider so anyone with the URL can view it. You choose a 1, 7, or 30 day lifetime. The public copy is then deleted automatically, or you can revoke it earlier from the browser that created it.",
  },
  {
    title: "Feedback",
    body:
      "If you submit feedback, we store the message, optional email address, submission time, and a shortened browser user-agent string for up to 90 days. This information is used only to review and respond to feedback.",
  },
  {
    title: "Analytics",
    body:
      "NerdsNote uses privacy-friendly Vercel Web Analytics for aggregate site usage and Vercel Speed Insights for performance metrics. These services do not read or collect your note content.",
  },
  {
    title: "Backups",
    body:
      "Because local notes live in your browser, clearing browser data or changing devices can remove them. Download a full NerdsNote JSON backup or connect a local folder regularly. Folder copies are plain text, so rich formatting is flattened.",
  },
  {
    title: "Shared note indexing",
    body:
      "Shared note pages are marked noindex so search engines are instructed not to include personal share URLs in search results.",
  },
  {
    title: "Service providers and technical data",
    body:
      "NerdsNote is hosted on Vercel and uses Upstash-compatible Redis for share links, feedback, and rate limits. Like most web services, these providers may process IP addresses and request metadata to deliver and protect the service. Revocation keys remain only in your browser.",
  },
  {
    title: "Questions and deletion requests",
    body:
      "For privacy questions or a deletion request, contact khueonstudios@gmail.com. Include the relevant share URL or feedback email where possible; local browser notes cannot be accessed or recovered by us.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>NerdsNote</span>
          </Link>
          <Button size="sm" asChild>
            <Link href="/notepad" prefetch={false}>Start writing</Link>
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
            <p className="mt-3 text-sm text-muted-foreground">Effective August 1, 2026.</p>
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
