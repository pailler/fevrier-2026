/**
 * Fonction utilitaire pour normaliser les URLs YouTube vers youtube-nocookie.com
 * Cela réduit les cookies tiers et améliore la confidentialité
 */

export interface YouTubeEmbedOptions {
  autoplay?: number;
  rel?: number;
  modestbranding?: number;
  enablejsapi?: number;
  origin?: string;
}

/**
 * Extrait l'ID vidéo d'une URL YouTube
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    // Si c'est déjà un ID simple
    if (!url.includes('http') && !url.includes('youtube') && !url.includes('youtu.be')) {
      return url;
    }

    const urlObj = new URL(url);
    
    // Format youtu.be/VIDEO_ID
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.substring(1).split('?')[0];
    }
    
    // Format youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com')) {
      // Format embed
      const embedMatch = url.match(/\/embed\/([^?&]+)/);
      if (embedMatch) return embedMatch[1];
      
      // Format watch
      return urlObj.searchParams.get('v') || null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Convertit une URL YouTube en URL embed youtube-nocookie.com
 */
export function normalizeYouTubeEmbedUrl(
  url: string, 
  options: YouTubeEmbedOptions = {}
): string {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    // Si on ne peut pas extraire l'ID, retourner l'URL telle quelle
    return url;
  }

  const {
    autoplay = 0,
    rel = 0,
    modestbranding = 1,
    enablejsapi = 0,
    origin
  } = options;

  const params = new URLSearchParams();
  params.set('autoplay', String(autoplay));
  params.set('rel', String(rel));
  params.set('modestbranding', String(modestbranding));
  params.set('enablejsapi', String(enablejsapi));
  
  if (origin) {
    params.set('origin', origin);
  }

  // Utiliser youtube-nocookie.com pour réduire les cookies
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
