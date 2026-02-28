import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/middleware-manifest\.json$/], // Essential for Next.js 15
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        // Auth routes: NEVER cache, always go to network
        urlPattern: /\/api\/auth\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        // Static assets: serve from cache if available
        urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
        },
      },
      {
        // External images (UploadThing CDN, product images, logos)
        urlPattern: /^https:\/\/(?:utfs\.io|.*\.ufs\.sh|placehold\.co|api\.dicebear\.com)\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'external-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        // Catch-all: NetworkFirst for all other requests (pages, etc.)
        // No expiration plugin to avoid the _ref bug in sw.js
        urlPattern: /.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
        },
      },
    ],
  },
});


const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning if true,  This allows production builds to successfully complete even if
    // your project has ESLint errors. Remove this to enforce code quality.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning if true,  This allows production builds to successfully complete even if
    // your project has type errors.
    // Remove this to enforce type safety.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'static.cdnlogo.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'seeklogo.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.calidra.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'escalerascuprum.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.truper.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.stanley.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'assets.brandfolder.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'ix562c9hvv.ufs.sh',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default withNextIntl(withPWA(nextConfig) as NextConfig);
