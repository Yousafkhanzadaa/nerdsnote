import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { Button } from "@/components/ui/button"
import { blogPosts, formatBlogDate } from "@/lib/blog-posts"
import { breadcrumbJsonLd, ogImage, siteUrl } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Online Notepad, Privacy & Writing Guides | NerdsNote",
  description:
    "Practical guides to online notepads, browser auto-save, private local storage, reliable backups, meeting notes, and focused writing.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    title: "NerdsNote Guides — Private Notes and Better Writing",
    description:
      "Useful, experience-led guides to browser note privacy, local storage, backups, and practical writing workflows.",
    url: `${siteUrl}/blog`,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "NerdsNote Guides — Private Notes and Better Writing",
    description:
      "Useful guides to browser note privacy, local storage, backups, and practical writing workflows.",
    images: [ogImage.url],
  },
}

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${siteUrl}/blog/#blog`,
  name: "NerdsNote Guides",
  description:
    "Practical guides to private browser notes, local storage, backups, and better writing workflows.",
  url: `${siteUrl}/blog`,
  publisher: { "@id": `${siteUrl}/#organization` },
  blogPost: blogPosts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    ...(post.image
      ? {
          image: {
            "@type": "ImageObject",
            url: `${siteUrl}${post.image.src}`,
            width: post.image.width,
            height: post.image.height,
          },
        }
      : {}),
  })),
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
        ])}
      />
      <JsonLd data={blogJsonLd} />

      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="NerdsNote app icon"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span>NerdsNote</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/features">Features</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/notepad" prefetch={false}>Start writing</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-hero-glow"
          />
          <div className="container relative mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              NerdsNote guides
            </p>
            <h1 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Write better. Keep control of your notes.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Practical, plain-language guides to browser privacy, local storage,
              reliable backups, and focused note-taking workflows.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25">
          <div className="container mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-2 lg:py-20">
            {blogPosts.map((post, index) => (
              <article
                key={post.slug}
                className={`group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg ${
                  index === 0 ? "md:col-span-2 md:p-8" : ""
                }`}
              >
                {post.image && (
                  <div className="mb-6 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={post.image.src}
                      alt={post.image.alt}
                      width={post.image.width}
                      height={post.image.height}
                      className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
                      sizes={
                        index === 0
                          ? "(max-width: 768px) 100vw, 1152px"
                          : "(max-width: 768px) 100vw, 576px"
                      }
                      priority={index === 0}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.readingMinutes} min read
                  </span>
                  <time dateTime={post.updatedAt}>
                    Updated {formatBlogDate(post.updatedAt)}
                  </time>
                </div>
                <h2
                  className={`mt-5 font-bold tracking-tight ${
                    index === 0 ? "text-3xl md:text-4xl" : "text-2xl"
                  }`}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-3xl flex-1 leading-7 text-muted-foreground">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Read the guide
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Put the ideas into practice.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Open a private, local-first notepad with no account required.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/notepad" prefetch={false}>
                Open NerdsNote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>NerdsNote — free, private online notepad.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/features" className="hover:text-foreground">Features</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/feed.xml" className="hover:text-foreground">RSS</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
