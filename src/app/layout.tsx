import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
    ogImage,
    organizationJsonLd,
    siteName,
    siteUrl,
    websiteJsonLd,
} from "@/lib/structured-data"
import "./globals.css"

const structuredData = [organizationJsonLd, websiteJsonLd]

export const metadata: Metadata = {
    applicationName: siteName,
    title: "NerdsNote — Free Online Notepad | Distraction‑Free, Private, Fast",
    description:
        "NerdsNote is a free online notepad for distraction‑free writing. No login, no ads. Auto‑save to your device, dark mode, import/export, search, and offline support.",
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
        types: {
            "application/rss+xml": "/feed.xml",
        },
    },
    category: "productivity",
    creator: "Khueon Studios",
    publisher: "Khueon Studios",
    manifest: "/manifest.webmanifest",
    openGraph: {
        type: "website",
        url: siteUrl,
        title: "NerdsNote — Free Online Notepad",
        description:
            "Free, distraction‑free online notepad. No login, no ads. Local auto‑save, dark mode, import/export, and search.",
        siteName: "NerdsNote",
        images: [ogImage],
    },
    twitter: {
        card: "summary_large_image",
        title: "NerdsNote — Free Online Notepad",
        description:
            "Free, distraction‑free online notepad. No login, no ads. Local auto‑save, dark mode, import/export, and search.",
        images: [ogImage.url],
    },
    icons: {
        icon: [
            {
                url: "/favicon.ico",
            },
            {
                url: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                url: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/apple-icon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    appleWebApp: {
        title: siteName,
        capable: true,
        statusBarStyle: "default",
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nerds-note-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
                    }}
                />
            </head>
            <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
