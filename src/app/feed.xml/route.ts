import { blogPosts } from "@/lib/blog-posts"
import { siteUrl } from "@/lib/structured-data"

export const dynamic = "force-static"

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function GET() {
  const items = blogPosts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`
      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${escapeXml(post.excerpt)}</description>
          <category>${escapeXml(post.category)}</category>
          <pubDate>${new Date(`${post.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>
        </item>`
    })
    .join("")

  const latestPost = [...blogPosts].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )[0]

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>NerdsNote Guides</title>
        <link>${siteUrl}/blog</link>
        <description>Practical guides to private browser notes, local storage, backups, and better writing workflows.</description>
        <language>en</language>
        <lastBuildDate>${new Date(`${latestPost.updatedAt}T00:00:00Z`).toUTCString()}</lastBuildDate>
        <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
        ${items}
      </channel>
    </rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
