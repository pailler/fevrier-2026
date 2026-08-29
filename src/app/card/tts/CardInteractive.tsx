'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';
import { isBrowserLocalIahomeDev } from '../../../utils/isBrowserLocalIahomeDev';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TTS_CARD: Card = {
  id: 'tts',
  title: 'Synthèse vocale IA (TTS)',
  description:
    'Convertissez du texte en voix naturelle avec Coqui XTTS v2 : 58 voix, 17 langues, clonage vocal et export WAV/MP3.',
  category: 'IA Audio',
  price: 100,
  url: '/card/tts',
  image_url: '/images/whisper.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function getTtsAppUrl(): string {
  return isBrowserLocalIahomeDev() ? 'http://localhost:8101' : 'https://tts.iahome.fr';
}

async function openTtsWithToken(userId: string, userEmail: string) {
  const tokenResponse = await fetch('/api/generate-access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userEmail, moduleId: 'tts' }),
  });
  if (!tokenResponse.ok) {
    const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(tokenError.error || 'Erreur génération token');
  }
  const tokenData = await tokenResponse.json();
  if (!tokenData?.token) throw new Error('Token d\'accès manquant');
  const base = getTtsAppUrl();
  const separator = base.includes('?') ? '&' : '?';
  window.open(`${base}${separator}token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
}

export default function TtsPage({ initialModule }: CardInteractiveProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);
  const [loading, setLoading] = useState(!initialModule);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);

  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, userId: user.id }),
      });
      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch {
      // ignore
    }
    return false;
  }, [user?.id]);

  useEffect(() => {
    const fetchCardDetails = async () => {
      if (initialModule) {
        setCard(initialModule);
        setLoading(false);
        return;
      }
      try {
        if (initialModule) {
          setCard(initialModule);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.from('modules').select('*').eq('id', 'tts').single();
        setCard(error || !data ? DEFAULT_TTS_CARD : data);
      } catch {
        setCard(DEFAULT_TTS_CARD);
      } finally {
        setLoading(false);
      }
    };
    fetchCardDetails();
  }, []);

  useEffect(() => {
    const checkActivation = async () => {
      if (card?.id && user?.id) {
        const isActivated = await checkModuleActivation(card.id);
        if (isActivated) setAlreadyActivatedModules((prev) => [...new Set([...prev, card.id])]);
      }
    };
    checkActivation();
  }, [card?.id, user?.id, checkModuleActivation]);

  const handleAccess = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent('/card/tts')}`);
      return;
    }
    try {
      const response = await fetch('/api/activate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const result = await response.json();
      if (!result.success) {
        alert(`Erreur lors de l'accès: ${result.error}`);
        return;
      }
      setAlreadyActivatedModules((prev) => [...new Set([...prev, 'tts'])]);
      await openTtsWithToken(user.id, user.email);
    } catch (error) {
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Applications', href: '/applications' },
            { label: card.title },
          ]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-bounce" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Synthèse vocale IA : texte en voix naturelle avec XTTS v2
              </h1>
              <span className="inline-block px-4 py-2 bg-white/60 text-green-900 text-sm font-bold rounded-full mb-4">
                {(card.category || 'IA AUDIO').toUpperCase()}
              </span>
              <p className="text-xl text-gray-700 mb-6">{card.description}</p>
              <div className="flex flex-wrap gap-3">
                {['🗣️ 58 voix', '🌍 17 langues', '🎵 WAV / MP3', '🎙️ Clonage vocal'].map((tag) => (
                  <span key={tag} className="bg-white/70 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-2 border-green-200">
                <span className="text-7xl">🗣️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="aspect-video bg-gradient-to-br from-yellow-50 to-green-100 rounded-xl flex items-center justify-center">
              <span className="text-8xl">🔊</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Service hébergé sur <strong>tts.iahome.fr</strong> — modèle open source Coqui XTTS v2
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-900">
              <p className="font-semibold">100 crédits par accès</p>
              <p className="text-sm mt-1 opacity-90">Utilisez l&apos;application aussi longtemps que vous le souhaitez pendant la session.</p>
            </div>

            <button
              type="button"
              onClick={handleAccess}
              className="w-full font-semibold py-6 px-8 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2"
            >
              <span className="text-lg font-bold">
                {isAuthenticated ? 'Accéder à la synthèse vocale' : 'Connectez-vous pour accéder'}
              </span>
              <span className="text-sm text-white/95">100 crédits · tts.iahome.fr</span>
            </button>

            {alreadyActivatedModules.includes('tts') && isAuthenticated && user && (
              <button
                type="button"
                onClick={() => openTtsWithToken(user.id, user.email)}
                className="w-full py-3 rounded-xl border-2 border-green-600 text-green-700 font-semibold hover:bg-green-50"
              >
                Rouvrir l&apos;application TTS
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <article className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos de la synthèse vocale IA</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Cette application utilise <strong>Coqui XTTS v2</strong>, un modèle open source de synthèse vocale
                multilingue. Elle convertit votre texte en audio naturel avec choix de voix, réglages de vitesse
                et hauteur, clonage vocal optionnel, et export WAV 44,1 kHz ou MP3.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>58 voix prédéfinies Coqui</li>
                <li>17 langues dont le français, l&apos;anglais, l&apos;espagnol, l&apos;allemand…</li>
                <li>Clonage vocal à partir d&apos;un échantillon WAV (3–10 s)</li>
                <li>Interface IAHome avec bannière et contrôles intuitifs</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <CardPageActivationSection
        moduleId="tts"
        moduleName="Synthèse vocale IA (TTS)"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-tts"
        gradientColors="from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700"
        icon="🗣️"
        isModuleActivated={alreadyActivatedModules.includes('tts')}
        accessUrl={getTtsAppUrl()}
      />
    </div>
  );
}
