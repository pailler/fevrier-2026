'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      let checkResponse;
      try {
        checkResponse = await fetch('/api/check-module-activation', {
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
            setIsLoading(false);
            return;
          }
        }
      } catch (checkErr) {
        console.warn('⚠️ Erreur lors de la vérification d\'activation (continuons):', checkErr);
        // On continue même si la vérification échoue
      }

      // Appeler l'API d'activation du module
      let response;
      try {
        response = await fetch('/api/activate-module', {
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
      } catch (fetchErr) {
        // Erreur réseau lors du fetch
        const networkError = fetchErr instanceof TypeError && fetchErr.message.includes('fetch')
          ? 'Erreur de connexion réseau. Vérifiez votre connexion internet.'
          : fetchErr instanceof Error ? fetchErr.message : 'Erreur réseau inconnue';
        
        console.error(`❌ Erreur réseau lors de l'activation du module ${moduleName}:`, fetchErr);
        setError(networkError);
        onActivationError?.(networkError);
        setIsLoading(false);
        return;
      }

      // Vérifier si la réponse est OK avant de parser le JSON
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseErr) {
          // Si on ne peut pas parser le JSON, utiliser le statut HTTP
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log(`✅ Module ${moduleName} activé avec succès`);
      
      // Mettre à jour les tokens côté client
      try {
        await refreshTokens();
      } catch (tokenErr) {
        console.warn('⚠️ Erreur lors de la mise à jour des tokens (non bloquant):', tokenErr);
      }
      
      // Notifier le succès
      onActivationSuccess?.();
      
      // Rediriger vers la page encours après un délai
      setTimeout(() => {
        router.push('/encours');
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`❌ Erreur activation module ${moduleName}:`, errorMessage, err);
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
        <Link 
          href="/login" 
          className="text-blue-600 hover:text-blue-800 text-sm text-center max-w-xs underline"
        >
          Connectez-vous pour activer ce module
        </Link>
      )}
      
      {isAuthenticated && tokens !== null && tokens < moduleCost && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          Tokens insuffisants ({tokens}/{moduleCost})
        </div>
      )}
    </div>
  );
}
