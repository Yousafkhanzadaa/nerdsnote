import type { Metadata } from "next"
import NotepadClient from "@/components/notepad-client"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, ogImage } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Open the NerdsNote Editor — Write Notes in Your Browser",
  description:
    "Open the editor and start writing instantly. Autosave, dark mode, instant search, and offline access — private, local-first, and no login required.",
  alternates: {
    canonical: "/notepad",
  },
  openGraph: {
    title: "NerdsNote Editor",
    description:
      "Write distraction-free with NerdsNote. Auto-save, dark mode, and local privacy.",
    url: "https://nerdsnote.com/notepad",
    images: [ogImage],
  },
}

export default function NotepadPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Editor", path: "/notepad" },
        ])}
      />
      <NotepadClient />
    </>
  )
}
