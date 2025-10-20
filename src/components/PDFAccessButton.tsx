'use client';

import React from 'react';

interface PDFAccessButtonProps {
  user?: any;
}

export default function PDFAccessButton({ user }: PDFAccessButtonProps) {
  const handleDirectAccess = () => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    // Ouvrir directement PDF+ via sous-domaine
    const directUrl = 'https://pdf.iahome.fr';
    console.log('🔗 PDF+: Accès direct à:', directUrl);
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
        📄 Accéder à PDF+
      </button>
    </div>
  );
}