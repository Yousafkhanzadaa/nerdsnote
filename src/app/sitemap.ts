import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://nerdsnote.com"
  return [
    {
      url: `${siteUrl}/`,
    },
    {
      url: `${siteUrl}/notepad`,
    },
    {
      url: `${siteUrl}/features`,
    },
    {
      url: `${siteUrl}/about`,
    },
    {
      url: `${siteUrl}/privacy`,
    },
    {
      url: `${siteUrl}/terms`,
    },
    {
      url: `${siteUrl}/contact`,
    },
  ]
}
