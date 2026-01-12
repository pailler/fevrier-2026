'use client';

import React from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

interface AIAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleTitle: string;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function AIAccessButton({ 
  user,
  moduleId,
  moduleTitle,
  onAccessGranted,
  onAccessDenied
}: AIAccessButtonProps) {
  const { handleAccess, isLoading, error } = useModuleAccess({
    user: user!,
    moduleId,
    moduleTitle,
    tokenCost: 100
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={() => handleAccess(onAccessGranted, onAccessDenied)}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'
          }`}
      >
        {isLoading ? '⏳ Ouverture...' : `🤖 Accéder à ${moduleTitle} (100 tokens)`}
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
