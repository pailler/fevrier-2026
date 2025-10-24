'use client';

import { useState } from 'react';

interface UnifiedModuleButtonProps {
  user?: any;
  moduleId: string;
  moduleTitle: string;
  isAlreadyActivated?: boolean;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function UnifiedModuleButton({ 
  user,
  moduleId,
  moduleTitle,
  isAlreadyActivated = false,
  onAccessGranted, 
  onAccessDenied 
}: UnifiedModuleButtonProps) {
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
      console.log(`🚀 ${moduleTitle}: Accès via redirection unifiée`);
      
      // Utiliser l'API de redirection unifiée
      const redirectUrl = `/api/unified-redirect?module=${moduleId}`;
      console.log(`🔗 ${moduleTitle}: Redirection vers:`, redirectUrl);
      
      // Ouvrir dans un nouvel onglet
      window.open(redirectUrl, '_blank');
      
      onAccessGranted?.(redirectUrl);

    } catch (error) {
      console.error(`❌ ${moduleTitle}: Erreur:`, error);
      setError('Erreur lors de l\'accès à l\'application');
      onAccessDenied?.('Erreur d\'accès');
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas afficher le bouton si le module est déjà activé
  if (isAlreadyActivated) {
    return null;
  }

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
            <span>Accès en cours...</span>
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
