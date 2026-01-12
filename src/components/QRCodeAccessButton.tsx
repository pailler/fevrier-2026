'use client';

import React from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

interface QRCodeAccessButtonProps {
  user?: any;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function QRCodeAccessButton({ 
  user,
  onAccessGranted,
  onAccessDenied
}: QRCodeAccessButtonProps) {
  const { handleAccess, isLoading, error } = useModuleAccess({
    user: user!,
    moduleId: 'qrcodes',
    moduleTitle: 'QR Codes',
    tokenCost: 100
  });

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
        <div className="flex items-center space-x-2">
          <span>📱</span>
          <span>{isLoading ? '⏳ Ouverture...' : 'Accéder aux QR Codes (100 tokens)'}</span>
        </div>
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
