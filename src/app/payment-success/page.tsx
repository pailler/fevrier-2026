'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [packageInfo, setPackageInfo] = useState<{
    type: string;
    tokens: number;
    price: number;
  } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'failed' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const packageDetails = {
    discovery: { tokens: 1500, price: 4.99, name: 'Pack Découverte' },
    standard: { tokens: 8000, price: 14.99, name: 'Pack Standard' },
    pro: { tokens: 30000, price: 49.99, name: 'Pack Entreprise' },
    // Nouveaux packages V2
    subscription_monthly: { tokens: 3000, price: 9.90, name: 'Abonnement Starter Mensuel', isSubscription: true },
    subscription_yearly: { tokens: 36000, price: 99.00, name: 'Abonnement Starter Annuel', isSubscription: true },
    pack_standard: { tokens: 3000, price: 19.80, name: 'Pack Standard' }
  };

  useEffect(() => {
    console.log('🔍 ===== PAYMENT SUCCESS PAGE CHARGÉE =====');
    console.log('🔍 URL complète:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    
    const packageType = searchParams.get('package');
    // Stripe redirige avec session_id dans l'URL
    const sessionIdParam = searchParams.get('session_id') || 
                          window.location.search.match(/session_id=([^&]+)/)?.[1];
    
    console.log('🔍 Payment Success Page - Paramètres:', {
      packageType,
      sessionIdParam,
      fullUrl: window.location.href,
      searchParams: window.location.search,
      allSearchParams: Object.fromEntries(new URLSearchParams(window.location.search))
    });
    
    if (sessionIdParam) {
      console.log('✅ Session ID trouvé dans l\'URL:', sessionIdParam);
      setSessionId(sessionIdParam);
      // Vérifier la session automatiquement après un court délai
      // pour laisser le temps au webhook d'arriver
      setTimeout(() => {
        verifySession(sessionIdParam);
      }, 2000);
    } else {
      console.warn('⚠️ Aucun session_id dans l\'URL - La redirection ne vient probablement pas de Stripe');
      console.warn('⚠️ Cela signifie que le paiement n\'a peut-être pas été complété sur Stripe Checkout');
      setVerificationStatus('failed');
    }
    
    if (packageType && packageDetails[packageType as keyof typeof packageDetails]) {
      const details = packageDetails[packageType as keyof typeof packageDetails];
      setPackageInfo({
        type: details.name,
        tokens: details.tokens,
        price: details.price
      });
    }
  }, [searchParams]);

  const verifySession = async (sessionId: string) => {
    setVerificationStatus('checking');
    try {
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      
      if (data.verified) {
        setVerificationStatus('verified');
        if (data.action === 'tokens_credited') {
          console.log('✅ Tokens crédités via vérification manuelle:', data);
        }
      } else {
        setVerificationStatus('failed');
        console.error('❌ Vérification échouée:', data);
      }
    } catch (error) {
      setVerificationStatus('failed');
      console.error('❌ Erreur vérification session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Merci pour votre achat. Vos tokens ont été crédités sur votre compte.
            </p>

            {verificationStatus === 'checking' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  🔄 Vérification du paiement en cours...
                </p>
              </div>
            )}

            {verificationStatus === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  ✅ Paiement vérifié et tokens crédités avec succès !
                </p>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold mb-2">
                  ⚠️ Problème détecté
                </p>
                {!sessionId ? (
                  <div>
                    <p className="text-yellow-800 mb-2">
                      Aucun session_id trouvé dans l'URL. Cela signifie que vous n'avez probablement pas été redirigé depuis Stripe Checkout.
                    </p>
                    <p className="text-yellow-700 text-sm mb-2">
                      Le paiement n'a peut-être pas été complété. Vérifiez dans Stripe Dashboard → Checkout → Sessions si une session a été créée.
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Si vous avez un session_id (commence par cs_live_), vous pouvez le vérifier manuellement avec le script PowerShell.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-yellow-800 mb-2">
                      La vérification automatique a échoué. Les tokens seront crédités via le webhook.
                    </p>
                    <button
                      onClick={() => verifySession(sessionId)}
                      className="mt-2 text-sm text-yellow-900 underline hover:no-underline"
                    >
                      Réessayer la vérification
                    </button>
                  </div>
                )}
              </div>
            )}

            {packageInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  {packageInfo.type}
                </h2>
                <div className="space-y-1 text-green-700">
                  <p>💰 Montant payé : {packageInfo.price}€</p>
                  <p>🪙 Tokens {packageInfo.type.includes('Abonnement') ? 'par mois' : 'crédités'} : {packageInfo.tokens}</p>
                  {packageInfo.type.includes('Abonnement') && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Votre abonnement est actif. Les tokens seront renouvelés automatiquement.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Link
                href="/encours"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Voir mes tokens
              </Link>
              <div className="text-sm text-gray-500">
                <Link href="/pricing2" className="text-blue-600 hover:underline">
                  Retour aux offres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}