import type { Metadata } from "next"
import Link from "next/link"

import { JsonLd } from "@/components/json-ld"
import { MiniNotepadPreview } from "@/components/mini-notepad-preview"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"
import { guideFeedTypes, ogImage, siteName, siteUrl, softwareApplicationJsonLd } from "@/lib/structured-data"

const title = "Free Online Notepad for Private Notes | NerdsNote"
const description = "Write private notes online without an account. Your draft saves automatically in this browser. Open the notebook to organize notes and download a backup."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/", types: guideFeedTypes },
  openGraph: { type: "website", url: siteUrl, siteName, title, description, images: [ogImage] },
  twitter: { card: "summary_large_image", title, description, images: [ogImage] },
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <JsonLd data={softwareApplicationJsonLd} />
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-[58rem] flex-1 flex-col justify-center px-4 py-8 sm:px-10 sm:py-14 lg:py-20">
        <MiniNotepadPreview />
        <section aria-labelledby="storage-heading" className="mt-10 grid gap-3 px-1 sm:mt-14 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)] sm:gap-x-9">
          <h2 id="storage-heading" className="font-serif text-2xl font-normal tracking-tight">
            Where your notes are saved
          </h2>
          <div className="max-w-prose space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              This page keeps one quick draft. It{" "}
              <Link href="/blog/online-notepad-with-autosave" className="paper-link">saves automatically in your browser</Link>,
              so you can close the tab and return to it later. Choose Continue in editor to turn the draft into a note.
              Open <Link href="/notepad" prefetch={false} className="paper-link">your notebook</Link> any time to find saved notes
              by title or text, without an account.
            </p>
            <p>
              To <Link href="/blog/will-clearing-cache-delete-browser-notes#backup-first" className="paper-link">back up your notes before clearing browser data</Link>,
              download each note you want to keep from the notebook’s More options menu. In supported browsers, you can also save notes to a folder you choose.
              Creating a share link uploads a separate, read-only copy.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
