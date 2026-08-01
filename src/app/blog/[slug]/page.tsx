import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { Button } from "@/components/ui/button"
import {
  blogPosts,
  formatBlogDate,
  getBlogPost,
} from "@/lib/blog-posts"
import { breadcrumbJsonLd, ogImage, siteUrl } from "@/lib/structured-data"

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {
      title: "Guide Not Found | NerdsNote",
      robots: { index: false, follow: true },
    }
  }

  const url = `${siteUrl}/blog/${post.slug}`

  return {
    title: `${post.seoTitle} | NerdsNote`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: "NerdsNote Editorial Team", url: `${siteUrl}/about` }],
    category: post.category,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [`${siteUrl}/about`],
      section: post.category,
      tags: post.keywords,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage.url],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) notFound()

  const url = `${siteUrl}/blog/${post.slug}`
  const relatedPosts = blogPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 2)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    headline: post.title,
    description: post.description,
    image: `${siteUrl}${ogImage.url}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Organization",
      "@id": `${siteUrl}/about/#editorial-team`,
      name: "NerdsNote Editorial Team",
      url: `${siteUrl}/about`,
      parentOrganization: { "@id": `${siteUrl}/#organization` },
    },
    publisher: { "@id": `${siteUrl}/#organization` },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: "en",
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd data={articleJsonLd} />

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
              <Link href="/blog">All guides</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/notepad" prefetch={false}>Start writing</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <article>
          <header className="relative overflow-hidden border-b border-border">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-hero-glow"
            />
            <div className="container relative mx-auto max-w-4xl px-4 py-14 md:py-20">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All guides
              </Link>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
              </div>
              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>
                  By{" "}
                  <Link href="/about" className="font-medium text-foreground hover:underline">
                    NerdsNote Editorial Team
                  </Link>
                </span>
                <span>
                  Published <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                </span>
                <span>
                  Updated <time dateTime={post.updatedAt}>{formatBlogDate(post.updatedAt)}</time>
                </span>
              </div>
            </div>
          </header>

          <div className="container mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[220px_minmax(0,760px)] lg:justify-center lg:py-20">
            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <p className="text-sm font-semibold">In this guide</p>
              <nav aria-label="Table of contents" className="mt-4">
                <ol className="space-y-3 border-l border-border pl-4 text-sm text-muted-foreground">
                  {post.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="leading-5 hover:text-foreground"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="min-w-0">
              <p className="text-lg leading-8 text-muted-foreground">{post.intro}</p>

              <div className="mt-12 space-y-14">
                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-8">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                      {section.heading}
                    </h2>

                    {section.template && (
                      <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted/40 p-5 text-sm leading-7">
                        <code>{section.template}</code>
                      </pre>
                    )}

                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-5 leading-8 text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && (
                      <ul className="mt-6 space-y-3 pl-5 text-muted-foreground marker:text-primary">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="list-disc pl-1 leading-7">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.steps && (
                      <ol className="mt-6 space-y-4">
                        {section.steps.map((step, index) => (
                          <li key={step} className="flex gap-4 leading-7 text-muted-foreground">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ))}
              </div>

              <aside className="mt-14 rounded-xl border border-border bg-muted/30 p-6">
                <h2 className="text-xl font-bold">Try it in NerdsNote</h2>
                <p className="mt-2 leading-7 text-muted-foreground">
                  Open the free browser notepad and start writing without creating an account.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/notepad" prefetch={false}>
                    Open the notepad
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </aside>

              <section className="mt-12 border-t border-border pt-8">
                <h2 className="text-lg font-bold">Sources and further reading</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {post.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </article>

        <section className="border-t border-border bg-muted/25">
          <div className="container mx-auto max-w-5xl px-4 py-14">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-2xl font-bold tracking-tight">Related guides</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {related.category}
                  </p>
                  <h3 className="mt-3 text-xl font-bold">{related.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>NerdsNote — practical notes without the signup wall.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/blog" className="hover:text-foreground">Guides</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
