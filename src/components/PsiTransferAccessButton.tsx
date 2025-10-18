'use client';

import React from 'react';

interface PsiTransferAccessButtonProps {
  user?: any;
}

export default function PsiTransferAccessButton({ user }: PsiTransferAccessButtonProps) {
  const handleDirectAccess = () => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    // Ouvrir directement PsiTransfer
    const directUrl = 'http://localhost:8082';
    console.log('🔗 PsiTransfer: Accès direct à:', directUrl);
    window.open(directUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleDirectAccess}
        disabled={!user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300
          ${!user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        📤 Accéder à PsiTransfer
      </button>
    </div>
  );
}