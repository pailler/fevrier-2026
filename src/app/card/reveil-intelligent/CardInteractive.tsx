import type { CardInteractiveProps } from '@/types/cardModule';
'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ModuleAccessButton from '@/components/ModuleAccessButton';
import CardPageActivationSection from '@/components/CardPageActivationSection';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { supabase } from '@/utils/supabaseClient';
import { getTokenCostForModuleId, FREE_UNLIMITED_ACCESS_LABEL } from '@/utils/tokenActionService';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  image_url?: string;
}

const DEFAULT_REVEIL: Card = {
  id: 'reveil-intelligent',
  title: 'Réveil Intelligent',
  subtitle: 'Messages de réveil selon la météo, le jour et les fériés',
  description:
    'Réveil mobile responsive : alarmes multiples, réveil progressif, messages contextuels adaptés à la météo locale, au jour de la semaine et aux jours fériés français. Simple, sans configuration complexe.',
  category: 'OUTILS QUOTIDIEN',
  price: 0,
  image_url: '/images/reveil-intelligent.svg',
};

export default function ReveilCardPage({ initialModule }: CardInteractiveProps) {
  const { loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<Card>(DEFAULT_REVEIL);
  const [accessUrl, setAccessUrl] = useState('https://reveil-intelligent.iahome.fr');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setAccessUrl('http://localhost:7891');
    }
  }, []);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'reveil-intelligent')
          .single();
        if (!error && data) {
          setCard({
            id: String(data.id),
            title: data.title || DEFAULT_REVEIL.title,
            description: data.description || DEFAULT_REVEIL.description,
            subtitle: data.subtitle,
            category: data.category || DEFAULT_REVEIL.category,
            price: data.price ?? DEFAULT_REVEIL.price,
            image_url: data.image_url || DEFAULT_REVEIL.image_url,
          });
        }
      } catch {
        /* garde DEFAULT_REVEIL */
      }
    };
    void fetchCard();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  const moduleCost = getTokenCostForModuleId('reveil-intelligent');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: card.title }]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Réveil intelligent : météo, semaine et jours fériés
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card.category || 'OUTILS QUOTIDIEN').toUpperCase()}
              </span>
              {card.subtitle ? (
                <>
                  <p className="text-xl text-indigo-100 mb-4">{card.subtitle}</p>
                  <p className="text-lg text-violet-100/95 mb-6 leading-relaxed">{card.description}</p>
                </>
              ) : (
                <p className="text-xl text-indigo-100 mb-6 leading-relaxed">{card.description}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-2">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🌤️ Météo locale
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📅 Jours fériés FR
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎒 Vacances scolaires A/B/C
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📱 Mobile-first
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⏰ Réveil progressif
                </span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="bg-gradient-to-br from-white via-indigo-50 to-violet-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-indigo-500/30">
                <div className="flex flex-col items-center">
                  <span className="text-8xl block">⏰</span>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {card.title}
                    </div>
                    <div className="text-xs text-indigo-600/80 mt-1 font-medium">IAHome · quotidien</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">À propos du Réveil Intelligent</h3>
            <p className="text-gray-700 mb-4">{card.description}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Alarmes multiples avec jours de la semaine personnalisables</li>
              <li>Messages de réveil selon la météo (pluie, froid, soleil…)</li>
              <li>Salutations adaptées au jour et aux jours fériés français</li>
              <li>Réveil progressif et snooze 10 minutes</li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="w-3/4 mx-auto">
              <ModuleAccessButton
                moduleId="reveil-intelligent"
                moduleName={card.title}
                moduleCost={moduleCost}
                moduleDescription={card.description}
                accessUrl={accessUrl}
                onAccessSuccess={() => {}}
                onAccessError={(err) => console.error('Réveil access:', err)}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-200 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">🌤️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Météo au réveil</h4>
              <p className="text-sm text-gray-600">Conseils parapluie, veste ou hydratation selon le temps qu’il fait</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Jours fériés</h4>
              <p className="text-sm text-gray-600">Messages spéciaux pour Noël, 14 juillet, ponts…</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Pensé mobile</h4>
              <p className="text-sm text-gray-600">Interface responsive, boutons larges, mode nuit</p>
            </div>
          </div>
        </div>
      </div>

      <CardPageActivationSection
        moduleId="reveil-intelligent"
        moduleName={card.title}
        tokenCost={moduleCost}
        tokenUnit={FREE_UNLIMITED_ACCESS_LABEL}
        gradientColors="from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        icon="⏰"
        moduleTitle={card.title}
        moduleDescription={card.description}
        accessUrl={accessUrl}
      />
    </div>
  );
}
