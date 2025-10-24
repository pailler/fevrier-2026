'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

interface ModuleAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleName: string;
  moduleUrl: string;
  moduleCost: number;
  isAlreadyActivated?: boolean;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function ModuleAccessButton({ 
  user, 
  moduleId, 
  moduleName, 
  moduleUrl, 
  moduleCost,
  isAlreadyActivated = false,
  onAccessGranted, 
  onAccessDenied 
}: ModuleAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens } = useTokenContext();

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
      console.log(`🪙 ${moduleName}: Vérification et consommation des tokens pour:`, user.email);
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        moduleId as any,
        'access',
        moduleName
      );
      
      if (!consumeResult.success) {
        console.log(`🪙 ${moduleName}: Échec consommation tokens:`, consumeResult.reason);
        setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
        onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
        return;
      }
      
      console.log(`🪙 ${moduleName}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
      console.log(`🪙 ${moduleName}: Tokens restants:`, consumeResult.tokensRemaining);
      
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
          console.log(`✅ ${moduleName}: Compteur incrémenté:`, incrementData.usage_count);
        } else {
          console.warn(`⚠️ ${moduleName}: Erreur incrémentation compteur, continuons...`);
        }
      } catch (incrementError) {
        console.warn(`⚠️ ${moduleName}: Erreur incrémentation compteur:`, incrementError);
      }

      // Rediriger directement vers l'application via sous-domaines
      const applicationUrls: { [key: string]: string } = {
        'librespeed': 'https://librespeed.iahome.fr',
        'metube': 'https://metube.iahome.fr',
        'whisper': 'https://whisper.iahome.fr',
        'psitransfer': 'https://psitransfer.iahome.fr',
        'qrcodes': 'https://qrcodes.iahome.fr',
        'pdf': 'https://pdf.iahome.fr',
        'stablediffusion': 'https://stablediffusion.iahome.fr',
        'comfyui': 'https://comfyui.iahome.fr',
        'meeting-reports': 'https://meeting-reports.iahome.fr',
        'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
        'cogstudio': 'https://cogstudio.iahome.fr',
      };

      const accessUrl = applicationUrls[moduleId];
      
      if (!accessUrl) {
        throw new Error(`URL d'accès non configurée pour ${moduleId}`);
      }
      
      console.log(`🔗 ${moduleName}: Accès direct à:`, accessUrl);
      window.open(accessUrl, '_blank');
      
      // Appeler le callback pour notifier l'accès accordé
      onAccessGranted?.(accessUrl);
    } catch (err) {
      console.error(`❌ ${moduleName}: Erreur inattendue:`, err);
      setError('Une erreur inattendue est survenue.');
      onAccessDenied?.('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas afficher le bouton si le module est déjà activé
  if (isAlreadyActivated) {
    return null;
  }

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
        {isLoading ? '⏳ Ouverture...' : `🚀 Accéder à ${moduleName} (${moduleCost} tokens)`}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}