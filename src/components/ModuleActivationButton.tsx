'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useTokenContext } from '../contexts/TokenContext';

interface ModuleActivationButtonProps {
  moduleId: string;
  moduleName: string;
  moduleCost: number;
  moduleDescription?: string;
  className?: string;
  onActivationSuccess?: () => void;
  onActivationError?: (error: string) => void;
}

export default function ModuleActivationButton({
  moduleId,
  moduleName,
  moduleCost,
  moduleDescription,
  className = '',
  onActivationSuccess,
  onActivationError
}: ModuleActivationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useCustomAuth();
  const { tokens, refreshTokens } = useTokenContext();
  const router = useRouter();

  const handleActivation = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) {
      setError('Utilisateur non trouvé');
      return;
    }

    if (tokens === null || tokens < moduleCost) {
      setError(`Tokens insuffisants. Requis: ${moduleCost}, Disponible: ${tokens || 0}`);
      onActivationError?.(`Tokens insuffisants: ${tokens || 0}/${moduleCost}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Activation du module ${moduleName} (${moduleId}) pour ${user.email}`);

      // Vérifier d'abord si le module est déjà activé
      const checkResponse = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id
        }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.isActivated) {
          setError('Module déjà activé');
          onActivationError?.('Module déjà activé');
          return;
        }
      }

      // Appeler l'API d'activation du module
      const response = await fetch('/api/activate-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          moduleName,
          userId: user.id,
          userEmail: user.email,
          moduleCost,
          moduleDescription
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'activation du module');
      }

      console.log(`✅ Module ${moduleName} activé avec succès`);
      
      // Mettre à jour les tokens côté client
      await refreshTokens();
      
      // Notifier le succès
      onActivationSuccess?.();
      
      // Rediriger vers la page encours après un délai
      setTimeout(() => {
        router.push('/encours');
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`❌ Erreur activation module ${moduleName}:`, errorMessage);
      setError(errorMessage);
      onActivationError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Activation...';
    return `Activer ${moduleName} (${moduleCost} tokens)`;
  };

  const getButtonClass = () => {
    const baseClass = 'px-6 py-3 rounded-lg font-medium transition-all duration-200';
    const disabledClass = 'bg-gray-300 text-gray-500 cursor-not-allowed';
    const enabledClass = 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg';
    
    return `${baseClass} ${isLoading || !isAuthenticated || (tokens !== null && tokens < moduleCost) ? disabledClass : enabledClass}`;
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={handleActivation}
        disabled={isLoading || !isAuthenticated || (tokens !== null && tokens < moduleCost)}
        className={getButtonClass()}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Activation...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🔓</span>
            <span>{getButtonText()}</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="text-yellow-600 text-sm text-center max-w-xs">
          Connectez-vous pour activer ce module
        </div>
      )}
      
      {isAuthenticated && tokens !== null && tokens < moduleCost && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          Tokens insuffisants ({tokens}/{moduleCost})
        </div>
      )}
    </div>
  );
}
