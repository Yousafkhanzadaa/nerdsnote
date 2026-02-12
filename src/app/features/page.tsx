import type { Metadata } from "next"
import { FeaturesClient } from "@/components/features-client"

export const metadata: Metadata = {
  title: "Features — NerdsNote | Distraction-Free Online Notepad",
  description:
    "Discover NerdsNote features: Auto-save, dark mode, offline support, privacy-first storage, file import/export, and distraction-free writing mode.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features — NerdsNote",
    description:
      "All features of NerdsNote: local auto-save, dark mode, file export, private storage, and more.",
    url: "https://nerdsnote.com/features",
  },
}

export default function FeaturesPage() {
  return <FeaturesClient />
}
