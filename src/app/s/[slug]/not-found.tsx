import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MissingPageTheme } from "@/components/missing-page-theme"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16 text-foreground">
      <MissingPageTheme />
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">This note is unavailable.</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        The link may have expired or been copied incorrectly.
      </p>
      <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 self-start text-sm text-primary underline underline-offset-4">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to NerdsNote
      </Link>
    </main>
  )
}
