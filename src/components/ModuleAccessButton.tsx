'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useTokenContext } from '../contexts/TokenContext';

interface ModuleAccessButtonProps {
  moduleId: string;
  moduleName: string;
  moduleCost: number;
  moduleDescription?: string;
  accessUrl?: string;
  className?: string;
  onAccessSuccess?: () => void;
  onAccessError?: (error: string) => void;
}

export default function ModuleAccessButton({
  moduleId,
  moduleName,
  moduleCost,
  accessUrl,
  className = '',
  onAccessSuccess,
  onAccessError
}: ModuleAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useCustomAuth();
  const { tokens, refreshTokens } = useTokenContext();
  const router = useRouter();

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    const normalizedModuleId = (moduleId || '').trim().toLowerCase();
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const urlMap: Record<string, string> = isDevelopment
      ? {
          'photomaker': 'http://localhost:7881',
          'birefnet': 'http://localhost:7882',
          'animagine-xl': 'http://localhost:7883',
          'florence-2': 'http://localhost:7884',
          'home-assistant': 'http://localhost:8123',
          'hunyuan3d': 'http://localhost:8888',
          'stablediffusion': 'http://localhost:7880',
          'meeting-reports': 'http://localhost:3050',
          'whisper': 'http://localhost:8093',
          'ruinedfooocus': 'http://localhost:7870',
          'comfyui': 'http://localhost:8188',
          'photobooth': 'http://localhost:7885',
        }
      : {
          'photomaker': 'https://photomaker.iahome.fr',
          'birefnet': 'https://birefnet.iahome.fr',
          'animagine-xl': 'https://animaginexl.iahome.fr',
          'florence-2': 'https://florence2.iahome.fr',
          'home-assistant': 'https://homeassistant.iahome.fr',
          'hunyuan3d': 'https://hunyuan3d.iahome.fr',
          'stablediffusion': 'https://stablediffusion.iahome.fr',
          'meeting-reports': 'https://meeting-reports.iahome.fr',
          'whisper': 'https://whisper.iahome.fr',
          'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
          'comfyui': 'https://comfyui.iahome.fr',
          'photobooth': 'https://photobooth.iahome.fr',
        };

    if (urlMap[normalizedModuleId]) {
      return urlMap[normalizedModuleId];
    }

    const subdomainAliases: Record<string, string> = {
      'animagine-xl': 'animaginexl',
      'florence-2': 'florence2',
      'home-assistant': 'homeassistant',
    };

    const computedSubdomain = subdomainAliases[normalizedModuleId] || normalizedModuleId;
    return computedSubdomain ? `https://${computedSubdomain}.iahome.fr` : '';
  };

  const handleAccess = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) {
      setError('Utilisateur non trouvé');
      return;
    }

    if (tokens === null || tokens < moduleCost) {
      setError(`Tokens insuffisants. Requis: ${moduleCost}, Disponible: ${tokens || 0}`);
      onAccessError?.(`Tokens insuffisants: ${tokens || 0}/${moduleCost}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const token = data?.token;
      if (!token) {
        throw new Error('Token d\'accès manquant');
      }

      const targetUrl = resolveModuleUrl();
      if (targetUrl) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        window.open(`${targetUrl}${separator}token=${encodeURIComponent(token)}`, '_blank');
      } else {
        throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
      }
      
      try {
        await refreshTokens();
      } catch {
        // Non bloquant
      }
      
      onAccessSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`❌ Erreur accès module ${moduleName}:`, errorMessage);
      setError(errorMessage);
      onAccessError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={handleAccess}
        disabled={isLoading || !isAuthenticated || (tokens !== null && tokens < moduleCost)}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isLoading || !isAuthenticated || (tokens !== null && tokens < moduleCost)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🔓</span>
            <span>Accéder à {moduleName} ({moduleCost} tokens)</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {!isAuthenticated && (
        <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm underline">
          Connectez-vous pour accéder
        </Link>
      )}
      
      {isAuthenticated && tokens !== null && tokens < moduleCost && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          Tokens insuffisants ({tokens}/{moduleCost})
        </div>
      )}
    </div>
  );
}
