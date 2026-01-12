'use client';
import { useState } from 'react';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface StripeButton2Props {
  packageType: 'subscription_monthly' | 'subscription_yearly' | 'pack_standard';
  className?: string;
  children: React.ReactNode;
}

export default function StripeButton2({ packageType, className, children }: StripeButton2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useCustomAuth();

  const handlePayment = async () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Début du paiement:', { packageType, userId: user?.id, userEmail: user?.email });

      const response = await fetch('/api/stripe/create-checkout-session-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      console.log('📡 Réponse API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur HTTP:', errorData);
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Données reçues:', data);
      console.log('📦 Type de data:', typeof data);
      console.log('📦 data.url existe ?', !!data.url);
      console.log('📦 data.url valeur:', data.url);

      if (data.url && data.url.startsWith('https://checkout.stripe.com')) {
        console.log('✅ Redirection vers Stripe:', data.url);
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else if (data.url) {
        console.error('⚠️ URL reçue mais ne semble pas être une URL Stripe:', data.url);
        console.error('📦 Données complètes:', JSON.stringify(data, null, 2));
        alert(`Erreur: URL de paiement invalide. URL reçue: ${data.url}`);
      } else {
        console.error('❌ URL manquante dans la réponse');
        console.error('📦 Données complètes reçues:', JSON.stringify(data, null, 2));
        console.error('📦 Status de la réponse:', response.status);
        alert(`Erreur: URL de paiement manquante. Vérifiez la console pour plus de détails.`);
      }
    } catch (error) {
      console.error('❌ Erreur paiement:', error);
      alert(`Erreur lors du traitement du paiement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
