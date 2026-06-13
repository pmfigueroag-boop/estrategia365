/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloud Run: standalone output creates a self-contained server.js
  // with minimal node_modules — critical for small container images
  output: "standalone",

  // NEXT_PUBLIC_* vars are baked into the JS bundle at BUILD TIME
  // Set via docker build --build-arg NEXT_PUBLIC_API_URL=https://...
  // or via Cloud Run --build-env in the CD pipeline
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    productionBrowserSourceMaps: false,
    compress: true,
    poweredByHeader: false,
  }),
};

export default nextConfig;
