import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"


export const metadata: Metadata = {
  title: "NerdsNote — Free Online Notepad | Distraction‑Free, Private, Fast",
  description:
    "NerdsNote is a free online notepad for distraction‑free writing. No login, no ads. Auto‑save to your device, dark mode, import/export, search, and offline support.",
  generator: "v0.app",
  keywords:
    "free online notepad, distraction-free writing app, private notes, browser notepad, localStorage notes, no login notes, offline notepad, minimal note-taking app, developer notepad, quick notes",
  metadataBase: new URL("https://nerdsnote.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://nerdsnote.com",
    title: "NerdsNote — Free Online Notepad",
    description:
      "Free, distraction‑free online notepad. No login, no ads. Local auto‑save, dark mode, import/export, and search.",
    siteName: "NerdsNote",
    images: [
      {
        url: "apple-icon.png",
        width: 512,
        height: 512,
        alt: "NerdsNote",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NerdsNote — Free Online Notepad",
    description:
      "Free, distraction‑free online notepad. No login, no ads. Local auto‑save, dark mode, import/export, and search.",
    images: [
      "apple-icon.png",
    ],
  },
  icons: [
    {
      url: "/web-app-manifest-192x192.png",
      sizes: "192x192",
      type: "image/png",

    },
    {
      url: "/web-app-manifest-512x512.png",
      sizes: "512x512",
      type: "image/png",
    }
  ],
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "NerdsNote",
      "applicationCategory": "Productivity",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free online notepad for distraction-free note taking. Private, fast, and offline-capable.",
      "url": "https://nerdsnote.com",
      "image": "https://nerdsnote.com/apple-icon.png"
    })
  }
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
