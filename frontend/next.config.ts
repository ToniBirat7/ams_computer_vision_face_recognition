import type { NextConfig } from 'next'

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/django/:path*',
          destination: `${DJANGO_URL}/:path*`,
        },
        {
          source: '/media/:path*',
          destination: `${DJANGO_URL}/media/:path*`,
        },
      ],
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'django',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/media/**',
      },
    ],
  },
}

export default nextConfig
