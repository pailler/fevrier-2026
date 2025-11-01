'use client';

import React from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

interface ModuleAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleName: string;
  moduleUrl: string;
  moduleCost: number;
  isAlreadyActivated?: boolean;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function ModuleAccessButton({ 
  user,
  moduleId,
  moduleName,
  moduleCost,
  isAlreadyActivated = false,
  onAccessGranted,
  onAccessDenied
}: ModuleAccessButtonProps) {
  const { handleAccess, isLoading, error } = useModuleAccess({
    user: user!,
    moduleId,
    moduleTitle: moduleName,
    tokenCost: moduleCost
  });

  // Ne pas afficher le bouton si le module est déjà activé
  if (isAlreadyActivated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={() => handleAccess(onAccessGranted, onAccessDenied)}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? '⏳ Ouverture...' : `🚀 Accéder à ${moduleName} (${moduleCost} tokens)`}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
