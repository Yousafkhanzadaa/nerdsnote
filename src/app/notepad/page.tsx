import type { Metadata } from "next"
import NotepadClient from "@/components/notepad-client"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, websiteOpenGraph } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Online Notebook Editor | NerdsNote",
  description:
    "Open your notebook to write, format, and search notes saved in this browser. Add images or charts, download your work, or share a read-only copy.",
  alternates: {
    canonical: "/notepad",
  },
  openGraph: {
    ...websiteOpenGraph,
    title: "Online Notebook Editor | NerdsNote",
    description: "Write, format, and search your notes in this browser. Add images or charts and download a copy to keep.",
    url: "https://nerdsnote.com/notepad",
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
