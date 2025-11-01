'use client';

import React from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

interface MeetingReportsAccessButtonProps {
  user: {
    id: string;
    email: string;
  } | null;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function MeetingReportsAccessButton({ 
  user,
  onAccessGranted,
  onAccessDenied
}: MeetingReportsAccessButtonProps) {
  const { handleAccess, isLoading, error } = useModuleAccess({
    user: user!,
    moduleId: 'meeting-reports',
    moduleTitle: 'Compte rendu automatique',
    tokenCost: 100
  });

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleAccess(onAccessGranted, onAccessDenied)}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 min-w-[200px] justify-center active:scale-95
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
          }`}
      >
        <div className="flex items-center space-x-2">
          <span>📊</span>
          <span>{isLoading ? '⏳ Ouverture...' : 'Accéder au Compte rendu automatique (100 tokens)'}</span>
        </div>
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
