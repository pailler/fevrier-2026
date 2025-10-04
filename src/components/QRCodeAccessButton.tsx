'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QRCodeAccessButtonProps {
  user: any;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function QRCodeAccessButton({ 
  user,
  onAccessGranted, 
  onAccessDenied 
}: QRCodeAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  console.log('🔍 QRCodeAccessButton: Rendu avec user:', user ? 'présent' : 'absent');

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Ouvrir QR Codes dans un nouvel onglet
      console.log('🔗 QR Codes: Ouverture dans un nouvel onglet...');
      const qrUrl = 'https://qrcodes.iahome.fr';
      window.open(qrUrl, '_blank');
      console.log('✅ QR Codes: Ouverture de QR Codes');
      
      onAccessGranted?.(qrUrl);

    } catch (error) {
      console.error('❌ QR Codes: Erreur:', error);
      setError('Erreur lors de l\'ouverture des QR codes');
      onAccessDenied?.('Erreur ouverture QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading || !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          '📱 Accéder aux QR Codes'
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
