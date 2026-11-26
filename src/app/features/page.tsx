import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ChartNoAxesColumn,
  Download,
  FileText,
  HardDrive,
  ImagePlus,
  Link2,
  Maximize2,
  Moon,
  Search,
  Shield,
  Upload,
  WifiOff,
  Zap,
} from "lucide-react"

import { SiteFooter, SiteHeader } from "@/components/site-chrome"
import { JsonLd } from "@/components/json-ld"
import { breadcrumbJsonLd, websiteOpenGraph } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "NerdsNote Features — Auto-Save, Local Storage and Export",
  description:
    "See where NerdsNote saves your notes, how to keep writing when your connection drops, and how to download text, pictures and charts from your notebook.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    ...websiteOpenGraph,
    title: "Features — NerdsNote",
    description:
      "Explore browser auto-save, optional folder storage, images, charts and file downloads in the NerdsNote editor.",
    url: "https://nerdsnote.com/features",
  },
}

const features = [
  {
    title: "Distraction-free writing",
    description:
      "Start with a blank page. Open Format to add headings, lists or tables as your draft takes shape.",
    icon: FileText,
  },
  {
    title: "Private local storage",
    description:
      "Notes are saved in your browser by default, with no account required to start writing.",
    icon: Shield,
  },
  {
    title: "Images in notes",
    description:
      "Add a photo or screenshot from your device, clipboard, or by dragging it onto the page. Your browser prepares smaller image copies when you share.",
    icon: ImagePlus,
  },
  {
    title: "Charts in notes",
    description:
      "Compare categories with bars or columns, follow a trend with a line, see proportions with a pie or donut, or plot two measurements on a scatter chart. Preview your chart as you enter the data.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Automatic saving",
    description:
      "Your edits save as you type. Look for “Saved in this browser” below the note, then return in the same browser profile to pick up where you left off.",
    guide: { href: "/blog/online-notepad-with-autosave", label: "How auto-save works" },
    icon: Zap,
  },
  {
    title: "Writing offline",
    description:
      "If your connection drops while the notebook is open, you can keep editing and saving locally. Opening the notebook again may need a connection.",
    icon: WifiOff,
  },
  {
    title: "Dark mode",
    description:
      "Switch between light and dark themes for comfortable writing at any time of day.",
    icon: Moon,
  },
  {
    title: "Focus mode",
    description:
      "Hide the editor toolbar while you write. Choose “Exit focus” to bring the controls back.",
    icon: Maximize2,
  },
  {
    title: "Instant search",
    description:
      "Search saved notes by title or content and get back to the text you need.",
    icon: Search,
  },
  {
    title: "Import text files",
    description:
      "Bring in .txt and .md files to continue writing from existing notes.",
    icon: Upload,
  },
  {
    title: "Export notes",
    description:
      "Download a plain-text file for the words. When a note contains a picture or chart, “Download note with images” keeps the visuals for import back into NerdsNote.",
    guide: { href: "/blog/will-clearing-cache-delete-browser-notes#backup-first", label: "Back up your notes" },
    icon: Download,
  },
  {
    title: "Read-only sharing",
    description:
      "Create a link to a copy of one note for one, seven or thirty days. Anyone with the link can read or save that copy. Later edits stay in your notebook.",
    icon: Link2,
  },
  {
    title: "Save to a local folder",
    description:
      "Connect a folder in a supported browser to open its text and Markdown files. Edits save to the linked file, and deleting a connected note also deletes that file.",
    icon: HardDrive,
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
        ])}
      />
      <SiteHeader />

      <main id="main-content" className="paper-column flex-1 pb-14 sm:pb-20">
        <header className="pt-12 pb-8 sm:pt-20 sm:pb-12">
          <p className="text-sm font-medium text-primary">NerdsNote features</p>
          <h1 className="paper-title mt-3 max-w-[25ch] text-balance">
            A free online notepad with private, local-first writing tools.
          </h1>
          <p className="paper-lead mt-5 max-w-[60ch]">
            Write quick notes, draft text, search your saved notes, import
            files, export your work, and keep writing without an account.
          </p>
        </header>

        <ul aria-label="Notepad features" className="divide-y divide-border border-y border-border">
          {features.map(({ title, description, guide, icon: Icon }) => (
            <li key={title} className="grid gap-2.5 py-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] sm:items-baseline sm:gap-x-9 sm:py-6">
              <h2 className="flex items-baseline gap-3 font-serif text-2xl leading-snug font-normal tracking-tight">
                <Icon className="size-[1.1rem] shrink-0 self-center text-primary" strokeWidth={1.5} aria-hidden="true" />
                {title}
              </h2>
              <p className="pl-[1.85rem] leading-7 text-muted-foreground sm:pl-0">
                {description}
                {guide && <> <Link href={guide.href} className="paper-link underline underline-offset-4">{guide.label}</Link></>}
              </p>
            </li>
          ))}
        </ul>

        <section className="pt-9 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:pt-12">
          <div>
            <h2 className="paper-heading">Ready for a clean note taking app?</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Open the editor and start writing in your browser.
            </p>
          </div>
          <Link href="/notepad" prefetch={false} className="paper-link mt-3 inline-flex min-h-11 shrink-0 items-center gap-2 sm:mt-0">
            Open NerdsNote <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <SiteFooter currentHref="/features" />
    </div>
  )
}
