// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Keep only supported compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // styledComponents: false, // optional
  },

images: {
  domains: [
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'backend-locate1.onrender.com',
    'images.unsplash.com', // add Unsplash here
  ],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 86400,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},

  // Ensure sitemaps/robots get correct headers and aren’t intercepted
  async headers() {
    return [
      {
        source: '/:path*.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=600' },
          { key: 'X-Robots-Tag', value: 'index, follow, max-image-preview:large' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=600' },
        ],
      },
      {
        source: '/Images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/location-from-location/:slug', destination: '/:slug', permanent: true },
      { source: '/location-from-me/:slug((?!locationfromme).*)', destination: '/:slug', permanent: true },
    ];
  },

  // No catch-all rewrite to /404 (it can swallow static files/HEAD requests)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: '/location-from-me', destination: '/location-from-me/locationfromme' },
        { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
        { source: '/how-far-is-:fromCountry-from-me', destination: '/location-from-me/:fromCountry-from-me' },
        { source: '/how-far-is-:fromCountry-from-:toCountry', destination: '/location-from-location/how-far-is-:fromCountry-from-:toCountry' },
        { source: '/how-far-is/:path*', destination: '/how-far-is/:path*' },
        { source: '/location-from-location/:slug', destination: '/location-from-location/:slug' },
        { source: '/location-to-location', destination: '/location-from-location/location-to-location' },
        { source: '/places-:radius-miles-from-:location', destination: '/find-places/places-:radius-miles-from-:location' },
{ source: '/how-to-get-to-:from-from-:to', destination: '/how-to-get-to/:from/:to' }
        // { source: '/how-to-get-to-eleuthera-from-nassau', destination: '/how-to-get-to/eleuthera-from-nassau' },

      ],
      fallback: [], // let Next handle real 404s
    };
  },

  // Keep your client bundle optimizations (safe)
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          default: false,
          vendors: false,
          leaflet: {
            name: 'leaflet',
            chunks: 'async',
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            priority: 40,
            enforce: true,
          },
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 50,
            enforce: true,
          },
          vendor: {
            name: 'vendor',
            chunks: 'async',
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
