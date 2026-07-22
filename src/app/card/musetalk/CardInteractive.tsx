'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '../../../components/Breadcrumb';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function MuseTalkPage({ initialModule }: CardInteractiveProps) {
  const moduleData = {
    id: 'musetalk',
    title: 'MuseTalk',
    subtitle: 'Lip-sync haute fidélité : vidéo ou image + audio',
    description:
      'MuseTalk (Tencent Lyra Lab) anime le visage d’une vidéo de référence selon une piste audio : ' +
      'doublage, avatars parlants, contenus marketing. Modèle open source (code MIT) ; bénéficiez de la puissance des ordinateurs de IAHome, sans téléchargement ni installation, tout se passe directement dans votre navigateur',
    category: 'AI VIDEO',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-indigo-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: moduleData.title },
            ]}
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-w-0">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                MuseTalk : synchronisation labiale pilotée par l’audio
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-sky-100 mb-6">{moduleData.description}</p>
              <p className="text-sky-100">{moduleData.subtitle}</p>
            </div>

            {/* Visuel : w-full + min-w-0 évite une largeur 0 en grille (Image fill invisible). */}
            <div className="bg-white rounded-xl shadow-2xl border border-white/50 overflow-hidden w-full max-w-lg min-w-0 mx-auto lg:mx-0 lg:ml-auto">
              <div className="relative w-full aspect-[16/10] min-h-[14rem] sm:min-h-[15rem] overflow-hidden bg-gray-100">
                <Image
                  src="/images/musetalk.jpg"
                  alt={moduleData.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 512px"
                  priority
                  style={{
                    filter: 'brightness(1.1) contrast(1.05) saturate(1.05)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white/95 rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Accès et crédits</h3>
          <p className="text-gray-700 mb-4">
            Comme les autres apps Gradio IAHome : connexion, solde de crédits, ouverture sécurisée avec token
            d’accès.
          </p>
          <p className="text-gray-700">
            Retrouvez l’app dans{' '}
            <Link href="/account" className="text-indigo-700 hover:text-indigo-900 font-medium underline">
              Mon compte
            </Link>{' '}
            après ajout du module dans Supabase (script SQL fourni).
          </p>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="musetalk"
        moduleName="MuseTalk"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        showCostSummaryOnButton={false}
        apiEndpoint="/api/activate-module"
        gradientColors="from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
        icon="🎬"
      />
    </div>
  );
}
