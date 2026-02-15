// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  turbopack: {},

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ===============================
  // IMAGES
  // ===============================
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdnjs.cloudflare.com" },
      { protocol: "https", hostname: "unpkg.com" },
      { protocol: "https", hostname: "backend-locate1.onrender.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ===============================
  // HEADERS
  // ===============================
  async headers() {
    return [
      {
        source: "/:path*.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
          { key: "X-Robots-Tag", value: "index, follow, max-image-preview:large" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/Images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ===============================
  // WEBPACK OPTIMIZATION
  // ===============================
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          default: false,
          vendors: false,
          leaflet: {
            name: "leaflet",
            chunks: "async",
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            priority: 40,
            enforce: true,
          },
          react: {
            name: "react",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 50,
            enforce: true,
          },
          vendor: {
            name: "vendor",
            chunks: "async",
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            maxAsyncRequests: 5,
          },
        },
      };
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
};

export default nextConfig;
