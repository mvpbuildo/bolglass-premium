// @ts-nocheck
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // @ts-expect-error - serverActions is a valid top-level property in Next.js 15+ but types might be outdated
  serverActions: {
    bodySizeLimit: '100mb',
  },
  experimental: {
    // Renamed from middlewareClientMaxBodySize
    proxyClientMaxBodySize: '100mb',
  }
};

export default withNextIntl(nextConfig);
