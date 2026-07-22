import type { NextConfig } from "next";
import path from "path";

// Valeurs par défaut pour Supabase (utilisées si les variables d'environnement ne sont pas définies)
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const nextConfig: NextConfig = {
  // Évite que Next déduise une fausse racine workspace (ex. lockfile parent) → ENOENT sur les routes API au build.
  outputFileTracingRoot: path.resolve(process.cwd()),

  // Configuration pour la production
  // output: 'standalone', // Désactivé pour résoudre les problèmes de fichiers statiques
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
    // Limite body pour /api/whisper-upload/chunk (chunks 20MB) — défaut 10MB avec middleware
    middlewareClientMaxBodySize: '100mb',
  },
  
  // Définir explicitement les variables d'environnement avec des valeurs par défaut
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
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
  // Générer un buildId unique basé sur le timestamp pour éviter les conflits de cache
  generateBuildId: async () => {
    // BuildId stable pendant tout le build (évite chunks webpack corrompus)
    if (process.env.BUILD_ID) {
      return process.env.BUILD_ID;
    }
    return `build-${Date.now()}`;
  },
  
  transpilePackages: ['@supabase/supabase-js'],
  
  // Exclure les dossiers problématiques du build
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      // Pas de splitChunks personnalisé : le name: 'vendors' fixe peut provoquer
      // "Cannot read properties of undefined (reading 'call')" avec les imports dynamiques.
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NEXT_BUILD_ID': JSON.stringify(process.env.BUILD_ID || 'unknown'),
        })
      );
    }
    // Exclure hunyuan2-spz du traitement webpack
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/hunyuan2-spz/**', '**/.git/**'],
    };
    return config;
  },
  
  // Configuration pour résoudre l'avertissement cross-origin
  allowedDevOrigins: [
    'iahome.fr',
    'www.iahome.fr',
    '192.168.1.150',
    'localhost'
  ],
  
  // Configuration pour le domaine avec optimisations de cache
  async headers() {
    return [
      // Polices Next.js (Geist) : en-têtes pour éviter les erreurs de chargement
      {
        source: '/__nextjs_font/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'font/woff2',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/services',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
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
        source: '/marketing',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
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
          // CORS headers retirés - gérés par les routes API individuelles
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://iahome.fr https://*.iahome.fr; connect-src 'self' https://iahome.fr https://*.iahome.fr wss://iahome.fr wss://www.iahome.fr http://localhost:8003 http://localhost:7960 https://hunyuan3d.iahome.fr https://xemtoyzcihmncbrlsmhr.supabase.co https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io https://*.cloudflareaccess.com https://cloudflare.com https://*.cloudflare.com https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.doubleclick.net https://connect.facebook.net https://www.facebook.com https://*.facebook.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://iahome.fr https://*.iahome.fr https://iahome.fr/_next/static/ https://*.iahome.fr/_next/static/ https://iahome.fr/cdn-cgi/ https://*.cloudflare.com https://*.cloudflareaccess.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; img-src 'self' data: blob: https://iahome.fr https://*.iahome.fr https: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' data: https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; worker-src 'self' blob: https://iahome.fr https://*.iahome.fr; frame-src 'self' https: https://*.cloudflareaccess.com https://hunyuan3d.iahome.fr https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://youtube-nocookie.com; frame-ancestors 'self'; report-uri /api/csp-report;"
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self' https://iahome.fr https://*.iahome.fr; connect-src 'self' https://iahome.fr https://*.iahome.fr wss://iahome.fr wss://www.iahome.fr http://localhost:8003 http://localhost:7960 https://hunyuan3d.iahome.fr https://xemtoyzcihmncbrlsmhr.supabase.co https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io https://*.cloudflareaccess.com https://cloudflare.com https://*.cloudflare.com https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.doubleclick.net https://connect.facebook.net https://www.facebook.com https://*.facebook.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://iahome.fr https://*.iahome.fr https://iahome.fr/_next/static/ https://*.iahome.fr/_next/static/ https://iahome.fr/cdn-cgi/ https://*.cloudflare.com https://*.cloudflareaccess.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; img-src 'self' data: blob: https://iahome.fr https://*.iahome.fr https: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' data: https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; worker-src 'self' blob: https://iahome.fr https://*.iahome.fr; frame-src 'self' https: https://*.cloudflareaccess.com https://hunyuan3d.iahome.fr https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://youtube-nocookie.com; frame-ancestors 'self'; report-uri /api/csp-report;"
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
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
            value: 'text/css; charset=utf-8'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/_next/static/js/(.*)\\.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/js/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          }
        ]
      },
      {
        source: '/_next/static/chunks/default-(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
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
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
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
          // Pas d'en-têtes CORS ici - gérés par chaque route API individuellement
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
      },
      {
        // Exception pour /api/dynamic/qr - CORS géré par la route elle-même
        source: '/api/dynamic/qr',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
          // Pas d'en-têtes CORS ici - gérés par la route API
        ]
      }
    ];
  },
  
  // Configuration des domaines autorisés
  images: {
    formats: ['image/avif', 'image/webp'],
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
  
  async redirects() {
    return [
      { source: '/cancel', destination: '/payment-cancel', permanent: true },
      { source: '/pricing', destination: '/pricing2', permanent: true },
      // Anciennes URLs du sitemap (pages inexistantes) → pages légales réelles
      { source: '/mentions-legales', destination: '/terms', permanent: true },
      { source: '/politique-confidentialite', destination: '/privacy', permanent: true },
      { source: '/cgv', destination: '/terms', permanent: true },
      // Anciennes fiches « applications » (pas de routes imbriquées) → fiches /card
      { source: '/applications/whisper', destination: '/card/whisper', permanent: true },
      { source: '/applications/stable-diffusion', destination: '/card/stablediffusion', permanent: true },
      { source: '/applications/comfyui', destination: '/card/comfyui', permanent: true },
      // URLs courtes dupliquées → fiche produit canonique /card/{slug}
      { source: '/administration', destination: '/card/administration', permanent: true },
      { source: '/ai-detector', destination: '/card/ai-detector', permanent: true },
      { source: '/code-learning', destination: '/card/code-learning', permanent: true },
      { source: '/photobooth', destination: '/card/photobooth', permanent: true },
      { source: '/photo-vivante', destination: '/card/photo-vivante', permanent: true },
      { source: '/resas-system', destination: '/card/resas-system', permanent: true },
      { source: '/sentinelle-numerique', destination: '/card/sentinelle-numerique', permanent: true },
      { source: '/vote', destination: '/card/vote', permanent: true },
    ];
  },

  // Configuration pour optimiser le préchargement
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/fonts/:path*',
      },
      // Éviter 502 sur favicon / apple-touch-icon si les fichiers manquent
      { source: '/favicon.ico', destination: '/iahome-logo.svg' },
      { source: '/apple-touch-icon.png', destination: '/iahome-logo.svg' },
    ];
  },
};

export default nextConfig;

