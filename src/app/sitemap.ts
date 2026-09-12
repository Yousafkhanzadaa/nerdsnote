import type { MetadataRoute } from "next"
import { blogPosts } from "@/lib/blog-posts"
import { siteUrl } from "@/lib/structured-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const evergreenPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: "2026-09-12",
    },
    {
      url: `${siteUrl}/notepad`,
      lastModified: "2026-08-01",
    },
    {
      url: `${siteUrl}/features`,
      lastModified: "2026-08-01",
    },
    {
      url: `${siteUrl}/about`,
      lastModified: "2026-08-01",
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: "2026-09-12",
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: "2026-08-01",
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: "2026-08-01",
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: "2026-08-01",
    },
  ]

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }))

  return [...evergreenPages, ...blogPages]
}
