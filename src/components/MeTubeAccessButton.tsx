'use client';

import { useState } from 'react';

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

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Incrémenter le compteur d'accès
      console.log('📊 MeTube: Incrémentation du compteur d\'accès...');
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
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          console.log('❌ MeTube: Quota dépassé');
          setError(errorData.message || 'Quota dépassé');
          onAccessDenied?.(errorData.message || 'Quota dépassé');
          return;
        } else if (incrementResponse.status === 403 && errorData.error === 'Accès expiré') {
          console.log('❌ MeTube: Accès expiré');
          setError(errorData.message || 'Accès expiré');
          onAccessDenied?.(errorData.message || 'Accès expiré');
          return;
        } else {
          console.warn('⚠️ MeTube: Erreur incrémentation compteur, continuons...');
        }
      }

      // 2. Ouvrir MeTube dans un nouvel onglet
      console.log('🔗 MeTube: Ouverture dans un nouvel onglet...');
      const metubeUrl = 'https://metube.iahome.fr';
      window.open(metubeUrl, '_blank');
      console.log('✅ MeTube: Ouverture de MeTube');
      onAccessGranted?.(metubeUrl);
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
          '🎥 Accéder à MeTube'
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

