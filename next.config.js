/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Serve next-gen image formats (smaller payloads → better LCP).
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
