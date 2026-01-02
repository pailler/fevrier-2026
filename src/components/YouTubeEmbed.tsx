'use client';

import { useState, useEffect, useRef } from 'react';
import { normalizeYouTubeEmbedUrl, extractYouTubeVideoId } from '../utils/youtubeUtils';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  rel?: number;
  modestbranding?: number;
  enablejsapi?: number;
  origin?: string;
  onError?: (error: string) => void;
}

export default function YouTubeEmbed({
  videoId,
  title = 'Vidéo YouTube',
  className = '',
  autoplay = false,
  rel = 0,
  modestbranding = 1,
  enablejsapi = 0,
  origin = 'https://iahome.fr',
  onError
}: YouTubeEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Extraire l'ID vidéo
  useEffect(() => {
    let actualVideoId = videoId;
    if (videoId.includes('http') || videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
      const extracted = extractYouTubeVideoId(videoId);
      if (extracted) {
        actualVideoId = extracted;
      }
    }
    
    // Générer l'URL embed avec youtube-nocookie.com
    const url = normalizeYouTubeEmbedUrl(
      `https://www.youtube.com/watch?v=${actualVideoId}`,
      { 
        autoplay: autoplay ? 1 : 0, 
        rel: rel || 0, 
        modestbranding: modestbranding || 1, 
        enablejsapi: enablejsapi || 0, 
        origin: origin 
      }
    );
    
    console.log('🎥 YouTubeEmbed - Video ID:', actualVideoId, 'URL générée:', url);
    setEmbedUrl(url);
  }, [videoId, autoplay, rel, modestbranding, enablejsapi, origin]);

  // Charger l'iframe de manière dynamique après le chargement de la page
  useEffect(() => {
    // Attendre que la page soit complètement chargée
    const loadIframe = () => {
      // Attendre un peu plus pour éviter les problèmes COEP
      setTimeout(() => {
        setShouldLoad(true);
        setIsLoading(false);
      }, 500);
    };

    if (document.readyState === 'complete') {
      loadIframe();
    } else {
      window.addEventListener('load', loadIframe);
      return () => window.removeEventListener('load', loadIframe);
    }
  }, []);

  // Intersection Observer pour charger seulement quand visible
  useEffect(() => {
    if (!containerRef.current || !shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && iframeRef.current && !iframeRef.current.src) {
            // Charger l'iframe seulement quand elle est visible
            console.log('👁️ YouTubeEmbed - Vidéo visible, chargement de l\'iframe...');
            iframeRef.current.src = embedUrl;
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad, embedUrl]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
    console.log('✅ YouTubeEmbed - Iframe chargé avec succès');
  };

  const handleError = () => {
    retryCountRef.current += 1;
    
    console.warn(`⚠️ YouTubeEmbed - Erreur de chargement (tentative ${retryCountRef.current}/${maxRetries})`);
    
    if (retryCountRef.current < maxRetries && iframeRef.current) {
      // Essayer avec youtube.com au lieu de youtube-nocookie.com
      const fallbackUrl = embedUrl.replace('youtube-nocookie.com', 'youtube.com');
      console.log('🔄 YouTubeEmbed - Fallback vers youtube.com:', fallbackUrl);
      
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = fallbackUrl;
        }
      }, 1000 * retryCountRef.current);
    } else {
      const errorMsg = 'Impossible de charger la vidéo YouTube';
      setError(errorMsg);
      setIsLoading(false);
      console.error('❌ YouTubeEmbed - Échec après', maxRetries, 'tentatives');
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  // Si erreur après tous les essais
  if (error) {
    return (
      <div className={`w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Vidéo non disponible</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Voir sur YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 relative ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la vidéo...</p>
          </div>
        </div>
      )}
      {shouldLoad && (
        <iframe
          ref={iframeRef}
          className="w-full h-full rounded-2xl"
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}
