'use client';

import Link from 'next/link';
import Breadcrumb from '../../../components/Breadcrumb';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function MuseTalkPage() {
  const moduleData = {
    id: 'musetalk',
    title: 'MuseTalk',
    subtitle: 'Lip-sync haute fidélité : vidéo ou image + audio',
    description:
      'MuseTalk (Tencent Lyra Lab) anime le visage d’une vidéo de référence selon une piste audio : ' +
      'doublage, avatars parlants, contenus marketing. Modèle open source (code MIT) ; prévoir un GPU NVIDIA et les poids téléchargés.',
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                MuseTalk : synchronisation labiale pilotée par l’audio
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-sky-100 mb-6">{moduleData.description}</p>
              <p className="text-sky-100">{moduleData.subtitle}</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation locale</h2>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>
                  Dépôt : <span className="font-mono text-xs">gradio-apps/musetalk</span>
                </li>
                <li>Python 3.10, CUDA, FFmpeg dans le PATH (recommandé)</li>
                <li>
                  Exécuter <span className="font-mono">.\scripts\setup-musetalk-local.ps1</span> puis{' '}
                  <span className="font-mono">download_weights.bat</span> dans le dossier MuseTalk
                </li>
                <li>
                  Lancement groupé : <span className="font-mono">.\scripts\start-all-apps.ps1</span> (port{' '}
                  <span className="font-mono">7886</span>)
                </li>
              </ul>
              <div className="mt-6 text-sm text-gray-500">
                URL applicative : <span className="font-medium">musetalk.iahome.fr</span> (prod) /{' '}
                <span className="font-medium">localhost:7886</span> (dev)
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
        apiEndpoint="/api/activate-module"
        accessUrl={
          typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:7886'
            : 'https://musetalk.iahome.fr'
        }
        gradientColors="from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
        icon="🎬"
      />
    </div>
  );
}
