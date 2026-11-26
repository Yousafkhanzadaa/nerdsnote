import { kv } from "@vercel/kv"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isShareSlug, type StoredNote } from "@/lib/share-types"
import SharedNoteView from "./shared-note-view"

const title = "A shared note · NerdsNote"
const description = "Open a note someone shared with you."
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title,
  description,
  referrer: "no-referrer",
  robots: { index: false, follow: false, nosnippet: true },
  alternates: { canonical: null },
  openGraph: { title, description, type: "article", images: ["/apple-icon.png"] },
  twitter: { card: "summary", title, description, images: ["/apple-icon.png"] },
}

export default async function SharedNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isShareSlug(slug)) notFound()
  let note: StoredNote | null

  try {
    note = await kv.get<StoredNote>(`note:${slug}`)
  } catch {
    throw new Error("Unable to load the shared note.")
  }

  if (!note) notFound()

  return (
    <SharedNoteView
      title={note.title}
      content={note.content}
      createdAt={note.createdAt}
      expiresAt={note.expiresAt}
      openInAppUrl={`/notepad?openShared=${encodeURIComponent(slug)}`}
    />
  )
}
