import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour la production avec Docker
  output: 'standalone', // Activé pour Docker
  experimental: {
    // outputFileTracingRoot: undefined, // Supprimé car obsolète
  },
  
  // Désactiver ESLint temporairement pour le déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuration pour les assets statiques - Désactivé pour le développement local
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://iahome.fr' : '',
  
  // Configuration pour le cache des assets - ID stable pour éviter les problèmes de préchargement
  generateBuildId: async () => {
    return 'production-build';
  },
  
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configuration pour résoudre l'avertissement cross-origin
  allowedDevOrigins: [
    'iahome.fr',
    'www.iahome.fr',
    'home.regispailler.fr',
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
          // Autoriser CORS pour l'IP locale et le domaine custom
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000'
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
          // Headers pour les assets statiques - Cache optimisé
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
          }
        ]
      },
      // Headers spécifiques pour l'API librespeed-token
      {
        source: '/api/librespeed-token',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000'
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
      // Headers spécifiques pour les assets statiques - Optimisé pour éviter les warnings de préchargement
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      // Headers pour les CSS spécifiquement
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8'
          }
        ]
      }
    ];
  },
  
  // Configuration des domaines autorisés avec remotePatterns
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
        protocol: 'https',
        hostname: 'home.regispailler.fr',
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
};

export default nextConfig;