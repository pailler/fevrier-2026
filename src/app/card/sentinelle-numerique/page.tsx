'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import ModuleAccessButton from '../../../components/ModuleAccessButton';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  image_url?: string;
  features?: string[];
}

export default function SentinelleNumeriquePage() {

  const sentinelleModule = {
    id: 'sentinelle-numerique',
    title: 'Sentinelle Numérique',
    subtitle: 'Cybersécurité personnelle et processus de fin de vie numérique',
    description: 'Cybersécurité personnelle et processus de fin de vie numérique: audit sécurité, plan de transmission et actions post-événement.',
    category: 'VIGILANCE NUMÉRIQUE',
    price: '10 crédits',
    image_url: '/images/sentinelle-numerique.jpg',
    features: [
      'Audit de sécurité personnelle',
      'Plan de transmission numérique',
      'Actions post-événement',
      'Processus de fin de vie numérique',
      'Cybersécurité et protection des données',
      'Accompagnement personnalisé'
    ]
  };

  const [card, setCard] = useState<Card | null>(sentinelleModule as Card);
  const [loading, setLoading] = useState(false);

  const isFreeModule = false;

  // Charger les données depuis Supabase si disponible
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'sentinelle-numerique')
          .single();

        if (!error && data) {
          setCard(data);
        }
      } catch {
        // Garder les données par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: card?.title || 'Sentinelle Numérique' }
            ]}
          />
        </div>
      </div>

      {/* Bannière – modèle Animagine XL */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 py-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Sentinelle Numérique : cybersécurité et fin de vie numérique
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'CYBERSÉCURITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-teal-100 mb-6">
                Cybersécurité personnelle et processus de fin de vie numérique: audit sécurité, plan de transmission et actions post-événement.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🛡️ Audit sécurité
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📋 Plan de transmission
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Actions post-événement
                </span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-teal-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-cyan-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-teal-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <span className="text-8xl relative z-10 block">🛡️</span>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                          Sentinelle Numérique
                        </div>
                        <div className="text-xs text-teal-600/80 mt-1 font-medium">
                          Vigilance IA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone vidéo + bouton d'accès – modèle Animagine XL */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">À propos de Sentinelle Numérique</h3>
            <p className="text-gray-700 mb-4">
              Sentinelle Numérique accompagne votre cybersécurité personnelle et le processus de fin de vie numérique: audit sécurité, plan de transmission et actions post-événement. Idéal pour sécuriser votre patrimoine numérique et organiser sa transmission.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Audit de sécurité personnelle</li>
              <li>Plan de transmission numérique</li>
              <li>Actions post-événement</li>
              <li>Accompagnement personnalisé</li>
              <li>10 crédits par accès</li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              <div className="w-3/4 mx-auto">
                <ModuleAccessButton
                  moduleId={card.id}
                  moduleName={card.title}
                  moduleCost={10}
                  moduleDescription={card.description}
                  accessUrl={typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'http://localhost:3000/sentinelle-numerique'
                    : 'https://iahome.fr/sentinelle-numerique'}
                  onAccessSuccess={() => {
                    alert(`✅ Application ${card.title} accessible avec succès !`);
                  }}
                  onAccessError={(error) => {
                    console.error('Erreur accès:', error);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">🛡️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Audit sécurité</h4>
              <p className="text-sm text-gray-600">Évaluez et renforcez votre cybersécurité personnelle</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Plan de transmission</h4>
              <p className="text-sm text-gray-600">Organisez la transmission de votre patrimoine numérique</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">⚡</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Actions post-événement</h4>
              <p className="text-sm text-gray-600">Procédures et accompagnement pour vos proches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section À propos */}
      <section className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 w-full">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-900 to-cyan-900 bg-clip-text text-transparent mb-4">
              À propos de Sentinelle Numérique
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Sentinelle Numérique accompagne votre cybersécurité personnelle et le processus de fin de vie numérique. Audit sécurité, plan de transmission et actions post-événement pour sécuriser et transmettre votre patrimoine numérique.
            </p>
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
              <p className="font-semibold text-teal-900 mb-2">Prix :</p>
              <p className="text-teal-800">10 crédits par accès.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={card?.id || 'sentinelle-numerique'}
        moduleName="Sentinelle Numérique"
        tokenCost={10}
        tokenUnit="par accès"
        gradientColors="from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
        icon="🛡️"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        accessUrl={typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:3000/sentinelle-numerique'
          : 'https://iahome.fr/sentinelle-numerique'}
      />
    </div>
  );
}
