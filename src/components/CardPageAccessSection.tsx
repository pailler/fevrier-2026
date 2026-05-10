'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { getHunyuan3dAppUrl } from '../utils/hunyuan3dAppUrl';
import { getModuleAccessOpenUrl } from '../utils/moduleAccessOpenUrl';

interface CardPageAccessSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string;
  gradientColors?: string;
  icon?: string;
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  accessUrl?: string;
}


export default function CardPageAccessSection({
  moduleId,
  moduleName,
  tokenCost,
  tokenUnit = 'par accès',
  gradientColors = 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  icon = '💻',
  moduleUrl,
  accessUrl,
  moduleTitle: _moduleTitle,
  moduleDescription: _moduleDescription,
  moduleCategory: _moduleCategory,
}: CardPageAccessSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [loading, setLoading] = useState(false);

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    if (moduleUrl) return moduleUrl;
    const MODULE_SLUG_ALIASES: Record<string, string> = {
      'vote-en-ligne': 'vote',
    };
    const normalizedModuleId =
      MODULE_SLUG_ALIASES[(moduleId || '').trim().toLowerCase()] ||
      (moduleId || '').trim().toLowerCase();
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
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
          'home-assistant': 'http://localhost:8123',
          'hunyuan3d': getHunyuan3dAppUrl(),
          'stablediffusion': 'http://localhost:7880',
          'meeting-reports': 'http://localhost:3050',
          'whisper': 'http://localhost:8093',
          'ruinedfooocus': 'http://localhost:7870',
          'comfyui': 'http://localhost:8188',
          'apprendre-autrement': 'http://localhost:9001',
          'photobooth': 'http://localhost:7885',
          'vote': 'http://localhost:7890',
          'prompt-generator': 'https://prompt-generator.iahome.fr',
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
          'home-assistant': 'https://homeassistant.iahome.fr',
          'hunyuan3d': getHunyuan3dAppUrl(),
          'stablediffusion': 'https://stablediffusion.iahome.fr',
          'meeting-reports': 'https://meeting-reports.iahome.fr',
          'whisper': 'https://whisper.iahome.fr',
          'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
          'comfyui': 'https://comfyui.iahome.fr',
          'apprendre-autrement': 'https://apprendre-autrement.iahome.fr',
          'photobooth': 'https://photobooth.iahome.fr',
          'vote': 'https://vote.iahome.fr',
          'prompt-generator': 'https://prompt-generator.iahome.fr',
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

  const handleDirectAccess = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const token = data?.token;
      if (!token) {
        throw new Error('Token d\'accès manquant');
      }

      const targetUrl = resolveModuleUrl();
      const openUrl = getModuleAccessOpenUrl({
        token,
        apiUrl: data?.url,
        targetBaseUrl: targetUrl,
      });
      if (openUrl) {
        window.open(openUrl, '_blank');
      } else {
        throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'accès à ${moduleName}:`, error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Accès à {moduleName}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ouvrez {moduleName} via un token d'accès sécurisé.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {tokenCost} tokens
                  </div>
                  <div className="text-sm text-blue-700">
                    {tokenUnit}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <button
                  onClick={handleDirectAccess}
                  disabled={loading}
                  className={`w-full font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#16a34a] hover:bg-[#15803d] text-white'}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="font-semibold text-base sm:text-lg">Ouverture en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">
                        {isAuthenticated && user ? `Accéder à ${moduleName}` : `Connectez-vous pour accéder`}
                      </span>
                      <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">
                        {tokenCost} tokens {tokenUnit}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
