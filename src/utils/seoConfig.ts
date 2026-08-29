export const seoConfig = {
  site: {
    name: "IA Home",
    url: "https://iahome.fr",
    description: "Plateforme d'Intelligence Artificielle - Formation IA, Outils IA, Whisper, Stable Diffusion, ComfyUI",
    logo: "https://iahome.fr/logo.png",
    ogImage: "https://iahome.fr/og-image.jpg",
    twitterHandle: "@iahome_fr",
    language: "fr-FR",
    country: "FR",
  },
  
  keywords: {
    primary: [
      "intelligence artificielle",
      "IA",
      "formation IA",
      "apprentissage IA",
      "tutoriel IA",
      "outils IA",
      "plateforme IA",
      "cours IA",
      "formation intelligence artificielle",
      "développement IA",
      "machine learning",
      "deep learning",
      "IA française"
    ],
    secondary: [
      "Whisper",
      "Stable Diffusion",
      "ComfyUI",
      "OpenAI",
      "GPT",
      "DALL-E",
      "Midjourney",
      "automatisation",
      "productivité",
      "innovation",
      "technologie",
      "digital",
      "transformation numérique"
    ]
  },
  
  pages: {
    home: {
      title: "IAHome — Ecosystème d'outils essentiels, toutes plateformes, sans install",
      description:
        "Ecosystème d'outils essentiels, toutes plateformes, sans install : Whisper, Stable Diffusion, PDF+IA, Home Assistant, QR codes. Interface en français, crédits transparents.",
      keywords: [
        "écosystème IA France",
        "outils IA en ligne",
        "transcription IA",
        "génération images IA",
        "PDF IA",
        "Home Assistant",
        "IA française",
        "RGPD",
      ],
      priority: 1.0,
      changefreq: "daily"
    },
    services: {
      title: "Services IA Home - Tous nos Outils et Applications IA",
      description: "Découvrez tous nos services et sous-domaines IA Home : Whisper pour la transcription, Stable Diffusion pour les images, outils de productivité, QR codes dynamiques modifiables et bien plus. Plateforme complète d'intelligence artificielle.",
      keywords: ["services iahome", "outils ia", "applications ia", "sous-domaines iahome", "whisper.iahome.fr", "librespeed.iahome.fr", "qrcodes.iahome.fr", "metube.iahome.fr", "pdf.iahome.fr"],
      priority: 0.9,
      changefreq: "weekly"
    },
    applications: {
      title: "Applications IA et services — tout-en-un | IAHome",
      description:
        "Whisper, images IA, PDF, domotique, QR codes et plus : une plateforme française, un compte, des crédits pour ouvrir les services.",
      keywords: [
        "applications IA",
        "plateforme IA France",
        "Whisper",
        "Stable Diffusion",
        "ComfyUI",
        "transcription",
        "génération d'images",
        "accès applications crédits",
      ],
      priority: 0.9,
      changefreq: "weekly"
    },
    formation: {
      title: "Formation Intelligence Artificielle | Cours IA - IA Home",
      description: "Formations complètes en intelligence artificielle : débutant, intermédiaire, avancé. Apprenez l'IA avec nos cours pratiques, tutoriels et projets concrets.",
      keywords: ["formation IA", "cours IA", "apprentissage IA", "tutoriel IA", "projet IA", "formation intelligence artificielle"],
      priority: 0.9,
      changefreq: "weekly"
    },
    blog: {
      title: "Blog IA | Actualités Intelligence Artificielle - IA Home",
      description: "Restez informé des dernières tendances IA avec nos articles, analyses d'experts et tutoriels pratiques. Actualités, guides et conseils en intelligence artificielle.",
      keywords: ["blog IA", "actualités IA", "tendances IA", "analyse IA", "expert IA", "conseils IA"],
      priority: 0.8,
      changefreq: "daily"
    },
    community: {
      title: "Communauté IA | Forum Intelligence Artificielle - IA Home",
      description: "Rejoignez notre communauté d'experts et d'enthousiastes de l'IA. Échangez, apprenez et collaborez avec d'autres passionnés d'intelligence artificielle.",
      keywords: ["communauté IA", "forum IA", "discussion IA", "collaboration IA", "réseau IA", "partage IA"],
      priority: 0.7,
      changefreq: "weekly"
    }
  },
  
  social: {
    twitter: "https://twitter.com/iahome_fr",
    linkedin: "https://linkedin.com/company/iahome",
    github: "https://github.com/iahome",
    youtube: "https://youtube.com/@iahome",
    discord: "https://discord.gg/iahome"
  },
  
  contact: {
    email: "contact@iahome.fr",
  },
  
  analytics: {
    googleAnalytics: "GA_MEASUREMENT_ID",
    googleTagManager: "GTM-XXXXXXX",
    facebookPixel: "FB_PIXEL_ID"
  },
  
  performance: {
    imageQuality: 85,
    imageSizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    preloadCritical: [
      "/og-image.jpg"
    ],
    lazyLoadImages: true,
    preconnectDomains: [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://images.unsplash.com"
    ]
  }
};

type PageMetadataOverrides = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
};

export const generatePageMetadata = (page: keyof typeof seoConfig.pages, customData?: PageMetadataOverrides) => {
  const pageConfig = seoConfig.pages[page];
  const siteConfig = seoConfig.site;
  
  return {
    title: customData?.title || pageConfig.title,
    description: customData?.description || pageConfig.description,
    keywords: customData?.keywords || [...pageConfig.keywords, ...seoConfig.keywords.primary],
    openGraph: {
      title: customData?.title || pageConfig.title,
      description: customData?.description || pageConfig.description,
      url: `${siteConfig.url}/${page}`,
      siteName: siteConfig.name,
      images: [
        {
          url: customData?.ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: customData?.title || pageConfig.title,
        },
      ],
      locale: siteConfig.language,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title: customData?.title || pageConfig.title,
      description: customData?.description || pageConfig.description,
      images: [customData?.ogImage || siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
};

