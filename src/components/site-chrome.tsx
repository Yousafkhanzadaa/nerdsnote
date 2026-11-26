import Link from "next/link"
import { ArrowUpRight, NotebookPen } from "lucide-react"

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Guides" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-3 focus:text-foreground focus:outline-2 focus:outline-ring">
        Skip to content
      </a>
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:min-h-20 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <NotebookPen className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
          <span className="font-serif text-[1.65rem] leading-none tracking-tight">NerdsNote</span>
        </Link>
        <Link href="/notepad" prefetch={false}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm px-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          Open notebook <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  )
}

export function SiteFooter({ currentHref }: { currentHref?: string }) {
  return (
    <footer className="mx-auto mt-auto w-full max-w-6xl px-5 sm:px-10">
      <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-5 border-t border-border py-4 text-xs text-muted-foreground sm:gap-x-7">
        {footerLinks.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={href === currentHref ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:text-foreground aria-[current=page]:underline">
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
