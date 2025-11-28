import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
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
    ],
  },
};

export default withNextIntl(nextConfig);
