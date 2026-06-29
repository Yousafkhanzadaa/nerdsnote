export const siteUrl = "https://nerdsnote.com"

// Shared social card (the generated /opengraph-image route, 1200×630).
// Referenced explicitly so per-page openGraph blocks don't drop it.
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "NerdsNote — a private online notepad for fast, focused writing",
}

type Crumb = { name: string; path: string }

// Builds BreadcrumbList JSON-LD for a page's position in the site hierarchy.
// Improves SERP appearance and is recommended for AI/answer-engine context.
export function breadcrumbJsonLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  }
}
