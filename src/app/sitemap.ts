import type { MetadataRoute } from "next"
import { blogPosts } from "@/lib/blog-posts"
import { siteUrl } from "@/lib/structured-data"

export default function sitemap(): MetadataRoute.Sitemap {
  // Only the guides track editorial revision dates. Undated entries are valid in a sitemap.
  const pages = ["/", "/notepad", "/features", "/about", "/privacy", "/terms", "/contact"]
  const guideDates = blogPosts.map((post) => post.updatedAt).sort()
  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}` })),
    { url: `${siteUrl}/blog`, lastModified: guideDates.at(-1) },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      images: post.image ? [`${siteUrl}${post.image.src}`] : undefined,
    })),
  ]
}
