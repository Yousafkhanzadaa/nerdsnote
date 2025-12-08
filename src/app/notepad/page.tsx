import type { Metadata } from "next"
import NotepadClient from "@/components/notepad-client"

export const metadata: Metadata = {
  title: "NerdsNote Editor — Free Online Notepad",
  description:
    "Start writing in your browser immediately. NerdsNote is a free, secure, offline-capable online notepad with no login required.",
  alternates: {
    canonical: "/notepad",
  },
  openGraph: {
    title: "NerdsNote Editor",
    description:
      "Write distraction-free with NerdsNote. Auto-save, dark mode, and local privacy.",
    url: "https://nerdsnote.com/notepad",
  },
}

export default function NotepadPage() {
  return <NotepadClient />
}
