interface OGImageConfig {
  title: string;
  description?: string;
  logo?: string;
  background?: string;
  width?: number;
  height?: number;
}

export const generateOGImageUrl = (config: OGImageConfig): string => {
  const {
    title,
    description = "Plateforme d'Intelligence Artificielle",
    logo = "https://iahome.fr/logo.png",
    background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width = 1200,
    height = 630
  } = config;

  const params = new URLSearchParams({
    title: title.substring(0, 100), // Limiter la longueur
    description: description.substring(0, 200),
    logo,
    background,
    width: width.toString(),
    height: height.toString(),
  });

  // Utiliser un service comme Vercel OG Image ou créer vos propres images
  return `https://iahome.fr/api/og?${params.toString()}`;
};

export const generateSocialImages = (title: string, description?: string) => {
  return {
    og: generateOGImageUrl({ title, description }),
    twitter: generateOGImageUrl({ 
      title, 
      description,
      width: 1200,
      height: 630
    }),
    square: generateOGImageUrl({ 
      title, 
      description,
      width: 1200,
      height: 1200
    }),
  };
};

// Configuration des images par défaut
export const defaultOGImages = {
  home: {
    title: "IA Home - Plateforme d'Intelligence Artificielle",
    description: "Formation IA, Outils IA, Whisper, Stable Diffusion, ComfyUI",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  applications: {
    title: "Applications IA - Outils Intelligence Artificielle",
    description: "Whisper, Stable Diffusion, ComfyUI et plus",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  formation: {
    title: "Formation Intelligence Artificielle",
    description: "Cours IA pour tous les niveaux",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  blog: {
    title: "Blog IA - Actualités Intelligence Artificielle",
    description: "Articles, tutoriels et analyses d'experts",
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  }
};






