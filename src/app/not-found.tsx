import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MissingPageTheme } from "@/components/missing-page-theme"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <MissingPageTheme />
      <SiteHeader />
      <main id="main-content" className="paper-reading flex flex-1 flex-col items-start justify-center py-16">
        <h1 className="paper-title">Page not found</h1>
        <Link href="/" className="paper-link mt-6 inline-flex min-h-11 items-center gap-2 text-sm">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to NerdsNote
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
