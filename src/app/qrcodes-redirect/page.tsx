'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

export default function QRCodesRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleQRCodeAccess = async () => {
      try {
        // Récupérer le token depuis l'URL
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Token manquant');
          setLoading(false);
          return;
        }

        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Rediriger vers la page de login avec redirection
          router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`);
          return;
        }

        // Créer une session QR codes pour l'utilisateur
        console.log('🔑 QR Codes: Création de session pour utilisateur:', session.user.email);
        
        const sessionResponse = await fetch('/api/qr-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email
          })
        });

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json().catch(() => ({}));
          console.error('❌ QR Codes: Erreur création session:', errorData);
          
          if (sessionResponse.status === 403) {
            if (errorData.message?.includes('quota')) {
              setError('Quota d\'utilisation dépassé');
            } else if (errorData.message?.includes('expired')) {
              setError('Session expirée');
            } else {
              setError('Accès refusé au module QR codes');
            }
          } else {
            setError('Erreur lors de la création de la session');
          }
          setLoading(false);
          return;
        }

        const sessionData = await sessionResponse.json();
        console.log('✅ QR Codes: Session créée:', sessionData.sessionId);

        // Rediriger vers l'interface QR codes avec la session
        const qrUrl = `/qr-interface?session=${sessionData.sessionId}`;
        console.log('🔗 QR Codes: Redirection vers:', qrUrl);
        
        router.push(qrUrl);

      } catch (error) {
        console.error('❌ QR Codes: Erreur:', error);
        setError('Erreur lors de l\'accès aux QR codes');
        setLoading(false);
      }
    };

    handleQRCodeAccess();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Création de votre session QR codes</h2>
          <p className="text-gray-600">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur d'accès</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/encours'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux applications
          </button>
        </div>
      </div>
    );
  }

  return null;
}
