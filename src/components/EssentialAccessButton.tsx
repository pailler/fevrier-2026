'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';
import { getHunyuan3dAppUrl } from '../utils/hunyuan3dAppUrl';
import { getTokenCostForModuleId } from '../utils/tokenActionService';

interface EssentialAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleTitle: string;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function EssentialAccessButton({ 
  user,
  moduleId,
  moduleTitle,
  onAccessGranted, 
  onAccessDenied 
}: EssentialAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens } = useTokenContext();

  // Mapping des modules vers leurs sous-domaines publics
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const moduleSubdomains: Record<string, string> = {
    'librespeed': isDev ? 'http://localhost:8085' : 'https://librespeed.iahome.fr',
    'metube': 'https://metube.iahome.fr',
    'pdf': 'https://pdf.iahome.fr',
    'psitransfer': 'https://psitransfer.iahome.fr',
    'qrcodes': isDev ? 'http://localhost:7006' : 'https://qrcodes.iahome.fr',
    'whisper': 'https://whisper.iahome.fr',
    'stablediffusion': 'https://stablediffusion.iahome.fr',
    'comfyui': 'https://comfyui.iahome.fr',
    'code-learning': '/code-learning',
    // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
    'meeting-reports': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:3050'
      : 'https://meeting-reports.iahome.fr',
    // Hunyuan 3D (carte) → Hi3DGen sur le domaine principal
    'hunyuan3d': getHunyuan3dAppUrl(),
    'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
    'cogstudio': 'https://cogstudio.iahome.fr',
    'administration': '/administration',
    // Apprendre Autrement : redirection directe vers l'application (port 9001 en dev, sous-domaine en prod)
    'apprendre-autrement': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:9001'
      : 'https://apprendre-autrement.iahome.fr',
    'photobooth': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:7885'
      : 'https://photobooth.iahome.fr',
    'photo-vivante': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:7887'
      : 'https://photo-vivante.iahome.fr',
    // Détecteur de Contenu IA : sur le domaine principal
    'ai-detector': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:3000/ai-detector'
      : 'https://iahome.fr/ai-detector',
  };

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🪙 ${moduleTitle}: Vérification et consommation des tokens pour:`, user.email);
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        moduleId as any,
        'access',
        moduleTitle
      );
      
      if (!consumeResult.success) {
        console.log(`🪙 ${moduleTitle}: Échec consommation tokens:`, consumeResult.reason);
        const errorMessage = consumeResult.reason || 'Plus de crédits ? Rechargez';
        setError(errorMessage);
        onAccessDenied?.(errorMessage);
        return;
      }
      
      console.log(`🪙 ${moduleTitle}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
      console.log(`🪙 ${moduleTitle}: Tokens restants:`, consumeResult.tokensRemaining);
      
      // Mettre à jour le contexte côté client
      await refreshTokens();

      // Obtenir l'URL du sous-domaine pour ce module
      const moduleUrl = moduleSubdomains[moduleId];
      
      if (!moduleUrl) {
        throw new Error(`Module ${moduleId} non trouvé`);
      }
      
      // Générer un token d'accès pour tous les modules (y compris les routes internes avec token)
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: moduleId
        })
      });

      if (!tokenResponse.ok) {
        let errorMessage = 'Erreur génération token';
        try {
          const errorData = await tokenResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await tokenResponse.text();
          console.error(`❌ ${moduleTitle}: Erreur génération token:`, errorText);
        }
        throw new Error(errorMessage);
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) {
        throw new Error('Token non généré par le serveur');
      }
      
      // Pour les routes internes (commençant par /), ajouter le token à l'URL
      if (moduleUrl.startsWith('/')) {
        // Construire l'URL complète avec le domaine pour window.open
        const fullUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}${moduleUrl}?token=${encodeURIComponent(tokenData.token)}`
          : `${moduleUrl}?token=${encodeURIComponent(tokenData.token)}`;
        console.log(`🔗 ${moduleTitle}: Accès route interne avec token:`, fullUrl);
        if (moduleId === 'code-learning' || moduleId === 'administration') {
          // Ouvrir dans un nouvel onglet avec l'URL complète
          window.open(fullUrl, '_blank', 'noopener,noreferrer');
          onAccessGranted?.(fullUrl);
        } else {
          window.location.href = fullUrl;
          onAccessGranted?.(fullUrl);
        }
      } else {
        // Pour les sous-domaines externes (y compris apprendre-autrement), ajouter le token à l'URL
        const directUrl = `${moduleUrl}?token=${encodeURIComponent(tokenData.token)}`;
        console.log(`🔗 ${moduleTitle}: Accès direct à l'application avec token:`, directUrl);
        window.open(directUrl, '_blank', 'noopener,noreferrer');
        onAccessGranted?.(directUrl);
      }
    } catch (err: any) {
      console.error(`❌ ${moduleTitle}: Erreur inattendue:`, err);
      const errorMessage = err?.message || 'Une erreur inattendue est survenue.';
      setError(errorMessage);
      onAccessDenied?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center space-x-2
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : moduleId === 'administration'
            ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
            : moduleId === 'apprendre-autrement'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
            : moduleId === 'code-learning'
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? (
          <>
            <span>⏳</span>
            <span>Ouverture...</span>
          </>
        ) : moduleId === 'administration' ? (
          <>
            <span>🏛️</span>
            <span>Accéder aux services administratifs (10 crédits par accès)</span>
          </>
        ) : moduleId === 'apprendre-autrement' ? (
          <>
            <span>🌈</span>
            <span>Accéder à Apprendre Autrement</span>
            <span className="text-xs opacity-90">(10 crédits par accès)</span>
          </>
        ) : moduleId === 'code-learning' ? (
          <>
            <span>💻</span>
            <span>Accéder à Apprendre le Code (10 crédits par accès)</span>
          </>
        ) : (
          <>
            <span>🔧</span>
            <span>
              Accéder à {moduleTitle} ({getTokenCostForModuleId(moduleId)} crédits par accès)
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm">
          {error.includes('Rechargez') || error.includes('tokens') || error.includes('crédits') ? (
            <>
              Plus de crédits ?{' '}
              <a 
                href="https://iahome.fr/pricing2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-red-700"
              >
                rechargez
              </a>
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
}
