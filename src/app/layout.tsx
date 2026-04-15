import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const siteUrl = "https://nerdsnote.com"
const siteName = "NerdsNote"
const organization = {
    "@type": "Organization",
    "name": "Khueon Studios",
    "url": "https://www.khueonstudios.com",
    "email": "khueonstudios@gmail.com",
}

const structuredData = [
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "name": siteName,
        "url": siteUrl,
        "description": "A free, private online notepad for local-first writing in the browser.",
        "inLanguage": "en",
        "publisher": organization,
    },
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        "name": siteName,
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web Browser",
        "url": siteUrl,
        "image": `${siteUrl}/apple-icon.png`,
        "description": "Free, private, distraction-free online notepad with local auto-save, offline access, dark mode, search, import, and export.",
        "isAccessibleForFree": true,
        "featureList": [
            "Local auto-save",
            "Offline support",
            "Dark mode",
            "Search",
            "Import text files",
            "Export notes",
            "Optional local folder sync"
        ],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": organization,
        "publisher": organization,
    },
]

export const metadata: Metadata = {
    applicationName: siteName,
    title: "NerdsNote — Free Online Notepad | Distraction‑Free, Private, Fast",
    description:
        "NerdsNote is a free online notepad for distraction‑free writing. No login, no ads. Auto‑save to your device, dark mode, import/export, search, and offline support.",
    keywords: [
        "free online notepad",
        "distraction-free writing app",
        "private notes",
        "browser notepad",
        "localStorage notes",
        "no login notes",
        "offline notepad",
        "minimal note-taking app",
        "developer notepad",
        "quick notes",
    ],
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
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
        images: [
            {
                url: "/apple-icon.png",
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
            "/apple-icon.png",
        ],
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
    appleWebApp: {
        title: siteName,
        capable: true,
        statusBarStyle: "default",
    },
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
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="alternate" hrefLang="en" href={`${siteUrl}/`} />
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
                <Suspense fallback={null}>{children}</Suspense>
                <Analytics />
            </body>
        </html>
    )
}
