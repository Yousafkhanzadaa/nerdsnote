import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
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
    title: "NerdsNote — Free Online Notepad",
    description:
        "Write and save private notes in your browser with NerdsNote. No account required. Add images and charts, download a copy, or share one note by link.",
    metadataBase: new URL(siteUrl),
    category: "productivity",
    creator: "Khueon Studios",
    publisher: "Khueon Studios",
    manifest: "/manifest.webmanifest",
    openGraph: {
        type: "website",
        url: siteUrl,
        title: "NerdsNote — Free Online Notepad",
        description:
            "Write private notes with local autosave, images, charts, and optional read-only sharing.",
        siteName: "NerdsNote",
        images: [ogImage],
    },
    twitter: {
        card: "summary_large_image",
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
        "max-image-preview": "large",
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
        { media: "(prefers-color-scheme: light)", color: "#f7f5ed" },
        { media: "(prefers-color-scheme: dark)", color: "#1e221d" },
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
            </body>
        </html>
    )
}
