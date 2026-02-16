import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '50mb',
  },
  experimental: {
    middlewareClientMaxBodySize: '50mb',
  },
};

export default withNextIntl(nextConfig);
