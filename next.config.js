/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  // Serve next-gen image formats (smaller payloads → better LCP).
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com",
      "font-src 'self' data:",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
