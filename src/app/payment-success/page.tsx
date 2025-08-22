'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const testMode = searchParams.get('test_mode') === 'true';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<any>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        setError('Session ID manquant');
        setLoading(false);
        return;
      }

      try {
        // Vérifier la session utilisateur
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setError('Utilisateur non connecté');
          setLoading(false);
          return;
        }

        // Appeler l'API pour activer le module
        const response = await fetch('/api/activate-module-after-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            userId: session.user.id,
            userEmail: session.user.email,
            testMode: testMode,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setSuccess(true);
          setModuleInfo(result.moduleInfo);
        } else {
          setError(result.error || 'Erreur lors de l\'activation du module');
        }
      } catch (error) {
        console.error('Erreur lors du traitement du paiement:', error);
        setError('Erreur lors du traitement du paiement');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement du paiement...</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous activons votre module.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur lors du paiement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link 
              href="/"
              className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
            <Link 
              href="/encours"
              className="inline-block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Mes applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Votre module a été activé avec succès.
          </p>
          
          {moduleInfo && (
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Module activé : {moduleInfo.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {moduleInfo.description}
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold">Module maintenant disponible dans vos applications</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link 
              href="/encours"
              className="inline-block w-full bg-green-600 text-white py-4 px-8 rounded-xl hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              <span className="mr-2">📱</span>
              Accéder à mes applications
            </Link>
            
            <Link 
              href="/"
              className="inline-block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Un email de confirmation vous a été envoyé avec les détails de votre achat.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Veuillez patienter.</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
