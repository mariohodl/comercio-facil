import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
    ],
    dangerouslyAllowSVG: true,
  },
};

export default withNextIntl(nextConfig);
