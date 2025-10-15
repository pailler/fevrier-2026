'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function QRCodePage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const connectToQRCodeService = async () => {
    try {
      setError(null);
      setConnecting(true);
      
      // Utiliser directement le proxy pour accéder au service QR
      const response = await fetch('/api/qr-proxy/dynamic/qr', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la connexion au service QR Code');
      }

      const data = await response.json();
      
      if (data.success) {
        // Rediriger vers l'interface QR via le proxy
        window.location.href = '/qr-interface';
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
      
    } catch (error) {
      console.error('Erreur connexion QR Code:', error);
      setError('Erreur lors de la connexion au service QR Code Generator');
      setConnecting(false);
    }
  };

  const openQRCodeProxy = () => {
    // Ouvrir dans un nouvel onglet via le proxy
    window.open('/api/proxy-qrcode', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Service QR Code IAHome
            </h1>
            <p className="text-gray-600 text-lg">
              Générez et gérez vos Qrcodes avec votre compte IAHome
            </p>
            
            {!session && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/login?redirect=/qr-code')}
                  className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Connectez-vous pour accéder
                </button>
              </div>
            )}
          </div>

          {session && (
            <>
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Informations de connexion
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Utilisateur connecté</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium">{user?.email?.split('@')[0] || 'Utilisateur'}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <button
                    onClick={connectToQRCodeService}
                    disabled={connecting}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium"
                  >
                    {connecting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Connexion...
                      </div>
                    ) : (
                      'Activer Qrcodes'
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Connexion directe avec authentification automatique
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={openQRCodeProxy}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                  >
                    Ouvrir via Proxy
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Ouverture dans un nouvel onglet via le proxy IAHome
                  </p>
                </div>
              </div>
            </>
          )}

          {!session && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                Connexion requise
              </h2>
              <p className="text-yellow-700 mb-4">
                Vous devez être connecté à votre compte IAHome pour accéder aux fonctionnalités de génération de QR codes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/login?redirect=/qr-code')}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => router.push('/register?redirect=/qr-code')}
                  className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Créer un compte
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {session ? 'Fonctionnalités disponibles' : 'Fonctionnalités du service'}
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Génération de QR codes
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Personnalisation des couleurs et du style
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Export en différents formats
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Statistiques de scans en temps réel
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Gestion multi-utilisateurs sécurisée
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Synchronisation avec votre compte IAHome
              </li>
              <li className="flex items-center">
                <span className={`${session ? 'text-green-500' : 'text-gray-400'} mr-2`}>✓</span>
                Accès sécurisé via iahome.fr
              </li>
            </ul>
            {!session && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Conseil :</strong> Connectez-vous pour débloquer toutes les fonctionnalités et commencer à créer vos QR codes !
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

