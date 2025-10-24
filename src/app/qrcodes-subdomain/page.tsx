'use client';

import { useEffect } from 'react';

export default function QRCodesSubdomainPage() {
  useEffect(() => {
    // Redirection automatique vers la page QR codes
    window.location.href = '/qrcodes';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📱 QR Codes Dynamiques</h1>
        <p className="text-gray-600 mb-6">Redirection vers l'application...</p>
        <div className="text-sm text-gray-500">
          <p>💎 Coût : 100 tokens par génération</p>
        </div>
      </div>
    </div>
  );
}




