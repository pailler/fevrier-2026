'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import Header from '../../components/Header';

function ValidationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activationStatus, setActivationStatus] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Vérifier le statut depuis les paramètres URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');
    
    console.log('🔍 Validation page - Paramètres reçus:', { success, canceled, sessionId });
    
    if (success) {
      setActivationStatus('success');
      console.log('✅ Validation page - Statut succès détecté');
    } else if (canceled) {
      setActivationStatus('canceled');
      console.log('⚠️ Validation page - Statut annulation détecté');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour voir cette page.</p>
            <Link href="/login" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Icône de succès */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Activation réussie !
          </h1>

          {/* Message de confirmation */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Vos modules ont été activés avec succès et sont maintenant disponibles dans votre espace personnel.
          </p>

          {/* Statut de l'activation */}
          {activationStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 max-w-2xl mx-auto">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Activation confirmée</span>
              </div>
              <p className="mt-2 text-sm">
                Vos modules sont maintenant actifs et accessibles depuis votre page "Mes Applications".
              </p>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Que faire maintenant ?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-900 mb-2">Accéder à vos applications</h3>
                <p className="text-gray-600 text-sm">
                  Retrouvez tous vos modules activés dans votre espace personnel
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-semibold text-gray-900 mb-2">Commencer à utiliser</h3>
                <p className="text-gray-600 text-sm">
                  Lancez vos applications IA et commencez à créer
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/encours" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voir mes applications
            </Link>
            
            <Link 
              href="/" 
              className="inline-flex items-center px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>

          {/* Informations techniques */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Vos modules sont activés pour une durée d'un an. Vous recevrez une notification avant l'expiration.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:support@iahome.fr" className="text-green-600 hover:text-green-700">
                support@iahome.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ValidationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <ValidationContent />
    </Suspense>
  );
}

