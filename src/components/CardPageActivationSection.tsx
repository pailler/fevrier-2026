'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface CardPageActivationSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string;
  apiEndpoint: string; // Conservé pour compatibilité avec les appels existants
  gradientColors?: string;
  icon?: string;
  isModuleActivated?: boolean; // Conservé pour compatibilité
  onActivationSuccess?: () => void;
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  customRequestBody?: (userId: string, email: string, moduleId: string) => any;
  accessUrl?: string;
}

export default function CardPageActivationSection({
  moduleId,
  moduleName,
  tokenCost,
  tokenUnit = 'par accès',
  apiEndpoint: _apiEndpoint,
  gradientColors = 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  icon = '💻',
  isModuleActivated: _isModuleActivated,
  onActivationSuccess,
  moduleTitle: _moduleTitle,
  moduleDescription: _moduleDescription,
  moduleCategory: _moduleCategory,
  moduleUrl,
  customRequestBody: _customRequestBody,
  accessUrl,
}: CardPageActivationSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [loading, setLoading] = useState(false);

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    if (moduleUrl) return moduleUrl;
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
          'apprendre-autrement': 'http://localhost:9001',
          'prompt-generator': 'http://localhost:3002',
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
          'apprendre-autrement': 'https://apprendre-autrement.iahome.fr',
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
      if (targetUrl) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        window.open(`${targetUrl}${separator}token=${encodeURIComponent(token)}`, '_blank');
      } else {
        throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
      }

      onActivationSuccess?.();
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
                Accès direct à {moduleName}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ouvrez {moduleName} immédiatement via un token d'accès sécurisé.
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
                  className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : `bg-gradient-to-r ${gradientColors} text-white`}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Ouverture en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">{icon}</span>
                      <span>
                        {isAuthenticated && user
                          ? `Accéder à ${moduleName} (${tokenCost} tokens)`
                          : `Connectez-vous pour accéder (${tokenCost} tokens)`}
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

