import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour la production
  // output: 'standalone', // Désactivé pour résoudre les problèmes de fichiers statiques
  experimental: {
    // outputFileTracingRoot: undefined,
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  
  // Configuration pour les gros uploads
  serverRuntimeConfig: {
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
  
  // Configuration des polices optimisée
  // optimizeFonts: false, // Option non reconnue dans Next.js 15
  
  // Désactiver les preloads de ressources
  compiler: {
    removeConsole: false,
  },
  
  // Configuration pour améliorer la stabilité
  reactStrictMode: true,
  
  // Configuration pour gérer les erreurs
  onDemandEntries: {
    // période d'inactivité avant de fermer les pages (en ms)
    maxInactiveAge: 25 * 1000,
    // nombre de pages à garder simultanément
    pagesBufferLength: 2,
  },
  
  // Désactiver ESLint temporairement pour le déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuration pour les assets statiques
  generateBuildId: async () => {
    return 'production-build';
  },
  
  transpilePackages: ['@supabase/supabase-js'],
  
  // Configuration pour résoudre l'avertissement cross-origin
  allowedDevOrigins: [
    'iahome.fr',
    'www.iahome.fr',
    '192.168.1.150',
    'localhost'
  ],
  
  // Configuration pour le domaine
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://xemtoyzcihmncbrlsmhr.supabase.co https://*.supabase.co https://*.supabase.io; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src 'self' https:;"
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'text/css'
          }
        ]
      },
      {
        source: '/_next/static/js/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'application/javascript'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/api/librespeed-token',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      },
      {
        source: '/api/whisper-upload/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      }
    ];
  },
  
  // Configuration des domaines autorisés
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iahome.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.iahome.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.150',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Configuration pour optimiser le préchargement
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/fonts/:path*',
      },
    ];
  },
};

export default nextConfig;

