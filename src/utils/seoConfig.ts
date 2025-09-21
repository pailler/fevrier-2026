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
      title: "IA Home - Plateforme d'Intelligence Artificielle | Formation IA & Outils IA",
      description: "Découvrez l'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l'intelligence artificielle à votre rythme avec nos modules pratiques et nos cours adaptés à tous les niveaux.",
      keywords: ["intelligence artificielle", "formation IA", "outils IA", "Whisper", "Stable Diffusion", "ComfyUI"],
      priority: 1.0,
      changefreq: "daily"
    },
    applications: {
      title: "Applications IA | Outils Intelligence Artificielle - IA Home",
      description: "Explorez nos applications d'intelligence artificielle : Whisper pour la transcription, Stable Diffusion pour l'image, ComfyUI pour l'automatisation. Des outils IA professionnels à votre portée.",
      keywords: ["applications IA", "outils IA", "Whisper", "Stable Diffusion", "ComfyUI", "transcription", "génération d'images"],
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
    phone: "+33 1 23 45 67 89",
    address: {
      street: "123 Rue de l'IA",
      city: "Paris",
      postalCode: "75001",
      country: "France"
    }
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
      "/fonts/geist-sans.woff2",
      "/fonts/geist-mono.woff2",
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

export const generatePageMetadata = (page: keyof typeof seoConfig.pages, customData?: any) => {
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






