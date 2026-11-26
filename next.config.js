/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Content-Security-Policy", value: "img-src 'self' data: blob:" },
        ],
      },
      {
        source: "/s/:slug",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet" },
        ],
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  // Serve next-gen image formats (smaller payloads → better LCP).
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
