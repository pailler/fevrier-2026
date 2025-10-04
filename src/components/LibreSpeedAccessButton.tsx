'use client';

import { useState } from 'react';

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

  console.log('🔍 LibreSpeedAccessButton: Rendu avec user:', user ? 'présent' : 'absent');

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
      console.log('📊 LibreSpeed: Incrémentation du compteur d\'accès...');
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
        console.log('✅ LibreSpeed: Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          console.log('❌ LibreSpeed: Quota dépassé');
          setError(errorData.message || 'Quota dépassé');
          onAccessDenied?.(errorData.message || 'Quota dépassé');
          return;
        } else {
          console.warn('⚠️ LibreSpeed: Erreur incrémentation compteur, continuons...');
        }
      }

      // 2. Ouvrir LibreSpeed dans un nouvel onglet
      console.log('🔗 LibreSpeed: Ouverture dans un nouvel onglet...');
      const librespeedUrl = 'https://librespeed.iahome.fr';
      window.open(librespeedUrl, '_blank');
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture

    } catch (error) {
      console.error('❌ LibreSpeed: Erreur:', error);
      setError('Erreur lors de l\'ouverture de LibreSpeed');
      onAccessDenied?.('Erreur ouverture LibreSpeed');
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
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          '🚀 Accéder à LibreSpeed'
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
