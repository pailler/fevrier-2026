'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

interface MeTubeAccessButtonProps {
  user?: any;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function MeTubeAccessButton({ 
  user,
  onAccessGranted, 
  onAccessDenied 
}: MeTubeAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { consumeTokens, refreshTokens } = useTokenContext();

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🪙 NOUVELLE VÉRIFICATION ET CONSOMMATION : Vérifier et consommer les tokens
      console.log('🪙 MeTube: Vérification et consommation des tokens pour:', user.email);
      
      // Consommer 10 tokens pour l'accès à MeTube
      const tokenConsumed = await consumeTokens(10);
      
      if (!tokenConsumed) {
        console.log('🪙 MeTube: Échec consommation tokens - tokens insuffisants');
        setError('Tokens insuffisants pour accéder à MeTube');
        onAccessDenied?.('Tokens insuffisants');
        return;
      }
      
      console.log('🪙 MeTube: Tokens consommés avec succès');
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        'metube',
        'access',
        'MeTube'
      );
      
      if (!consumeResult.success) {
        console.log('🪙 MeTube: Échec consommation côté serveur:', consumeResult.reason);
        // Restaurer les tokens côté client
        await refreshTokens();
        setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
        onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
        return;
      }
      
      console.log('🪙 MeTube: Tokens consommés avec succès côté serveur:', consumeResult.tokensConsumed);

      // Incrémenter le compteur d'accès (pour affichage uniquement, pas de quota)
      ;
      const incrementResponse = await fetch('/api/increment-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'metube'
        })
      });

      if (incrementResponse.ok) {
        const incrementData = await incrementResponse.json();
        console.log('✅ MeTube: Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        console.warn('⚠️ MeTube: Erreur incrémentation compteur, continuons...');
      }

      // 2. Ouvrir MeTube dans un nouvel onglet
      console.log('🔗 MeTube: Ouverture dans un nouvel onglet...');
      const metubeUrl = 'https://metube.iahome.fr';
      window.open(metubeUrl, '_blank');
      ;
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture
      return;

    } catch (error) {
      console.error('❌ MeTube: Erreur:', error);
      setError('Erreur lors de l\'ouverture de MeTube');
      onAccessDenied?.('Erreur ouverture MeTube');
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading || !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
              '🎥 Accéder à MeTube (10 tokens)'
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}

