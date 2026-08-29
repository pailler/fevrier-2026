'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  youtube_url?: string;
  url?: string;
  image_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function VoiceIsolationPage({ initialModule }: CardInteractiveProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);
  const [loading, setLoading] = useState(!initialModule);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: any}>({});
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  // Voice Isolation est un module payant (100 crédits)
  const isFreeModule = false;

  // Fonction pour vérifier si un module est déjà accessible
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
    }
    return false;
  }, [user?.id]);

  // Charger les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        const { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (accessError) {
          console.log('⚠️ Table user_applications non trouvée, pas d\'abonnements actifs');
          setUserSubscriptions({});
          return;
        }

        if (accessData) {
          const subscriptions: {[key: string]: any} = {};
          accessData.forEach(access => {
            subscriptions[access.module_id] = {
              status: access.is_active ? 'active' : 'inactive',
              usageCount: access.usage_count || 0
            };
          });
          setUserSubscriptions(subscriptions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  // Vérifier si le module est déjà accessible
  useEffect(() => {
    const checkActivation = async () => {
      if (card?.id && user?.id) {
        setCheckingActivation(true);
        const isActivated = await checkModuleActivation(card.id);
        if (isActivated) {
          setAlreadyActivatedModules(prev => [...prev, card.id]);
        }
        setCheckingActivation(false);
      }
    };

    checkActivation();
  }, [card?.id, user?.id, checkModuleActivation]);

  // Charger les sélections depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedModules');
      if (saved) {
        try {
          setSelectedCards(JSON.parse(saved));
        } catch {
          setSelectedCards([]);
        }
      }
    }
  }, []);

    // Charger les détails de la carte
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
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'voice-isolation')
          .single();

        if (error) {
          console.error('Erreur chargement module:', error);
          router.push('/applications');
          return;
        }

        if (data) {
          setCard(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/applications');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [router]);

  const isModuleActivated = alreadyActivatedModules.includes(card?.id || '');
  const hasActiveSubscription = userSubscriptions[card?.id || '']?.status === 'active';

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

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Module non trouvé</p>
          <button 
            onClick={() => router.push('/applications')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour aux applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Applications', href: '/applications' },
              { label: card?.title || 'Chargement...' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour Voice Isolation */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 py-8 relative overflow-hidden">
        {/* Effet de particules animées */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
        </div>
        
        {/* Effet de vague en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Isolation Vocale par IA : Séparez les sources audio avec Demucs v4
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'IA AUDIO').toUpperCase()}
              </span>
              <p className="text-xl text-purple-100 mb-6">
                {card?.description || 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Basé sur Demucs v4, un modèle d\'IA de pointe pour la séparation de sources audio.'}
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎤 Isolation vocale
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🥁 Séparation batterie
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎸 Extraction basse
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎹 Autres instruments
                </span>
              </div>
            </div>
            
            {/* Logo Voice Isolation animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-pink-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-indigo-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Voice Isolation centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-purple-500/20">
                    <span className="text-6xl">🎤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Image/Demo */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center" role="img" aria-label="Isolation Vocale par IA - Application de séparation audio avec Demucs v4">
              <span className="text-8xl" aria-hidden="true">🎵</span>
            </div>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              {/* Boutons d'action */}
              {isAuthenticated && user ? (
                // Bouton d'accès Voice Isolation (utilisateur connecté)
                <button 
                  onClick={async () => {
                    if (!isAuthenticated || !user) {
                      console.log('❌ Accès Voice Isolation - Utilisateur non connecté');
                      router.push(`/login?redirect=${encodeURIComponent('/card/voice-isolation')}`);
                      return;
                    }

                    try {
                      console.log('🔄 accès Voice Isolation pour:', user.email);
                      
                      const response = await fetch('/api/activate-voice-isolation', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          email: user.email
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        console.log('✅ Voice Isolation accessible avec succès');
                        setAlreadyActivatedModules(prev => [...prev, card?.id || 'voice-isolation']);
                        alert('Voice Isolation accessible avec succès ! Vous pouvez maintenant y accéder depuis vos applications.');
                        const tokenResponse = await fetch('/api/generate-access-token', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: user.id,
                            userEmail: user.email,
                            moduleId: 'voice-isolation',
                          }),
                        });
                        if (!tokenResponse.ok) {
                          const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
                          throw new Error(tokenError.error || 'Erreur génération token');
                        }
                        const tokenData = await tokenResponse.json();
                        if (!tokenData?.token) {
                          throw new Error('Token d\'accès manquant');
                        }
                        window.open(`https://voice-isolation.iahome.fr?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                      } else {
                        console.error('❌ Erreur accès Voice Isolation:', result.error);
                        alert(`Erreur lors de l'accès: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('❌ Erreur accès Voice Isolation:', error);
                      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                    }
                  }}
                  className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Accéder à Voice Isolation</span>
                  <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">100 crédits par accès</span>
                </button>
              ) : (
                // Message pour les utilisateurs non connectés
                <button
                  onClick={() => {
                    // Utilisateur non connecté : aller à la page de connexion puis retour à Voice Isolation
                    console.log('🔒 Accès Voice Isolation - Redirection vers connexion');
                    router.push(`/login?redirect=${encodeURIComponent('/card/voice-isolation')}`);
                  }}
                  className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Connectez-vous pour accéder</span>
                  <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">100 crédits par accès</span>
                </button>
              )}

              {/* Message si déjà accessible */}
              {alreadyActivatedModules.includes(card?.id || '') && (
                <div className="w-3/4 mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-3 text-green-800">
                    <span className="text-2xl">✅</span>
                    <div className="text-center">
                      <p className="font-semibold">Accès direct disponible</p>
                      <p className="text-sm opacity-80">Vous pouvez accéder à cette application depuis vos applications</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      onClick={async () => {
                        if (!user?.id || !user?.email) {
                          router.push(`/login?redirect=${encodeURIComponent('/card/voice-isolation')}`);
                          return;
                        }

                        try {
                          const tokenResponse = await fetch('/api/generate-access-token', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              userEmail: user.email,
                              moduleId: 'voice-isolation',
                            }),
                          });
                          if (!tokenResponse.ok) {
                            const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
                            throw new Error(tokenError.error || 'Erreur génération token');
                          }
                          const tokenData = await tokenResponse.json();
                          if (!tokenData?.token) {
                            throw new Error('Token d\'accès manquant');
                          }
                          window.open(`https://voice-isolation.iahome.fr?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                        } catch (error) {
                          alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                        }
                      }}
                      className="inline-flex flex-col items-center gap-1 px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl transition-colors font-semibold shadow-lg"
                    >
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>Voir mes applications</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" */}
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 w-full relative overflow-hidden" aria-label="Informations sur l'application Isolation Vocale par IA">
        <div className="max-w-7xl mx-auto px-6">
          <article className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos de l'Isolation Vocale par IA</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                L'<strong>Isolation Vocale par IA</strong> est une application révolutionnaire qui utilise le modèle <strong>Demucs v4</strong> (Hybrid Transformer) pour séparer les différentes sources audio d'un enregistrement avec une précision exceptionnelle.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Fonctionnalités principales</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700" itemScope itemType="https://schema.org/ItemList">
                <li itemProp="itemListElement"><strong>🎤 Isolation vocale</strong> : Extrait uniquement la voix d'un enregistrement avec une précision exceptionnelle</li>
                <li itemProp="itemListElement"><strong>🥁 Isolation de batterie</strong> : Sépare la batterie du reste de la piste audio</li>
                <li itemProp="itemListElement"><strong>🎸 Isolation de basse</strong> : Extrait la ligne de basse de manière précise</li>
                <li itemProp="itemListElement"><strong>🎹 Autres instruments</strong> : Isole les autres instruments (guitares, synthés, pianos, etc.)</li>
                <li itemProp="itemListElement"><strong>🎵 Séparation complète</strong> : Extrait toutes les sources (voix, batterie, basse, autres instruments) en une seule fois</li>
                <li itemProp="itemListElement"><strong>📊 Informations du fichier</strong> : Affiche les métadonnées (format, durée, taille) avant traitement</li>
                <li itemProp="itemListElement"><strong>🎧 Prévisualisation</strong> : Écoutez l'original avant de lancer la séparation</li>
                <li itemProp="itemListElement"><strong>📦 Téléchargement en lot</strong> : Téléchargez toutes les sources séparées en une fois</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Formats audio supportés</h3>
              <p className="text-gray-700 mb-4">
                L'application supporte les formats audio suivants : <strong>MP3, WAV, M4A, OGG, FLAC et WMA</strong>. Les formats non supportés nativement par les navigateurs (comme WMA) sont automatiquement convertis en WAV avant traitement pour garantir une compatibilité maximale.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technologie Demucs v4</h3>
              <p className="text-gray-700 mb-4">
                Notre application utilise <strong>Demucs v4 (Hybrid Transformer)</strong>, un modèle d'intelligence artificielle de pointe développé par Meta AI Research. Ce modèle a été entraîné sur des millions d'heures d'audio de qualité professionnelle pour offrir une séparation de sources d'une précision exceptionnelle. L'architecture Hybrid Transformer combine les avantages des réseaux de neurones convolutifs et des transformers pour une performance optimale.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Avantages de Demucs v4 :</strong> Qualité professionnelle, séparation précise même pour des enregistrements complexes, traitement rapide, support de multiples formats audio, et résultats prêts pour le mixage et le mastering.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Pour qui est cette application ?</h3>
              <p className="text-gray-700 mb-4">
                L'Isolation Vocale par IA est parfaite pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Musiciens</strong> : Isolez des instruments pour le remixage, créez des versions instrumentales ou acapella</li>
                <li><strong>Producteurs musicaux</strong> : Séparez les sources pour le mastering, l'édition ou la réorchestration</li>
                <li><strong>Créateurs de contenu</strong> : Extrayez des voix pour des remixes, des mashups ou des créations originales</li>
                <li><strong>Ingénieurs du son</strong> : Utilisez des outils professionnels d'isolation vocale directement en ligne</li>
                <li><strong>Passionnés d'audio</strong> : Explorez et expérimentez avec la séparation de sources audio</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Comparaison avec d'autres outils</h3>
              <p className="text-gray-700 mb-4">
                Contrairement à Spleeter (qui est plus ancien) ou Moises (qui est payant), notre application basée sur <strong>Demucs v4</strong> offre :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Une meilleure qualité de séparation vocale</li>
                <li>Un traitement plus rapide grâce à l'architecture optimisée</li>
                <li>Une interface moderne et intuitive</li>
                <li>Un accès gratuit avec système de crédits</li>
                <li>Un support de multiples formats audio</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId="voice-isolation"
        moduleName="Voice Isolation"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-voice-isolation"
        gradientColors="from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        icon="🎤"
        isModuleActivated={card ? alreadyActivatedModules.includes(card.id) : false}
      />
    </div>
  );
}






