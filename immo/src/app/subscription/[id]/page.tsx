'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';

interface Module {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  url?: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Vérification de la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        router.push('/login');
        return;
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        if (!session) {
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Charger les détails du module
  useEffect(() => {
    const fetchModuleDetails = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement du module:', error);
          router.push('/');
          return;
        }

        if (data) {
          setModule(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [params.id, router]);

  const handleStripePayment = async () => {
    if (!session?.user?.id || !module) return;

    try {
      setIsProcessing(true);

      // Créer un intent de paiement Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: module.id,
          userId: session.user.id,
          amount: module.price * 100, // Stripe utilise les centimes
          currency: 'eur',
          moduleTitle: module.title,
          moduleDescription: module.description,
          moduleCategory: module.category,
          moduleUrl: module.url,
          customerEmail: session.user.email
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Rediriger vers Stripe Checkout
      if (response.url) {
        // Redirection directe vers Stripe
        window.location.href = response.url;
      } else {
        // Fallback avec Stripe.js
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        
        const { error: stripeError } = await stripe.redirectToCheckout({
          clientSecret: clientSecret,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      }

    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Module non trouvé</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: module.title, href: `/card/${module.id}` },
              { label: 'Abonnement' }
            ]}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Abonnement {module.title}
            </h1>
            <p className="text-xl text-blue-100">
              Accédez à toutes les fonctionnalités de {module.title}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  €{module.price}
                </div>
                <div className="text-gray-600">
                  Par mois
                </div>
              </div>
            </div>

            {/* Fonctionnalités incluses */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Fonctionnalités incluses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Accès complet à {module.title}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Support technique prioritaire</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Mises à jour automatiques</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Annulation à tout moment</span>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="text-center space-y-4">
              <button
                onClick={handleStripePayment}
                disabled={isProcessing}
                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Traitement...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl">💳</span>
                    <span>Payer avec Stripe</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => router.push(`/card/${module.id}`)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Retour à la page du module
              </button>
            </div>

            {/* Informations de sécurité */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Paiement sécurisé par Stripe • Annulation possible à tout moment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
