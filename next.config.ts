import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Valeurs par défaut pour Supabase (utilisées si les variables d'environnement ne sont pas définies)
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const nextConfig: NextConfig = {
  // Configuration pour la production
  // output: 'standalone', // Désactivé pour résoudre les problèmes de fichiers statiques
  experimental: {
    // outputFileTracingRoot: undefined,
    optimizePackageImports: ['@supabase/supabase-js'],
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
    // Utiliser le timestamp pour un buildId unique, mais stable pendant le même build
    // Cela évite les problèmes de chunks webpack corrompus
    if (process.env.BUILD_ID) {
      return process.env.BUILD_ID;
    }
    // En production, utiliser un hash basé sur la date pour invalider le cache
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `build-${timestamp}-${random}`;
  },
  
  transpilePackages: ['@supabase/supabase-js'],
  
  // Exclure les dossiers problématiques du build
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Améliorer la gestion des chunks pour éviter les erreurs "can't access property call"
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Ajouter une gestion d'erreur pour les chunks manquants
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
            value: "default-src 'self' https://iahome.fr https://*.iahome.fr; connect-src 'self' https://iahome.fr https://*.iahome.fr http://localhost:8003 http://localhost:7960 https://hunyuan3d.iahome.fr https://xemtoyzcihmncbrlsmhr.supabase.co https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io https://*.cloudflareaccess.com https://cloudflare.com https://*.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://iahome.fr https://*.iahome.fr https://iahome.fr/_next/static/ https://*.iahome.fr/_next/static/ https://iahome.fr/cdn-cgi/ https://*.cloudflareaccess.com https://*.cloudflare.com; style-src 'self' 'unsafe-inline' https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; img-src 'self' data: https://iahome.fr https://*.iahome.fr https:; font-src 'self' data: https://iahome.fr https://*.iahome.fr https://*.cloudflareaccess.com https://*.cloudflare.com; worker-src 'self' blob: https://iahome.fr https://*.iahome.fr; frame-src 'self' https: https://*.cloudflareaccess.com https://hunyuan3d.iahome.fr; frame-ancestors 'self'; report-uri /api/csp-report;"
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
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'Content-Type',
            value: 'text/css'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
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
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
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
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        source: '/_next/static/chunks/(.*)',
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
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
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

export default withNextIntl(nextConfig);

