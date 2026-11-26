import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ChartNoAxesColumn,
  Download,
  FileText,
  HardDrive,
  ImagePlus,
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
import { breadcrumbJsonLd, ogImage } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "NerdsNote Features — Auto-Save, Dark Mode, Offline & Export",
  description:
    "Explore NerdsNote's features for private note taking: local auto-save, offline support, dark mode, instant search, file import, export, and distraction-free writing.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features — NerdsNote",
    description:
      "Private online notepad features: local auto-save, dark mode, file export, private storage, offline access, and more.",
    url: "https://nerdsnote.com/features",
    images: [ogImage],
  },
}

const features = [
  {
    title: "Distraction-free writing",
    description:
      "A clean browser notepad for quick notes, longer drafts, lists, and plain text writing.",
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
      "NerdsNote keeps your current work saved locally as you type.",
    icon: Zap,
  },
  {
    title: "Offline support",
    description:
      "Keep writing in modern browsers after the app loads, even when the connection is unreliable.",
    icon: WifiOff,
  },
  {
    title: "Dark mode",
    description:
      "Switch between light and dark themes for comfortable writing at any time of day.",
    icon: Moon,
  },
  {
    title: "Full-screen focus",
    description:
      "Use distraction-free mode when you want the editor to stay out of your way.",
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
      "Download notes as plain text so your writing stays portable.",
    icon: Download,
  },
  {
    title: "Optional folder sync",
    description:
      "Connect a local folder in supported browsers when you want file-based note storage.",
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
          {features.map(({ title, description, icon: Icon }) => (
            <li key={title} className="grid gap-2.5 py-5 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] sm:items-baseline sm:gap-x-9 sm:py-6">
              <h2 className="flex items-baseline gap-3 font-serif text-2xl leading-snug font-normal tracking-tight">
                <Icon className="size-[1.1rem] shrink-0 self-center text-primary" strokeWidth={1.5} aria-hidden="true" />
                {title}
              </h2>
              <p className="pl-[1.85rem] leading-7 text-muted-foreground sm:pl-0">{description}</p>
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
