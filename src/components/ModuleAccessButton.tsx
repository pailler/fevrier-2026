'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { loginHrefFromWindow, loginUrlWithReturn } from '../utils/loginRedirect';
import Link from 'next/link';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useTokenContext } from '../contexts/TokenContext';
import { getHunyuan3dAppUrl } from '../utils/hunyuan3dAppUrl';
import { isBrowserLocalIahomeDev } from '../utils/isBrowserLocalIahomeDev';
import { FREE_UNLIMITED_ACCESS_LABEL } from '../utils/tokenActionService';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginHref = loginUrlWithReturn(pathname, searchParams);

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    const normalizedModuleId = (moduleId || '').trim().toLowerCase();
    const isDevelopment = isBrowserLocalIahomeDev();
    const urlMap: Record<string, string> = isDevelopment
      ? {
          'librespeed': 'http://localhost:8085',
          'qrcodes': 'http://localhost:7006',
          'photomaker': 'http://localhost:7881',
          'birefnet': 'http://localhost:7882',
          'animagine-xl': 'http://localhost:7883',
          'sentinelle-numerique': 'http://localhost:3000/sentinelle-numerique',
          'florence-2': 'http://localhost:7884',
          'musetalk': 'http://localhost:7886',
          'photo-vivante': 'http://localhost:7887',
          'home-assistant': 'http://localhost:8123',
          'hunyuan3d': getHunyuan3dAppUrl(),
          'stablediffusion': 'http://localhost:7880',
          'meeting-reports': 'http://localhost:3050',
          'whisper': 'http://localhost:8093',
          'ruinedfooocus': 'http://localhost:7870',
          'comfyui': 'http://localhost:8188',
          'photobooth': 'http://localhost:7885',
          'vote': 'http://localhost:7890',
          'reveil-intelligent': 'http://localhost:7891',
        }
        : {
          'librespeed': 'https://librespeed.iahome.fr',
          'qrcodes': 'https://qrcodes.iahome.fr',
          'photomaker': 'https://photomaker.iahome.fr',
          'birefnet': 'https://birefnet.iahome.fr',
          'animagine-xl': 'https://animaginexl.iahome.fr',
          'sentinelle-numerique': 'https://iahome.fr/sentinelle-numerique',
          'florence-2': 'https://florence2.iahome.fr',
          'musetalk': 'https://musetalk.iahome.fr',
          'photo-vivante': 'https://photo-vivante.iahome.fr',
          'home-assistant': 'https://homeassistant.iahome.fr',
          'hunyuan3d': getHunyuan3dAppUrl(),
          'stablediffusion': 'https://stablediffusion.iahome.fr',
          'meeting-reports': 'https://meeting-reports.iahome.fr',
          'whisper': 'https://whisper.iahome.fr',
          'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
          'comfyui': 'https://comfyui.iahome.fr',
          'photobooth': 'https://photobooth.iahome.fr',
          'vote': 'https://vote.iahome.fr',
          'reveil-intelligent': 'https://reveil-intelligent.iahome.fr',
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
      if (typeof window !== 'undefined') {
        const q = window.location.search.replace(/^\?/, '');
        router.push(
          loginUrlWithReturn(pathname || window.location.pathname, { toString: () => q })
        );
      } else {
        router.push(loginHrefFromWindow());
      }
      return;
    }

    if (!user) {
      setError('Utilisateur non trouvé');
      return;
    }

    if (moduleCost > 0 && (tokens === null || tokens < moduleCost)) {
      setError(`Crédits insuffisants. Requis: ${moduleCost}, Disponible: ${tokens || 0}`);
      onAccessError?.(`Crédits insuffisants: ${tokens || 0}/${moduleCost}`);
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
        disabled={isLoading || !isAuthenticated || (moduleCost > 0 && tokens !== null && tokens < moduleCost)}
        className={`w-full font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-lg ${
          isLoading || !isAuthenticated || (moduleCost > 0 && tokens !== null && tokens < moduleCost)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-xl transform hover:-translate-y-1'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-base sm:text-lg">Ouverture...</span>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Accéder à {moduleName}</span>
            <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">
              {moduleCost === 0 ? FREE_UNLIMITED_ACCESS_LABEL : `${moduleCost} crédits par accès`}
            </span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {!isAuthenticated && (
        <Link href={loginHref} className="text-blue-600 hover:text-blue-800 text-sm underline">
          Connectez-vous pour accéder
        </Link>
      )}
      
      {isAuthenticated && moduleCost > 0 && tokens !== null && tokens < moduleCost && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          Crédits insuffisants ({tokens}/{moduleCost})
        </div>
      )}
    </div>
  );
}
