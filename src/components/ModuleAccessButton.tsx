'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useTokenContext } from '../contexts/TokenContext';
import { FREE_UNLIMITED_ACCESS_LABEL } from '../utils/tokenActionService';
import { getModuleAppUrl, openModuleAppWithToken, openPendingModuleTab, redirectToLogin } from '../utils/moduleAppUrl';

interface ModuleAccessButtonProps {
  moduleId: string;
  moduleName: string;
  moduleCost: number;
  moduleDescription?: string;
  accessUrl?: string;
  className?: string;
  onAccessSuccess?: () => void;
  onAccessError?: (error: string) => void;
}

export default function ModuleAccessButton({
  moduleId,
  moduleName,
  moduleCost,
  accessUrl,
  className = '',
  onAccessSuccess,
  onAccessError
}: ModuleAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useCustomAuth();
  const { tokens, refreshTokens } = useTokenContext();
  const pathname = usePathname();

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    return getModuleAppUrl(moduleId);
  };

  const handleAccess = async () => {
    if (!isAuthenticated) {
      const returnPath =
        typeof window !== 'undefined'
          ? `${pathname || window.location.pathname}${window.location.search || ''}`
          : pathname || '/';
      redirectToLogin(returnPath);
      return;
    }

    if (!user) {
      setError('Utilisateur non trouvé');
      return;
    }

    if (moduleCost > 0 && (tokens === null || tokens < moduleCost)) {
      setError(`Crédits insuffisants. Requis: ${moduleCost}, Disponible: ${tokens || 0}`);
      onAccessError?.(`Crédits insuffisants: ${tokens || 0}/${moduleCost}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const targetUrlPreview = resolveModuleUrl();
    const pendingTab = openPendingModuleTab();

    try {
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const token = data?.token;
      if (!token) {
        throw new Error('Token d\'accès manquant');
      }

      const targetUrl = resolveModuleUrl();
      if (!targetUrl) {
        throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
      }

      openModuleAppWithToken(moduleId, token, targetUrl, pendingTab);
      
      try {
        await refreshTokens();
      } catch {
        // Non bloquant
      }
      
      onAccessSuccess?.();
    } catch (err) {
      if (pendingTab && !pendingTab.closed) {
        pendingTab.close();
      }
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`❌ Erreur accès module ${moduleName}:`, errorMessage);
      setError(errorMessage);
      onAccessError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const insufficientCredits =
    moduleCost > 0 && tokens !== null && tokens < moduleCost;
  const buttonDisabled = isLoading || insufficientCredits;

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={handleAccess}
        disabled={buttonDisabled}
        className={`w-full font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-lg ${
          buttonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-xl transform hover:-translate-y-1'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-base sm:text-lg">Ouverture...</span>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">
              {isAuthenticated && user ? `Accéder à ${moduleName}` : `Connectez-vous pour accéder`}
            </span>
            <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">
              {moduleCost === 0 ? FREE_UNLIMITED_ACCESS_LABEL : `${moduleCost} crédits par accès`}
            </span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {isAuthenticated && insufficientCredits && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          Crédits insuffisants ({tokens}/{moduleCost})
        </div>
      )}
    </div>
  );
}
