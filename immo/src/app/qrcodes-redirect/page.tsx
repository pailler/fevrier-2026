'use client';

import { useEffect } from 'react';

export default function QRCodesRedirectPage() {
  useEffect(() => {
    // Redirection automatique vers la page QR codes
    window.location.href = '/qrcodes';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers QR Codes...</p>
      </div>
    </div>
  );
}




