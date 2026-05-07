'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ModuleAccessButton from '@/components/ModuleAccessButton';
import CardPageActivationSection from '@/components/CardPageActivationSection';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { supabase } from '@/utils/supabaseClient';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  image_url?: string;
}

const DEFAULT_VOTE: Card = {
  id: 'vote',
  title: 'Vote en ligne',
  subtitle: 'Scrutins avec code PIN organisateur et QR code',
  description:
    'Créez un vote simple : nom du scrutin et liste des participants. Un code PIN à 4 chiffres (comme le Photobooth) protège l’administration ; un lien public et un QR code permettent de voter. Une participation par appareil, données sur Supabase.',
  category: 'OUTILS ÉVÉNEMENT',
  price: 50,
  image_url: '/iahome-logo.svg',
};

export default function VoteCardPage() {
  const { loading: authLoading } = useCustomAuth();
  const [card, setCard] = useState<Card | null>(DEFAULT_VOTE);
  /** URL applicative — même valeur SSR / 1er rendu client, puis localhost si besoin */
  const [voteAccessUrl, setVoteAccessUrl] = useState('https://vote.iahome.fr');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setVoteAccessUrl('http://localhost:7890');
    }
  }, []);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const { data, error } = await supabase.from('modules').select('*').eq('id', 'vote').single();
        if (!error && data) {
          setCard({
            id: String(data.id),
            title: data.title || DEFAULT_VOTE.title,
            description: data.description || DEFAULT_VOTE.description,
            subtitle: data.subtitle,
            category: data.category || DEFAULT_VOTE.category,
            price: data.price ?? DEFAULT_VOTE.price,
            image_url: data.image_url || DEFAULT_VOTE.image_url,
          });
        }
      } catch {
        /* garde DEFAULT_VOTE */
      }
    };
    fetchCard();
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

  if (!card) {
    return null;
  }

  const moduleCost = typeof card.price === 'string' ? parseInt(String(card.price), 10) || 50 : Number(card.price) || 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: card.title }]} />
        </div>
      </div>

      {/* Bannière — même gabarit que Sentinelle / Animagine (particules, vague, carte centrale + halo) */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce" />
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce" />
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/25 rounded-full animate-pulse" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Vote en ligne : scrutins, PIN organisateur et QR code
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card.category || 'OUTILS ÉVÉNEMENT').toUpperCase()}
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
                  🔐 PIN organisateur (4 chiffres)
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📱 Lien public & QR
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ☁️ Supabase
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🗳️ Un vote par appareil
                </span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-400 rounded-full opacity-80 animate-pulse" />
                <div className="absolute top-16 right-0 w-20 h-20 bg-violet-400 rounded-lg opacity-80 animate-bounce" />
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 rotate-45 opacity-80 animate-pulse" />
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-indigo-50 to-violet-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-50 animate-pulse" />
                        <span className="text-8xl relative z-10 block">🗳️</span>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                          {card.title}
                        </div>
                        <div className="text-xs text-indigo-600/80 mt-1 font-medium">IAHome · événements</div>
                      </div>
                    </div>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">À propos du Vote en ligne</h3>
            <p className="text-gray-700 mb-4">{card.description}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Création du vote : titre + liste des participants (options)</li>
              <li>Code PIN à 4 chiffres pour l’espace organisateur (comme le Photobooth)</li>
              <li>Lien public et QR code pour les votants</li>
              <li>Un vote par appareil (navigateur)</li>
              <li>
                Application dédiée :{' '}
                <span className="font-semibold">vote.iahome.fr</span> — en local Docker, port{' '}
                <span className="font-mono">7890</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              <div className="w-3/4 mx-auto">
                <ModuleAccessButton
                  moduleId="vote"
                  moduleName={card.title}
                  moduleCost={moduleCost}
                  moduleDescription={card.description}
                  accessUrl={voteAccessUrl}
                  onAccessSuccess={() => {}}
                  onAccessError={(err) => console.error('Vote access:', err)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">🔐</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Administration sécurisée</h4>
              <p className="text-sm text-gray-600">Espace organisateur protégé par PIN à 4 chiffres</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📲</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Vote mobile</h4>
              <p className="text-sm text-gray-600">QR code et page web pour voter simplement</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Résultats en direct</h4>
              <p className="text-sm text-gray-600">Suivi des scores pour l’organisateur et écran résultats</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 py-8 w-full">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-violet-900 bg-clip-text text-transparent mb-4">
              Accès et tarification
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilisez le bouton d’accès pour ouvrir l’application avec un jeton sécurisé. Les crédits sont débités
              selon le tarif du module ({moduleCost} crédits par accès). Connectez-vous avec votre compte IAHome ;
              en cas de solde insuffisant, rechargez depuis la page Tarifs.
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
              <p className="font-semibold text-indigo-900 mb-2">Rappel</p>
              <p className="text-indigo-800">
                L’application Vote tourne sur <span className="font-medium">vote.iahome.fr</span> (production) ou{' '}
                <span className="font-mono">localhost:7890</span> en développement local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="vote"
        moduleName={card.title}
        tokenCost={moduleCost}
        tokenUnit="par accès. Utilisez l’application pour la durée de votre événement"
        gradientColors="from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        icon="🗳️"
        moduleTitle={card.title}
        moduleDescription={card.description}
        accessUrl={voteAccessUrl}
      />
    </div>
  );
}
