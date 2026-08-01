export const siteUrl = "https://nerdsnote.com"
export const siteName = "NerdsNote"

// Shared social card (the generated /opengraph-image route, 1200×630).
// Referenced explicitly so per-page openGraph blocks don't drop it.
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "NerdsNote — a private online notepad for fast, focused writing",
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  email: "khueonstudios@gmail.com",
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/web-app-manifest-512x512.png`,
    width: 512,
    height: 512,
  },
  parentOrganization: {
    "@type": "Organization",
    name: "Khueon Studios",
    url: "https://khueonstudios.com",
  },
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  alternateName: "Nerds Note",
  url: siteUrl,
  description: "A free, private online notepad for local-first writing in the browser.",
  inLanguage: "en",
  publisher: { "@id": `${siteUrl}/#organization` },
}

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: siteName,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any operating system with a modern web browser",
  url: `${siteUrl}/notepad`,
  image: `${siteUrl}/apple-icon.png`,
  description:
    "Free, private online notepad with local auto-save, dark mode, search, import, export, and optional read-only sharing.",
  isAccessibleForFree: true,
  featureList: [
    "Local auto-save",
    "No account required",
    "Dark mode",
    "Search saved notes",
    "Import text and Markdown files",
    "Export plain-text notes",
    "Optional local folder sync",
    "Expiring read-only share links",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: { "@id": `${siteUrl}/#organization` },
  publisher: { "@id": `${siteUrl}/#organization` },
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
