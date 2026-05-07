'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import CardPageActivationSection from '@/components/CardPageActivationSection';

export default function VoteCardPage() {
  const [voteAppUrl, setVoteAppUrl] = useState('https://vote.iahome.fr');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setVoteAppUrl('http://localhost:7890');
    }
  }, []);

  const moduleData = {
    id: 'vote',
    title: 'Vote en ligne',
    subtitle: 'Scrutins avec PIN organisateur et QR code',
    description:
      'Créez un vote simple : nom du scrutin et liste des participants. Un code PIN à 4 chiffres (comme le Photobooth) protège l’administration ; un lien public et un QR code permettent de voter. Une participation par appareil, données sur Supabase.',
    category: 'OUTILS ÉVÉNEMENT',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: moduleData.title }]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Vote en ligne avec QR code
              </h1>
              <span className="inline-block px-4 py-2 bg-white/15 text-white text-sm font-bold rounded-full mb-4">
                {moduleData.category}
              </span>
              <p className="text-xl text-indigo-100 mb-6">{moduleData.description}</p>
              <p className="text-indigo-200 mb-6">{moduleData.subtitle}</p>
            </div>

            <div className="bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4">Fonctionnalités</h2>
              <ul className="space-y-3 text-indigo-100">
                <li>🔐 Administration protégée par code PIN (4 chiffres)</li>
                <li>📱 Page publique et QR pour les votants</li>
                <li>☁️ Stockage Supabase</li>
                <li>✋ Un vote par appareil</li>
              </ul>
              <div className="mt-6 text-sm text-indigo-200">
                Application : <span className="font-medium text-white">vote.iahome.fr</span>
                <span className="mx-2">·</span>
                Port Docker local : <span className="font-mono">7890</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="vote"
        moduleName="Vote en ligne"
        tokenCost={50}
        tokenUnit="par accès organisateur (création et suivi des votes)"
        apiEndpoint="/api/activate-module"
        accessUrl={voteAppUrl}
        gradientColors="from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        icon="🗳️"
      />
    </div>
  );
}
