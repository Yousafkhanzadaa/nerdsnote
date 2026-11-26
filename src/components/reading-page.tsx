import type { ReactNode } from "react"

import { JsonLd } from "@/components/json-ld"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
import { breadcrumbJsonLd } from "@/lib/structured-data"

type ReadingPageProps = {
  name: string
  path: "/privacy" | "/terms" | "/contact"
  title: string
  lead: string
  children: ReactNode
}

export function ReadingPage({ name, path, title, lead, children }: ReadingPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name, path }])} />
      <SiteHeader />
      <main id="main-content" className="paper-reading w-full flex-1 pb-16 sm:pb-24">
        <header className="pb-9 pt-12 sm:pb-12 sm:pt-20">
          <p className="mb-4 text-sm font-medium text-primary">{name}</p>
          <h1 className="paper-title text-balance">{title}</h1>
          <p className="paper-lead mt-5">{lead}</p>
        </header>
        {children}
      </main>
      <SiteFooter currentHref={path} />
    </div>
  )
}

export function ReadingSection({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className="grid gap-2 border-t border-border py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 sm:py-8">
      <h2 className="font-serif text-2xl leading-tight tracking-tight">{title}</h2>
      <div>
        <p className="text-base leading-7 text-muted-foreground">{body}</p>
        {children}
      </div>
    </section>
  )
}
