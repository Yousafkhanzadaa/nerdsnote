import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Rss } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
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

      <SiteHeader />

      <main id="main-content" className="paper-column pb-16 sm:pb-24">
        <header className="pt-10 pb-8 sm:pt-16 sm:pb-12">
          <div className="mb-5 flex items-center justify-between gap-4 text-sm">
            <p className="text-primary">NerdsNote guides</p>
            <a href="/feed.xml" className="paper-link inline-flex min-h-10 items-center gap-1.5">
              <Rss className="size-3.5" aria-hidden="true" /> RSS
            </a>
          </div>
          <h1 className="paper-title max-w-[19ch] text-balance">Write better. Keep control of your notes.</h1>
          <p className="paper-lead mt-4 max-w-[61ch]">
            Practical, plain-language guides to browser privacy, local storage,
            reliable backups, and focused note-taking workflows.
          </p>
        </header>

        <section aria-label="Writing and privacy guides" className="divide-y divide-border border-y border-border">
          {blogPosts.map((post, index) => (
            <article key={post.slug} className="py-7 sm:py-9">
              <Link
                href={`/blog/${post.slug}`}
                aria-labelledby={`guide-${post.slug}`}
                className={`group grid min-w-0 items-center gap-5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-8 ${
                  post.image ? index === 0 ? "md:grid-cols-[1fr_1fr]" : "sm:grid-cols-[minmax(0,1fr)_minmax(12rem,32%)]" : ""
                }`}
              >
                {post.image && (
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    width={post.image.width}
                    height={post.image.height}
                    className={`h-auto w-full rounded-sm border border-border/70 ${index > 0 ? "sm:order-last" : ""}`}
                    sizes={index === 0 ? "(min-width: 768px) 440px, 92vw" : "(min-width: 640px) 288px, 92vw"}
                    priority={index === 0}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
                    <span className="font-medium text-primary">{post.category}</span>
                    <span>{post.readingMinutes} min read</span>
                    <time dateTime={post.updatedAt}>Updated {formatBlogDate(post.updatedAt)}</time>
                  </div>
                  <h2 id={`guide-${post.slug}`} className={`mt-2 max-w-[32ch] text-pretty font-serif font-normal leading-[1.14] tracking-tight group-hover:text-primary ${
                    index === 0 ? "text-[1.9rem] lg:text-[2.5rem]" : "text-[1.65rem] sm:text-[2rem]"
                  }`}>
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-[64ch] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                    Read the guide <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        <section className="flex flex-wrap items-end justify-between gap-4 pt-9 sm:pt-12">
          <div>
            <h2 className="paper-heading">Put the ideas into practice.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Open a private, local-first notepad with no account required.</p>
          </div>
          <Link href="/notepad" prefetch={false} className="paper-link inline-flex min-h-10 items-center gap-2 text-sm">
            Open NerdsNote <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <SiteFooter currentHref="/blog" />
    </div>
  )
}
