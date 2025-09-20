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

      // 2. Générer un token provisoire simple
      console.log('🔑 LibreSpeed: Génération du token provisoire...');
      const provisionalToken = generateProvisionalToken(user.id, user.email);
      console.log('✅ LibreSpeed: Token provisoire généré:', provisionalToken.substring(0, 10) + '...');

      // 3. Vérifier les tokens d'accès existants
      const accessTokens = await checkExistingAccessTokens(user.id);
      
      if (accessTokens.length > 0) {
        console.log('📋 LibreSpeed: Tokens d\'accès existants trouvés:', accessTokens.length);
        // Utiliser le premier token d'accès valide
        const validToken = accessTokens.find(token => 
          token.is_active && 
          (!token.expires_at || new Date(token.expires_at) > new Date()) &&
          (!token.max_usage || token.current_usage < token.max_usage)
        );
        
        if (validToken) {
          console.log('✅ LibreSpeed: Utilisation du token d\'accès existant');
          const librespeedUrl = `https://librespeed.iahome.fr?token=${validToken.id}`;
          onAccessGranted?.(librespeedUrl);
          return;
        }
      }

      // 4. Utiliser le token provisoire si aucun token d'accès valide
      console.log('🔄 LibreSpeed: Utilisation du token provisoire');
      const librespeedUrl = `https://librespeed.iahome.fr?token=${provisionalToken}`;
      console.log('🔗 LibreSpeed: URL finale:', librespeedUrl);

      onAccessGranted?.(librespeedUrl);

    } catch (error) {
      console.error('❌ LibreSpeed: Erreur:', error);
      setError('Erreur lors de la génération du token');
      onAccessDenied?.('Erreur génération token');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProvisionalToken = (userId: string, userEmail: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const data = `${userId}-${userEmail}-${timestamp}-${random}`;
    
    // Simple hash pour le token provisoire
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `prov_${Math.abs(hash).toString(36)}_${timestamp.toString(36)}`;
  };

  const checkExistingAccessTokens = async (userId: string) => {
    try {
      const response = await fetch('/api/check-librespeed-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        return data.tokens || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur vérification tokens d\'accès:', error);
      return [];
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
            <span>Génération du token...</span>
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
