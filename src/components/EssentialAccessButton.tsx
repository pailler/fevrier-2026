'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

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
  const moduleSubdomains: Record<string, string> = {
    'librespeed': 'https://librespeed.iahome.fr',
    'metube': 'https://metube.iahome.fr',
    'pdf': 'https://pdf.iahome.fr',
    'psitransfer': 'https://psitransfer.iahome.fr',
    'qrcodes': 'https://qrcodes.iahome.fr',
    'whisper': 'https://whisper.iahome.fr',
    'stablediffusion': 'https://stablediffusion.iahome.fr',
    'comfyui': 'https://comfyui.iahome.fr',
    // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
    'meeting-reports': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:3050'
      : 'https://meeting-reports.iahome.fr',
    // Hunyuan 3D : localhost:8888 en dev, hunyuan3d.iahome.fr en prod
    'hunyuan3d': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:8888'
      : 'https://hunyuan3d.iahome.fr',
    'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
    'cogstudio': 'https://cogstudio.iahome.fr',
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
        const errorMessage = consumeResult.reason || 'Plus de tokens ? Rechargez';
        setError(errorMessage);
        onAccessDenied?.(errorMessage);
        return;
      }
      
      console.log(`🪙 ${moduleTitle}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
      console.log(`🪙 ${moduleTitle}: Tokens restants:`, consumeResult.tokensRemaining);
      
      // Mettre à jour le contexte côté client
      await refreshTokens();

      // Incrémenter le compteur d'accès
      try {
        const incrementResponse = await fetch('/api/increment-module-access', {
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

        if (incrementResponse.ok) {
          const incrementData = await incrementResponse.json();
          console.log(`✅ ${moduleTitle}: Compteur incrémenté:`, incrementData.usage_count);
        } else {
          console.warn(`⚠️ ${moduleTitle}: Erreur incrémentation compteur, continuons...`);
        }
      } catch (incrementError) {
        console.warn(`⚠️ ${moduleTitle}: Erreur incrémentation compteur:`, incrementError);
      }

      // Générer un token d'accès
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
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Obtenir l'URL du sous-domaine pour ce module
      const moduleUrl = moduleSubdomains[moduleId];
      
      if (!moduleUrl) {
        throw new Error(`Module ${moduleId} non trouvé`);
      }
      
      // Ouvrir le sous-domaine avec le token en paramètre
      const directUrl = `${moduleUrl}?token=${encodeURIComponent(tokenData.token)}`;
      
      console.log(`🔗 ${moduleTitle}: Accès direct au sous-domaine avec token:`, directUrl);
      window.open(directUrl, '_blank');
      
      // Appeler le callback pour notifier l'accès accordé
      onAccessGranted?.(directUrl);
    } catch (err) {
      console.error(`❌ ${moduleTitle}: Erreur inattendue:`, err);
      setError('Une erreur inattendue est survenue.');
      onAccessDenied?.('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? '⏳ Ouverture...' : `🔧 Accéder à ${moduleTitle} (10 tokens)`}
      </button>

      {error && (
        <p className="text-red-500 text-sm">
          {error.includes('Rechargez') || error.includes('tokens') ? (
            <>
              Plus de tokens ?{' '}
              <a 
                href="https://iahome.fr/pricing" 
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
