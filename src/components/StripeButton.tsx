'use client';
import { useState } from 'react';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface StripeButtonProps {
  packageType: 'basic' | 'standard' | 'premium' | 'enterprise';
  className?: string;
  children: React.ReactNode;
}

export default function StripeButton({ packageType, className, children }: StripeButtonProps) {
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

      const response = await fetch('/api/stripe/create-checkout-session', {
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

      if (data.url) {
        console.log('✅ Redirection vers Stripe:', data.url);
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('❌ URL manquante dans la réponse:', data);
        alert('Erreur: URL de paiement manquante');
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
