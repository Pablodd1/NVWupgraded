/**
 * Performance Optimization Configuration
 * Napa Valley Wineries Platform
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ========================================
  // OUTPUT CONFIGURATION
  // ========================================
  output: 'standalone',

  // ========================================
  // PERFORMANCE OPTIMIZATIONS
  // ========================================

  // Compress responses
  compress: true,

  // Optimize images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // ImgBB CDN – used by /api/upload for winery photos
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: '**.imgbb.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ========================================
  // EXTERNAL PACKAGES
  // ========================================
  serverExternalPackages: ['mongoose', 'nodemailer', 'twilio'],

  // ========================================
  // EXPERIMENTAL FEATURES
  // ========================================
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      '@heroicons/react',
      '@headlessui/react',
      'react-icons',
      'framer-motion',
    ],

    // Server actions for better performance
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ========================================
  // WEBPACK CONFIGURATION
  // ========================================
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // ========================================
  // HEADERS FOR CACHING & SECURITY
  // ========================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ========================================
  // REDIRECTS
  // ========================================
  async redirects() {
    return [
      // Redirect www to non-www (or vice versa)
      // {
      //   source: '/:path*',
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'www.yourdomain.com',
      //     },
      //   ],
      //   destination: 'https://yourdomain.com/:path*',
      //   permanent: true,
      // },
    ];
  },

  // ========================================
  // REWRITES (for API proxying if needed)
  // ========================================
  async rewrites() {
    return [
      // Example: Proxy external API to avoid CORS
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // ========================================
  // ENVIRONMENT VARIABLES
  // ========================================
  env: {
    NEXT_PUBLIC_APP_NAME: 'Napa Valley Wineries',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // ========================================
  // TYPESCRIPT
  // ========================================
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. NOT RECOMMENDED for production!
    ignoreBuildErrors: false,
  },

  // ========================================
  // ESLINT
  // ========================================
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src', 'app', 'components', 'lib', 'utils'],
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors. NOT RECOMMENDED!
    ignoreDuringBuilds: true,
  },

  // ========================================
  // POWEREDBYHEADER
  // ========================================
  poweredByHeader: false, // Remove X-Powered-By header for security

  // ========================================
  // REACTSTRICTMODE
  // ========================================
  reactStrictMode: true,
};

export default nextConfig;
