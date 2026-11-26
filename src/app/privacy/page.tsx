import type { Metadata } from "next"

import { ReadingPage, ReadingSection } from "@/components/reading-page"
import { ogImage } from "@/lib/structured-data"

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
      "NerdsNote saves drafts and inserted images in this browser profile. Someone who can open your notebook in the same profile can read them. You can also choose a local folder for your notes.",
  },
  {
    title: "Share links",
    body:
      "Creating a link uploads a copy of one note and the optional title you choose for readers. Your browser prepares compact copies of images on your device for the upload. Links last one, seven, or thirty days. Anyone with the link can read or save the shared copy and keep it after expiry.",
  },
  {
    title: "Analytics",
    body:
      "NerdsNote does not run visitor analytics or performance tracking scripts. The share service uses a temporary IP-based counter to limit how many links can be created in an hour.",
  },
  {
    title: "Feedback",
    body:
      "If you submit feedback, the form saves your message, optional email address, and submission time in Firestore.",
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
    <ReadingPage
      name="Privacy Policy"
      path="/privacy"
      title="Your notes stay local by default."
      lead="This policy explains how NerdsNote handles note content, share links, analytics, and backups."
    >
      {sections.map(({ title, body }) => (
        <ReadingSection key={title} title={title} body={body} />
      ))}
    </ReadingPage>
  )
}
