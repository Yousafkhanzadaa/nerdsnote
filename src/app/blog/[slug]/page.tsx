import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
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
  const socialImage = post.image
    ? {
        url: post.image.src,
        width: post.image.width,
        height: post.image.height,
        alt: post.image.alt,
      }
    : ogImage

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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [socialImage.url],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) notFound()

  const url = `${siteUrl}/blog/${post.slug}`
  const relatedPosts = blogPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 2)
  const articleImage = post.image
    ? {
        "@type": "ImageObject",
        url: `${siteUrl}${post.image.src}`,
        width: post.image.width,
        height: post.image.height,
      }
    : {
        "@type": "ImageObject",
        url: `${siteUrl}${ogImage.url}`,
        width: ogImage.width,
        height: ogImage.height,
      }
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    headline: post.title,
    description: post.description,
    image: articleImage,
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

  const contents = (
    <ol className="text-sm leading-5 text-muted-foreground">
      {post.sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className="block rounded-sm py-2 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            {section.heading}
          </a>
        </li>
      ))}
    </ol>
  )

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

      <SiteHeader />

      <main id="main-content">
        <article>
          <header className="paper-column pt-7 sm:pt-10">
            <Link href="/blog" className="paper-link inline-flex min-h-10 items-center gap-2 text-sm">
              <ArrowLeft className="size-4" aria-hidden="true" /> All guides
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:mt-10">
              <span className="text-primary">{post.category}</span>
              <span>{post.readingMinutes} min read</span>
            </div>
            <h1 className="paper-title mt-3 max-w-[24ch] text-balance">{post.title}</h1>
            <p className="paper-lead mt-4 max-w-[62ch]">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs leading-6 text-muted-foreground sm:mt-7 sm:text-sm">
              <span>By <Link href="/about" className="paper-link">NerdsNote Editorial Team</Link></span>
              <span>Published <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time></span>
              <span>Updated <time dateTime={post.updatedAt}>{formatBlogDate(post.updatedAt)}</time></span>
            </div>
            {post.image && (
              <Image
                src={post.image.src}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                className="mt-6 h-auto w-full rounded-sm border border-border/70 sm:mt-8"
                sizes="(min-width: 960px) 900px, 94vw"
                priority
              />
            )}
          </header>

          <div className="paper-column grid min-w-0 gap-6 pt-7 pb-12 sm:pt-10 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-14">
            <aside className="min-w-0 lg:order-last lg:self-start lg:sticky lg:top-8">
              <details className="group border-y border-border lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-ring">
                  In this guide <ChevronDown className="size-4 text-primary group-open:rotate-180" aria-hidden="true" />
                </summary>
                <nav aria-label="Table of contents" className="pb-3">{contents}</nav>
              </details>
              <nav aria-label="Table of contents" className="scrollbar-theme hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-l border-border pl-5 lg:block">
                <h2 className="mb-2 text-sm font-medium">In this guide</h2>
                {contents}
              </nav>
            </aside>

            <div className="mx-auto w-full min-w-0 max-w-[44rem] lg:mx-0">
              <p className="font-serif text-[1.25rem] leading-[1.65] text-foreground sm:text-[1.4rem]">{post.intro}</p>
              <div className="mt-8 space-y-9 sm:mt-11 sm:space-y-12">
                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-7">
                    <h2 className="paper-heading text-pretty">{section.heading}</h2>
                    {section.template && (
                      <pre className="mt-4 max-w-full overflow-x-auto border-l-2 border-primary/50 bg-muted/40 px-4 py-3 font-mono text-sm leading-7 text-foreground sm:px-5">
                        <code>{section.template}</code>
                      </pre>
                    )}
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-4 font-serif text-[1.1rem] leading-[1.75] text-foreground sm:text-[1.18rem]">{paragraph}</p>
                    ))}
                    {section.bullets && (
                      <ul className="mt-4 list-disc space-y-2.5 pl-5 font-serif text-[1.1rem] leading-[1.75] text-foreground marker:text-primary sm:text-[1.18rem]">
                        {section.bullets.map((bullet) => <li key={bullet} className="pl-1">{bullet}</li>)}
                      </ul>
                    )}
                    {section.steps && (
                      <ol className="mt-4 list-decimal space-y-2.5 pl-6 font-serif text-[1.1rem] leading-[1.75] text-foreground marker:text-primary sm:text-[1.18rem]">
                        {section.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
                      </ol>
                    )}
                  </section>
                ))}
              </div>

              <aside className="mt-10 border-y border-border py-6 sm:mt-12">
                <h2 className="paper-heading">Try it in NerdsNote</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">Open the free browser notepad and start writing without creating an account.</p>
                <Link href="/notepad" prefetch={false} className="paper-link mt-2 inline-flex min-h-10 items-center gap-2 text-sm">
                  Open the notepad <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </aside>
              <section className="mt-8">
                <h2 className="font-serif text-2xl tracking-tight">Sources and further reading</h2>
                <ul className="mt-3 space-y-1 text-sm leading-6">
                  {post.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="paper-link inline-block py-1 underline decoration-primary/50 underline-offset-4 hover:decoration-primary [overflow-wrap:anywhere]">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </article>

        <section className="paper-column pb-14 sm:pb-20">
          <div className="border-t border-border pt-7 sm:pt-9">
            <h2 className="paper-heading">Related guides</h2>
            <ul className="mt-4 grid min-w-0 gap-6 sm:grid-cols-2 sm:gap-10">
              {relatedPosts.map((related) => (
                <li key={related.slug} className="min-w-0">
                  <p className="text-xs font-medium text-primary">{related.category}</p>
                  <h3 className="mt-1.5 font-serif text-[1.5rem] leading-tight tracking-tight">
                    <Link href={`/blog/${related.slug}`} className="underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">{related.title}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{related.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
