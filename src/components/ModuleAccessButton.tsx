'use client';

import { useState } from 'react';

interface ModuleAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleTitle: string;
  moduleUrl: string;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function ModuleAccessButton({ 
  user,
  moduleId,
  moduleTitle,
  moduleUrl,
  onAccessGranted, 
  onAccessDenied 
}: ModuleAccessButtonProps) {
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
      console.log(`📊 ${moduleTitle}: Incrémentation du compteur d'accès...`);
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
        console.log(`✅ ${moduleTitle}: Compteur incrémenté:`, incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          console.log(`❌ ${moduleTitle}: Quota dépassé`);
          setError(errorData.message || 'Quota dépassé');
          onAccessDenied?.(errorData.message || 'Quota dépassé');
          return;
        } else if (incrementResponse.status === 403 && errorData.error === 'Accès expiré') {
          console.log(`❌ ${moduleTitle}: Accès expiré`);
          setError(errorData.message || 'Accès expiré');
          onAccessDenied?.(errorData.message || 'Accès expiré');
          return;
        } else {
          console.warn(`⚠️ ${moduleTitle}: Erreur incrémentation compteur, continuons...`);
        }
      }

      // 2. Générer un token provisoire simple
      console.log(`🔑 ${moduleTitle}: Génération du token provisoire...`);
      const provisionalToken = generateProvisionalToken(user.id, user.email);
      console.log(`✅ ${moduleTitle}: Token provisoire généré:`, provisionalToken.substring(0, 10) + '...');

      // 3. Vérifier les tokens d'accès existants
      const accessTokens = await checkExistingAccessTokens(user.id, moduleId);
      
      if (accessTokens.length > 0) {
        console.log(`📋 ${moduleTitle}: Tokens d'accès existants trouvés:`, accessTokens.length);
        // Utiliser le premier token d'accès valide
        const validToken = accessTokens.find(token => 
          token.is_active && 
          (!token.expires_at || new Date(token.expires_at) > new Date()) &&
          (!token.max_usage || token.current_usage < token.max_usage)
        );
        
        if (validToken) {
          console.log(`✅ ${moduleTitle}: Utilisation du token d'accès existant`);
          const finalUrl = `${moduleUrl}?token=${validToken.id}`;
          onAccessGranted?.(finalUrl);
          return;
        }
      }

      // 4. Utiliser le token provisoire si aucun token d'accès valide
      console.log(`🔄 ${moduleTitle}: Utilisation du token provisoire (NOUVEAU CODE)`);
      const finalUrl = `${moduleUrl}?token=${provisionalToken}`;
      console.log(`🔗 ${moduleTitle}: URL finale (NOUVEAU CODE):`, finalUrl);

      onAccessGranted?.(finalUrl);

    } catch (error) {
      console.error(`❌ ${moduleTitle}: Erreur:`, error);
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

  const checkExistingAccessTokens = async (userId: string, moduleId: string) => {
    try {
      const response = await fetch('/api/check-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, moduleId })
      });

      if (response.ok) {
        const data = await response.json();
        return data.tokens || [];
      }
      return [];
    } catch (error) {
      console.error(`❌ Erreur vérification tokens d'accès pour ${moduleId}:`, error);
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
          `🚀 Accéder à ${moduleTitle}`
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
