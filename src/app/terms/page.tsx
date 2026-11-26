import type { Metadata } from "next"

import { ReadingPage, ReadingSection } from "@/components/reading-page"
import { websiteOpenGraph } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Terms and Conditions - NerdsNote",
  description:
    "Read the NerdsNote terms covering local notes, share links, backups, acceptable use, and data responsibility.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    ...websiteOpenGraph,
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
    <ReadingPage
      name="Terms and Conditions"
      path="/terms"
      title="Simple terms for a simple notepad."
      lead="These terms explain user responsibility, share links, local storage, backups, and acceptable use."
    >
      {terms.map(({ title, body }) => (
        <ReadingSection key={title} title={title} body={body} />
      ))}
    </ReadingPage>
  )
}
