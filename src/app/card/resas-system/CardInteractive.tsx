'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ModuleAccessButton from '@/components/ModuleAccessButton';
import CardPageActivationSection from '@/components/CardPageActivationSection';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { supabase } from '@/utils/supabaseClient';
import { getTokenCostForModuleId } from '@/utils/tokenActionService';
import { RESAS_SYSTEM_APP_URL } from '@/utils/productLandingHosts';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  image_url?: string;
}

const DEFAULT_RESAS: Card = {
  id: 'resas-system',
  title: 'Réservation matériel',
  subtitle: 'Calendrier, notifications et suivi des emprunts',
  description:
    'Réservez des matériels (jeux vidéo, équipements) : calendrier de disponibilité en temps réel, notifications automatiques et suivi des emprunts et retours.',
  category: 'OUTILS ÉVÉNEMENT',
  price: 100,
  image_url: '/images/resas-system.svg',
};

export default function ResasSystemCardPage({ initialModule }: CardInteractiveProps) {
  const { loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<Card | null>(DEFAULT_RESAS);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const { data, error } = await supabase.from('modules').select('*').eq('id', 'resas-system').single();
        if (!error && data) {
          setCard({
            id: String(data.id),
            title: data.title || DEFAULT_RESAS.title,
            description: data.description || DEFAULT_RESAS.description,
            subtitle: data.subtitle,
            category: data.category || DEFAULT_RESAS.category,
            price: data.price ?? DEFAULT_RESAS.price,
            image_url: data.image_url || DEFAULT_RESAS.image_url,
          });
        }
      } catch {
        /* garde DEFAULT_RESAS */
      }
    };
    fetchCard();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const moduleCost = getTokenCostForModuleId('resas-system');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-violet-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: card.title }]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-800 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce" />
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Réservation matériel : calendrier et suivi des emprunts
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card.category || 'OUTILS ÉVÉNEMENT').toUpperCase()}
              </span>
              {card.subtitle ? (
                <>
                  <p className="text-xl text-purple-100 mb-4">{card.subtitle}</p>
                  <p className="text-lg text-violet-100/95 mb-6 leading-relaxed">{card.description}</p>
                </>
              ) : (
                <p className="text-xl text-purple-100 mb-6 leading-relaxed">{card.description}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-2">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📅 Calendrier temps réel
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎮 Matériels & équipements
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔔 Notifications
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📦 Suivi emprunts
                </span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-purple-50 to-violet-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-500/30">
                    <div className="flex flex-col items-center">
                      <span className="text-8xl block">📅</span>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {card.title}
                        </div>
                        <div className="text-xs text-purple-600/80 mt-1 font-medium">IAHome · événements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <p className="text-amber-950 font-semibold mb-1">Mode démo</p>
          <p className="text-amber-900 text-sm sm:text-base leading-relaxed">
            Cette application est proposée en version de démonstration pour illustrer les possibilités de réservation de
            matériel. Pour une solution personnalisée adaptée à votre activité,{' '}
            <Link href="/contact" className="font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-900">
              contactez-nous via la page Contact
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">À propos de la réservation matériel</h3>
            <p className="text-gray-700 mb-4">{card.description}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Réservation de matériels (jeux vidéo, équipements)</li>
              <li>Calendrier de disponibilité en temps réel</li>
              <li>Notifications automatiques (email/SMS)</li>
              <li>Suivi des emprunts et retours</li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="space-y-6">
              <div className="w-3/4 mx-auto">
                <ModuleAccessButton
                  moduleId="resas-system"
                  moduleName={card.title}
                  moduleCost={moduleCost}
                  moduleDescription={card.description}
                  accessUrl={RESAS_SYSTEM_APP_URL}
                  onAccessSuccess={() => {}}
                  onAccessError={(err) => console.error('Resas access:', err)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-violet-100 shadow-sm">
              <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-violet-100 text-xl" aria-hidden="true">
                📅
              </span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Calendrier partagé</h4>
                <p className="text-sm text-gray-600">Disponibilités visibles en temps réel</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
              <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-purple-100 text-xl" aria-hidden="true">
                🔔
              </span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Notifications</h4>
                <p className="text-sm text-gray-600">Rappels automatiques par email ou SMS</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-fuchsia-100 shadow-sm">
              <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-fuchsia-100 text-xl" aria-hidden="true">
                📦
              </span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Suivi des emprunts</h4>
                <p className="text-sm text-gray-600">Historique et gestion des retours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-8 w-full">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Accès et tarification
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Utilisez le bouton d&apos;accès pour ouvrir l&apos;application. Les crédits sont débités selon le tarif du
              module ({moduleCost} crédits par accès). Connectez-vous avec votre compte IAHome ; en cas de solde
              insuffisant, rechargez depuis la page Tarifs. L&apos;URL d&apos;accès est sécurisée par token
              (`iahome.fr/resas-system?token=…`).
            </p>
          </div>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="resas-system"
        moduleName={card.title}
        tokenCost={moduleCost}
        tokenUnit="par accès. Utilisez l'application pour la durée de votre événement"
        gradientColors="from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        icon="📅"
        moduleTitle={card.title}
        moduleDescription={card.description}
        accessUrl={RESAS_SYSTEM_APP_URL}
      />
    </div>
  );
}