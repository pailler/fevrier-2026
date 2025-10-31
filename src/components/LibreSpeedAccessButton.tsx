'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

interface LibreSpeedAccessButtonProps {
  user?: any;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function LibreSpeedAccessButton({ 
  user,
  onAccessGranted, 
  onAccessDenied 
}: LibreSpeedAccessButtonProps) {
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
      console.log('🪙 LibreSpeed: Vérification et consommation des tokens pour:', user.email);
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        'librespeed',
        'access',
        'LibreSpeed'
      );
      
      if (!consumeResult.success) {
        console.log('🪙 LibreSpeed: Échec consommation tokens:', consumeResult.reason);
        setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
        onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
        return;
      }
      
      console.log('🪙 LibreSpeed: Tokens consommés avec succès:', consumeResult.tokensConsumed);
      console.log('🪙 LibreSpeed: Tokens restants:', consumeResult.tokensRemaining);
      
      // Mettre à jour le contexte côté client
      await refreshTokens();

      // Incrémenter le compteur d'accès
      try {
        const incrementResponse = await fetch('/api/increment-librespeed-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email
          })
        });

        if (incrementResponse.ok) {
          const incrementData = await incrementResponse.json();
          console.log('✅ LibreSpeed: Compteur incrémenté:', incrementData.usage_count);
        } else {
          console.warn('⚠️ LibreSpeed: Erreur incrémentation compteur, continuons...');
        }
      } catch (incrementError) {
        console.warn('⚠️ LibreSpeed: Erreur incrémentation compteur:', incrementError);
      }

      // Générer un token d'accès via l'API
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'librespeed'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Utiliser le proxy avec Service Token Cloudflare Access
      // Le proxy fait la requête depuis le serveur avec le Service Token pour contourner l'auth interactive
      const proxyUrl = `https://iahome.fr/api/librespeed-access?token=${tokenData.token}`;
      
      console.log('🔗 LibreSpeed: Accès via proxy avec Service Token à:', proxyUrl);
      window.open(proxyUrl, '_blank');
      
      // Appeler le callback pour notifier l'accès accordé
      onAccessGranted?.(proxyUrl);
    } catch (err) {
      console.error('❌ LibreSpeed: Erreur inattendue:', err);
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
        {isLoading ? '⏳ Ouverture...' : '🚀 Accéder à LibreSpeed (10 tokens)'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}