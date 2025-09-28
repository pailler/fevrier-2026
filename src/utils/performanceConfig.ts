export const performanceConfig = {
  // Configuration des images
  images: {
    quality: 85,
    formats: ['image/webp', 'image/avif', 'image/jpeg'],
    sizes: {
      mobile: '(max-width: 768px) 100vw',
      tablet: '(max-width: 1200px) 50vw',
      desktop: '33vw'
    },
    lazyLoading: true,
    placeholder: 'blur'
  },

  // Configuration des polices
  fonts: {
    display: 'swap',
    preload: [
    ],
    fallbacks: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif'
    ]
  },

  // Configuration des scripts
  scripts: {
    defer: true,
    async: true,
    nonBlocking: true,
    critical: [
      'https://iahome.fr/scripts/critical.js'
    ],
    nonCritical: [
      'https://iahome.fr/scripts/analytics.js',
      'https://iahome.fr/scripts/chat.js'
    ]
  },

  // Configuration du cache
  cache: {
    static: {
      maxAge: 31536000, // 1 an
      immutable: true
    },
    dynamic: {
      maxAge: 3600, // 1 heure
      staleWhileRevalidate: 86400 // 1 jour
    },
    api: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 3600 // 1 heure
    }
  },

  // Configuration des ressources critiques
  critical: {
    css: [
      '/styles/critical.css'
    ],
    js: [
      '/scripts/critical.js'
    ],
    fonts: [
    ],
    images: [
      '/og-image.jpg',
      '/logo.png'
    ]
  },

  // Configuration des préchargements
  preload: {
    fonts: [
    ],
    images: [
      {
        href: '/og-image.jpg',
        as: 'image'
      }
    ],
    scripts: [
      {
        href: '/scripts/critical.js',
        as: 'script'
      }
    ]
  },

  // Configuration des domaines externes
  external: {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://www.google-analytics.com'
    ],
    dnsPrefetch: [
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ]
  },

  // Configuration des Core Web Vitals
  webVitals: {
    thresholds: {
      LCP: 2500, // 2.5s
      FID: 100,  // 100ms
      CLS: 0.1,  // 0.1
      FCP: 1800, // 1.8s
      TTI: 3800  // 3.8s
    },
    reporting: {
      enabled: true,
      endpoint: '/api/web-vitals',
      sampleRate: 1.0
    }
  },

  // Configuration des optimisations
  optimizations: {
    minification: true,
    compression: true,
    treeShaking: true,
    codeSplitting: true,
    bundleAnalysis: true
  }
};

export const getImageConfig = (width: number, height: number, priority = false) => ({
  width,
  height,
  quality: performanceConfig.images.quality,
  priority,
  placeholder: performanceConfig.images.placeholder,
  sizes: Object.values(performanceConfig.images.sizes).join(', '),
  loading: priority ? 'eager' : 'lazy'
});

export const getFontConfig = (fontFamily: string) => ({
  fontFamily,
  display: performanceConfig.fonts.display,
  preload: performanceConfig.fonts.preload.includes(`/fonts/${fontFamily}.woff2`),
  fallback: performanceConfig.fonts.fallbacks
});

export const getScriptConfig = (src: string, isCritical = false) => ({
  src,
  defer: !isCritical,
  async: !isCritical,
  nonBlocking: !isCritical
});






