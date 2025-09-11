'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function QRCodeIframePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Vérifier la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application QR codes...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/encours')}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour aux modules
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                QR Codes Intelligents
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Connecté en tant que <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <button
                onClick={() => router.push('/encours')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container principal avec iframe */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Barre de statut */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${iframeLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {iframeLoaded ? 'Application connectée' : 'Connexion en cours...'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Application QR Codes Intelligents
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(process.env.NEXT_PUBLIC_QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr', '_blank')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Ouvrir dans un nouvel onglet
                </button>
              </div>
            </div>
          </div>

          {/* Iframe */}
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement de l'application QR codes...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={process.env.NEXT_PUBLIC_QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr'}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              title="QR Codes Intelligents"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
            />
          </div>
        </div>
      </div>

      {/* Footer informatif */}
      <div className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              Application QR Codes Intelligents intégrée à IAHome.fr • 
              Créez, gérez et personnalisez vos QR codes directement depuis cette interface
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
