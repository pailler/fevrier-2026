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
      // 1. Créer une session QR codes pour l'utilisateur
      console.log('🔑 QR Codes: Création de session...');
      const sessionResponse = await fetch('/api/qr-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email
        })
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json().catch(() => ({}));
        console.log('❌ QR Codes: Erreur création session:', errorData);
        
        if (sessionResponse.status === 403) {
          if (errorData.message?.includes('quota')) {
            setError('Quota d\'utilisation dépassé');
            onAccessDenied?.('Quota dépassé');
          } else if (errorData.message?.includes('expired')) {
            setError('Session expirée');
            onAccessDenied?.('Session expirée');
          } else {
            setError('Accès refusé au module QR codes');
            onAccessDenied?.('Accès refusé');
          }
        } else {
          setError('Erreur lors de la création de la session');
          onAccessDenied?.('Erreur session');
        }
        return;
      }

      const sessionData = await sessionResponse.json();
      console.log('✅ QR Codes: Session créée:', sessionData.sessionId);

      // 2. Rediriger vers la page de redirection QR codes
      const qrUrl = `https://qrcodes.iahome.fr?token=${sessionData.sessionId}`;
      console.log('🔗 QR Codes: URL finale:', qrUrl);

      onAccessGranted?.(qrUrl);
      window.open(qrUrl, '_blank');

    } catch (error) {
      console.error('❌ QR Codes: Erreur:', error);
      setError('Erreur lors de l\'accès aux QR codes');
      onAccessDenied?.('Erreur technique');
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
            <span>Création de session...</span>
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
