'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';

interface ModuleAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleName: string;
  moduleUrl: string;
  moduleCost: number;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
  className?: string;
}

export default function ModuleAccessButton({ 
  user,
  moduleId,
  moduleName,
  moduleUrl,
  moduleCost,
  onAccessGranted, 
  onAccessDenied,
  className = ''
}: ModuleAccessButtonProps) {
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
      console.log(`🪙 ${moduleName}: Vérification et consommation des tokens pour:`, user.email);
      
      // Utiliser le service pour la consommation côté serveur
      const tokenService = TokenActionServiceClient.getInstance();
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        moduleId,
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

      // Incrémenter le compteur d'accès (pour affichage uniquement)
      console.log(`📊 ${moduleName}: Incrémentation du compteur d'accès...`);
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

      // Ouvrir le module dans un nouvel onglet
      console.log(`🔗 ${moduleName}: Ouverture dans un nouvel onglet...`);
      window.open(moduleUrl, '_blank');
      console.log(`✅ ${moduleName}: Ouverture de ${moduleName}`);
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture
      return;

    } catch (error) {
      console.error(`❌ ${moduleName}: Erreur:`, error);
      setError(`Erreur lors de l'ouverture de ${moduleName}`);
      onAccessDenied?.(`Erreur ouverture ${moduleName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleIcon = (moduleId: string) => {
    const icons: { [key: string]: string } = {
      'stablediffusion': '🎨',
      'comfyui': '⚙️',
      'whisper': '🎤',
      'cogstudio': '🎯',
      'ruinedfooocus': '🎭'
    };
    return icons[moduleId] || '🔧';
  };

  const getModuleColor = (moduleId: string) => {
    const colors: { [key: string]: string } = {
      'stablediffusion': 'bg-purple-600 hover:bg-purple-700',
      'comfyui': 'bg-blue-600 hover:bg-blue-700',
      'whisper': 'bg-green-600 hover:bg-green-700',
      'cogstudio': 'bg-pink-600 hover:bg-pink-700',
      'ruinedfooocus': 'bg-red-600 hover:bg-red-700'
    };
    return colors[moduleId] || 'bg-gray-600 hover:bg-gray-700';
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading || !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : `${getModuleColor(moduleId)} text-white hover:shadow-lg`
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>{getModuleIcon(moduleId)}</span>
            <span>Accéder à {moduleName} ({moduleCost} tokens)</span>
          </div>
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