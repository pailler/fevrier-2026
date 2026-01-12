'use client';

import React from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

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
  const { handleAccess, isLoading, error } = useModuleAccess({
    user: user!,
    moduleId,
    moduleTitle,
    tokenCost: 10
  });

  // Ne pas afficher le bouton si le module est déjà activé
  if (isAlreadyActivated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleAccess(onAccessGranted, onAccessDenied)}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white hover:shadow-lg
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? '⏳ Ouverture...' : `🚀 Accéder à ${moduleTitle}`}
      </button>
      {error && (
        <p className="text-red-500 text-sm">
          {error.includes('Rechargez') || error.includes('tokens') ? (
            <>
              Plus de tokens ?{' '}
              <a 
                href="https://iahome.fr/pricing2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-red-700"
              >
                rechargez
              </a>
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
}
