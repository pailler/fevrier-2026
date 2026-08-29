'use client';

import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';
import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import CardPageAccessSection from '../../../components/CardPageAccessSection';
import { isBrowserLocalIahomeDev } from '../../../utils/isBrowserLocalIahomeDev';

const DEFAULT_CARD: CardModuleData = {
  id: 'cv-generator',
  title: 'Générateur de CV IA',
  description:
    'Créez un CV professionnel optimisé pour les ATS avec l\'IA : adaptation au poste, score ATS, lettre de motivation et export PDF.',
  category: 'Productivité',
  price: 100,
  url: '/card/cv-generator',
  image_url: '/images/cv-generator.svg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function getCvAppUrl(): string {
  return isBrowserLocalIahomeDev()
    ? 'http://localhost:3003/cv'
    : 'https://cv.iahome.fr';
}

export default function CvGeneratorCardPage({ initialModule }: CardInteractiveProps) {
  const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);
  const [loading, setLoading] = useState(!initialModule);

  useEffect(() => {
    if (initialModule) {
      setCard(initialModule);
      setLoading(false);
    } else {
      setCard(DEFAULT_CARD);
      setLoading(false);
    }
  }, [initialModule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Applications', href: '/applications' },
              { label: card.title },
            ]}
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 bg-clip-text text-transparent leading-tight mb-4">
                Générateur de CV IA : CV optimisé ATS en quelques minutes
              </h1>
              <span className="inline-block px-4 py-2 bg-white/60 text-indigo-900 text-sm font-bold rounded-full mb-4">
                {(card.category || 'PRODUCTIVITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-gray-700 mb-6">{card.description}</p>
              <div className="flex flex-wrap gap-3">
                {['📄 CV ATS', '✉️ Lettre de motivation', '📥 Export PDF', '🎯 Adaptation poste'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="bg-white/70 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-2 border-indigo-200">
                <span className="text-7xl">📄</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-8xl">📋</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Service hébergé sur <strong>cv.iahome.fr</strong> — propulsé par GPT-4o-mini
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-indigo-900 mb-6">
              <p className="font-semibold">100 crédits par accès</p>
              <p className="text-sm mt-1 opacity-90">
                Générez et affinez votre CV autant que vous le souhaitez pendant la session.
              </p>
            </div>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Import depuis CV existant (PDF, DOCX) ou profil LinkedIn</li>
              <li>• Formulaire guidé (expériences, formation, compétences)</li>
              <li>• Optimisation ATS selon l&apos;offre d&apos;emploi</li>
              <li>• Score ATS et conseils personnalisés</li>
              <li>• 3 modèles visuels + lettre de motivation</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <article className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Remplissez vos informations et collez éventuellement l&apos;annonce visée.</li>
              <li>L&apos;IA rédige un CV structuré avec des bullet points percutants.</li>
              <li>Consultez le score ATS et les conseils d&apos;amélioration.</li>
              <li>Exportez en PDF ou générez une lettre de motivation assortie.</li>
            </ol>
          </article>
        </div>
      </section>

      <CardPageAccessSection
        moduleId="cv-generator"
        moduleName="Générateur de CV IA"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        gradientColors="from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        icon="📄"
        accessUrl={getCvAppUrl()}
      />
    </div>
  );
}
