import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NerdsNote - Free Online Notepad",
    short_name: "NerdsNote",
    description:
      "A free online notebook with local autosave, dark mode, images, charts, and optional sharing.",
    start_url: "/notepad",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5ed",
    theme_color: "#f7f5ed",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
