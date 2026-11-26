import type { Metadata } from "next"

import { JsonLd } from "@/components/json-ld"
import { MiniNotepadPreview } from "@/components/mini-notepad-preview"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"
import { softwareApplicationJsonLd } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "NerdsNote - Free Online Notepad for Private Notes",
  description:
    "Start a draft in your browser and continue in your private notebook. NerdsNote saves your writing locally, without an account.",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <JsonLd data={softwareApplicationJsonLd} />
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-[58rem] flex-1 flex-col justify-center px-4 py-8 sm:px-10 sm:py-14 lg:py-20">
        <MiniNotepadPreview />
      </main>

      <SiteFooter />
    </div>
  )
}
