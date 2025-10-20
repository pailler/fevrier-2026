'use client';

import React from 'react';

interface QRCodeAccessButtonProps {
  user?: any;
}

export default function QRCodeAccessButton({ user }: QRCodeAccessButtonProps) {
  const handleDirectAccess = () => {
    // Ouvrir directement QR Codes via sous-domaine
    const directUrl = 'https://qrcodes.iahome.fr';
    console.log('🔗 QR Codes: Accès direct à:', directUrl);
    window.open(directUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleDirectAccess}
        className="px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
      >
        📱 Accéder aux QR Codes
      </button>
    </div>
  );
}