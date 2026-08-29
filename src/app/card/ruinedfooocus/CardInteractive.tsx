'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginHrefFromWindow } from '@/utils/loginRedirect';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import ModuleAccessButton from '../../../components/ModuleAccessButton';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
import CardPageActivationSection from '../../../components/CardPageActivationSection';
import RuinedFooocusPromptGuide from '../../../components/RuinedFooocusPromptGuide';
import { RUINEDFOOOCUS_APP_URL } from '@/utils/productLandingHosts';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  youtube_url?: string;
  image_url?: string;
  features?: string[];
  requirements?: string[];
  installation_steps?: string[];
  usage_examples?: string[];
  documentation_url?: string;
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function RuinedFooocusPage({ initialModule }: CardInteractiveProps) {
  const router = useRouter();
  const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);
  const [loading, setLoading] = useState(!initialModule);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: any}>({});
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [quickAccessAttempted, setQuickAccessAttempted] = useState(false);

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // RuinedFooocus est payant

  // Vérifier la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer les abonnements de l'utilisateur et vérifier l'accès du module
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        // Vérifier les souscriptions existantes
        let { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true);

        if (accessError) {
          setUserSubscriptions({});
          return;
        }

        const subscriptions: {[key: string]: any} = {};
        
        for (const access of accessData || []) {
          try {
            const moduleKey = `module_${access.module_id}`;
            subscriptions[moduleKey] = {
              module_id: access.module_id,
                access: {
                id: access.id,
                created_at: access.created_at,
                access_level: access.access_level,
                is_active: access.is_active
              }
            };
          } catch (error) {
            continue;
          }
        }

        setUserSubscriptions(subscriptions);
      } catch (error) {
        setUserSubscriptions({});
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  // Charger les modules sélectionnés depuis le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCards');
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
          .eq('id', 'ruinedfooocus')
          .single();

        if (error) {
          router.push('/');
          return;
        }

        if (data) {
          setCard(data);
          }
      } catch (error) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [router]);


  const isCardSelected = (cardId: string) => {
    if (!cardId) return false;
    return selectedCards.some(card => card.id === cardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">chargement</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carte non trouvée</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: card?.title || 'Chargement...' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour RuinedFooocus */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 py-8 relative overflow-hidden">
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
                RuinedFooocus : génération d'images IA simple et précise
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI GENERATION').toUpperCase()}
              </span>
              <p className="text-xl text-purple-100 mb-6">
                Créez des images de haute qualité avec RuinedFooocus. Combinaison des meilleurs aspects de Stable Diffusion et Midjourney. Génération d'images par IA simple, précise et rapide. Support CPU, NVIDIA, DirectML, ROCm, macOS. Parfait pour artistes, designers et créateurs de contenu.
              </p>
              
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Génération d'images
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 IA avancée
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Haute performance
                </span>
              </div>
              
              {/* Plateformes supportées */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 text-center">Bénéficiez à distance des plateformes suivantes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-gray-100/30 text-white px-3 py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
                    CPU
                  </div>
                  <div className="bg-green-500/80 text-white px-3 py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
                    NVIDIA
                  </div>
                  <div className="bg-blue-500/80 text-white px-3 py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
                    DirectML
                  </div>
                  <div className="bg-red-500/80 text-white px-3 py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
                    ROCm
                  </div>
                  <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
                    macOS
                  </div>
                </div>
              </div>
            </div>
            
            {/* Logo RuinedFooocus animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo IA centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-purple-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Cerveau stylisé */}
                      <path 
                        d="M12 2 C8 2 4 4 4 8 C4 12 8 14 12 14 C16 14 20 12 20 8 C20 4 16 2 12 2 Z" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M8 6 C8 8 10 10 12 10 C14 10 16 8 16 6" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M6 10 C6 12 8 14 10 14" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M18 10 C18 12 16 14 14 14" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      
                      {/* Particules d'IA */}
                      <circle cx="6" cy="6" r="1" fill="#8B5CF6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="6" r="1" fill="#8B5CF6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="6" cy="18" r="1" fill="#8B5CF6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                      <circle cx="18" cy="18" r="1" fill="#8B5CF6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo RuinedFooocus - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="arKVdeaLDNQ"
            title="Démonstration RuinedFooocus"
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Bouton d'accès avec crédits */}
                <div className="w-3/4 mx-auto">
                  <ModuleAccessButton
                    moduleId="ruinedfooocus"
                    moduleName={card.title}
                    moduleCost={100}
                    moduleDescription={card.description}
                    accessUrl={RUINEDFOOOCUS_APP_URL}
                    onAccessSuccess={() => {
                      alert(`✅ Application ${card.title} accessible avec succès !`);
                    }}
                    onAccessError={(error) => {
                      console.error('Erreur accès:', error);
                    }}
                  />
                </div>

                {/* Bouton "Accéder maintenant" pour les modules payants */}
                {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = loginHrefFromWindow();
                        return;
                      }

                      try {
                        const response = await fetch('/api/create-payment-intent', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            items: [card],
                            customerEmail: user?.email || '',
                            type: 'payment',
                            testMode: false, // Mode production accessible
                          }),
                        });

                        if (!response.ok) {
                          throw new Error(`Erreur HTTP ${response.status}`);
                        }

                        const { url, error } = await response.json();

                        if (error) {
                          throw new Error(`Erreur API: ${error}`);
                        }

                        if (url) {
                          window.location.href = url;
                        } else {
                          throw new Error('URL de session Stripe manquante.');
                        }
                      } catch (error) {
                        alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                      }
                    }}
                  >
                    <span className="text-xl">💳</span>
                    <span>Accéder maintenant {card.title}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-blue-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-purple-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-4">
                  À propos de RuinedFooocus
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-2xl border-l-4 border-purple-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>RuinedFooocus est un modèle d'intelligence artificielle révolutionnaire qui combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe.</strong> Cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Avec support multi-plateformes (CPU, NVIDIA, DirectML, ROCm, macOS), interface simple et intuitive, et génération rapide, c'est l'outil idéal pour artistes, designers et créateurs de contenu qui veulent créer des visuels uniques et créatifs.
                  </p>
                </div>

                {/* H2 - À quoi sert RuinedFooocus ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    À quoi sert RuinedFooocus ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      RuinedFooocus permet de créer des images de haute qualité à partir de descriptions textuelles avec une précision et une créativité exceptionnelles. Il répond aux besoins de ceux qui souhaitent générer des visuels uniques, créer des concepts artistiques, ou produire des images professionnelles avec une interface simple et intuitive.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Créer des images personnalisées :</strong> Générez des visuels uniques à partir de descriptions textuelles détaillées avec une interface simple</li>
                      <li className="text-lg"><strong>Combiner les meilleures technologies :</strong> Bénéficiez des forces de Stable Diffusion et Midjourney en une seule expérience</li>
                      <li className="text-lg"><strong>Produire du contenu visuel :</strong> Créez des images pour vos projets marketing, publicitaires ou créatifs rapidement</li>
                      <li className="text-lg"><strong>Accéder depuis n'importe quelle plateforme :</strong> Utilisez CPU, NVIDIA, DirectML, ROCm, ou macOS selon votre configuration</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Créez des concepts visuels pour vos projets artistiques, générez des visuels uniques pour vos campagnes marketing, créez des mockups de produits, produisez des supports pédagogiques, explorez de nouveaux styles artistiques, ou visualisez des concepts complexes.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire RuinedFooocus ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Que peut faire RuinedFooocus ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">Génération text-to-image</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Transformez vos idées en images en décrivant simplement ce que vous voulez voir. Plus votre description est détaillée, plus le résultat sera précis. Interface simple et intuitive pour une expérience fluide.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                      <h3 className="text-2xl font-bold text-indigo-900 mb-4">Combinaison Stable Diffusion et Midjourney</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Bénéficiez des meilleurs aspects de Stable Diffusion et Midjourney en une seule expérience. Qualité professionnelle, génération rapide, et résultats exceptionnels.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">Support multi-plateformes</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Accédez depuis CPU, NVIDIA GPU (CUDA), DirectML (AMD/Intel), ROCm (AMD), ou macOS (Metal). Bénéficiez à distance de ces plateformes depuis votre navigateur pour une accessibilité maximale.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-4">Résolution haute définition</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Générez des images jusqu'à 1024x1024 pixels avec une qualité professionnelle adaptée à tous vos projets. Les images générées rivalisent avec celles créées par des artistes professionnels.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser RuinedFooocus ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser RuinedFooocus ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à RuinedFooocus</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Accédez à RuinedFooocus avec 100 crédits. L'accès est immédiat, le service est accessible depuis vos applications via iahome.fr/ruinedfooocus.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Décrire votre image</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Entrez une description textuelle détaillée de l'image que vous souhaitez créer. Plus votre description est précise et détaillée, plus le résultat sera fidèle à vos attentes. L'interface simple rend la création accessible à tous.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Ajuster les paramètres</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Ajustez les paramètres de génération si nécessaire : style, composition, ambiance, résolution. Le contrôle artistique vous permet d'influencer chaque aspect de votre création selon vos préférences.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border border-cyan-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Générer et télécharger</h3>
                          <p className="text-gray-700 leading-relaxed">
                            L'IA génère automatiquement votre image en quelques secondes grâce à notre infrastructure haute performance. Vous pouvez ensuite télécharger l'image générée, la réutiliser, ou générer de nouvelles variations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait RuinedFooocus ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait RuinedFooocus ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Artistes et designers</h3>
                      <p className="text-gray-700">Créez des concepts visuels, des illustrations personnalisées, et explorez de nouveaux styles artistiques pour vos projets créatifs avec une interface simple.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-indigo-900 mb-2">Marketing et publicité</h3>
                      <p className="text-gray-700">Générez des visuels uniques pour vos campagnes, des mockups de produits, et des contenus visuels engageants rapidement et facilement.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Éducation et recherche</h3>
                      <p className="text-gray-700">Visualisez des concepts complexes, créez des supports pédagogiques, et explorez les possibilités de l'IA générative avec une interface accessible.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - RuinedFooocus vs autres générateurs d'images */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    RuinedFooocus vs autres générateurs d'images
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">RuinedFooocus</th>
                            <th className="border border-gray-300 p-4 text-center">Autres générateurs</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Technologie</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Stable Diffusion + Midjourney</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Une seule technologie</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Interface</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Simple et intuitive</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent complexe</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Support plateformes</td>
                            <td className="border border-gray-300 p-4 text-center">✅ CPU, NVIDIA, DirectML, ROCm, macOS</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Support limité</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Qualité</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Professionnelle (1024x1024)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon le service</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Abonnements mensuels souvent chers</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> RuinedFooocus offre une alternative simple et puissante aux autres générateurs d'images. Contrairement aux services qui utilisent une seule technologie ou qui ont une interface complexe, RuinedFooocus combine les meilleurs aspects de Stable Diffusion et Midjourney dans une interface simple et intuitive, avec un support multi-plateformes pour une accessibilité maximale. C'est la solution idéale pour ceux qui veulent créer des images de haute qualité avec une expérience utilisateur fluide.
                    </p>
                  </div>
                </div>

                {/* Guide prompt — chargé uniquement à l'ouverture (pas dans le HTML initial) */}
                <RuinedFooocusPromptGuide />

                {/* H2 - Questions fréquentes sur RuinedFooocus (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur RuinedFooocus (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que RuinedFooocus ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        RuinedFooocus est un modèle d'intelligence artificielle révolutionnaire qui combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe. Cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser RuinedFooocus ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser RuinedFooocus, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via iahome.fr/ruinedfooocus. Entrez une description textuelle détaillée de l'image que vous souhaitez créer, ajustez les paramètres de génération (style, composition, ambiance) si nécessaire, et l'IA génère automatiquement votre image. Plus votre description est détaillée, plus le résultat sera précis.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la différence entre RuinedFooocus et Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        RuinedFooocus combine les meilleurs aspects de Stable Diffusion et Midjourney en une expérience fluide et de pointe. Alors que Stable Diffusion est un modèle puissant, RuinedFooocus offre une interface plus simple et intuitive, avec une combinaison optimale des forces des deux technologies. L'expérience utilisateur est plus fluide, avec des résultats de qualité professionnelle et une génération plus rapide.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">RuinedFooocus est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'accès de RuinedFooocus coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération text-to-image, contrôle artistique avancé, résolution jusqu'à 1024x1024, support multi-plateformes, et interface intuitive. Il n'y a pas de frais supplémentaires pour la génération d'images.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles plateformes sont supportées par RuinedFooocus ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        RuinedFooocus supporte une large gamme de plateformes : CPU (tous les processeurs modernes), NVIDIA GPU (avec accélération CUDA), DirectML (AMD et Intel sur Windows), ROCm (AMD sur Linux et Windows), et macOS (avec optimisation Metal Performance Shaders). Vous pouvez bénéficier à distance de ces plateformes depuis votre navigateur, garantissant une accessibilité maximale et des performances optimales.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Combien de temps prend la génération d'une image avec RuinedFooocus ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Grâce à notre infrastructure haute performance et au support multi-plateformes, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Le temps de génération dépend de la complexité de la description, de la résolution choisie, et de la plateforme utilisée, mais généralement, une image est générée en moins d'une minute.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-lime-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait RuinedFooocus ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        RuinedFooocus est fait pour plusieurs types d'utilisateurs : artistes et designers qui créent des concepts visuels et explorent de nouveaux styles artistiques, professionnels du marketing et de la publicité qui génèrent des visuels uniques pour leurs campagnes, créateurs de contenu qui ont besoin d'images personnalisées, et toute personne qui veut créer des images de haute qualité avec une interface simple et intuitive.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    RuinedFooocus est un modèle d'intelligence artificielle révolutionnaire qui combine les meilleurs aspects de Stable Diffusion et Midjourney 
                    en une expérience fluide et de pointe. Cette technologie de pointe vous permet de créer des visuels uniques et créatifs en quelques secondes, 
                    en tirant parti des forces de ces deux géants de la génération d'images par IA.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que RuinedFooocus */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Qu'est-ce que RuinedFooocus ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        RuinedFooocus est un modèle de génération d'images par diffusion stable, développé pour offrir 
                        une expérience de création d'images par IA exceptionnelle. Cette technologie révolutionnaire 
                        utilise l'apprentissage profond pour créer des images photoréalistes à partir de descriptions textuelles détaillées.
                      </p>
                      <p className="text-base leading-relaxed">
                        Contrairement aux générateurs d'images traditionnels, RuinedFooocus excelle dans la création d'œuvres 
                        artistiques, de portraits, de paysages et d'illustrations avec un niveau de détail et de réalisme exceptionnel. 
                        Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir RuinedFooocus */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Pourquoi choisir RuinedFooocus ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Qualité exceptionnelle :</strong> Les images générées rivalisent avec celles créées par des artistes professionnels, 
                        avec une attention particulière aux détails, à la composition et à l'esthétique.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Flexibilité créative :</strong> Du photoréalisme à l'art abstrait, en passant par les styles artistiques 
                        classiques, RuinedFooocus s'adapte à tous vos besoins créatifs.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Performance optimisée :</strong> Grâce à notre infrastructure haute performance, vous obtenez des résultats 
                        en quelques secondes, même pour les images les plus complexes.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Génération text-to-image :</strong> Transformez vos idées en images en décrivant simplement ce que vous voulez voir. 
                        Plus votre description est détaillée, plus le résultat sera précis.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Contrôle artistique :</strong> Ajustez les paramètres de génération pour influencer le style, la composition, 
                        et l'ambiance de vos créations selon vos préférences.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Résolution haute définition :</strong> Générez des images jusqu'à 1024x1024 pixels avec une qualité 
                        professionnelle adaptée à tous vos projets.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-cyan-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Artistes et designers :</strong> Créez des concepts visuels, des illustrations personnalisées, 
                        et explorez de nouveaux styles artistiques pour vos projets créatifs.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Marketing et publicité :</strong> Générez des visuels uniques pour vos campagnes, 
                        des mockups de produits, et des contenus visuels engageants.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Éducation et recherche :</strong> Visualisez des concepts complexes, créez des supports pédagogiques, 
                        et explorez les possibilités de l'IA générative.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Plateformes supportées */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-8 rounded-2xl border border-teal-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-teal-900">Bénéficiez à distance des plateformes suivantes</h4>
                    </div>
                    <div className="space-y-6 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        RuinedFooocus vous permet de bénéficier à distance d'une large gamme de plateformes de calcul, garantissant une accessibilité maximale 
                        et des performances optimales selon votre configuration matérielle, le tout depuis votre navigateur.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-md">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-lg">CPU</span>
                            </div>
                            <h5 className="text-lg font-bold text-gray-900">Processeur</h5>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Compatible avec tous les processeurs modernes, idéal pour les utilisateurs occasionnels.
                          </p>
                        </div>
                        
                        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-md">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-sm">NVIDIA</span>
                            </div>
                            <h5 className="text-lg font-bold text-gray-900">NVIDIA GPU</h5>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Optimisé pour les cartes graphiques NVIDIA avec accélération CUDA pour des performances maximales.
                          </p>
                        </div>
                        
                        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-md">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-xs">DirectML</span>
                            </div>
                            <h5 className="text-lg font-bold text-gray-900">DirectML</h5>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Support Microsoft DirectML pour les cartes graphiques AMD et Intel sur Windows.
                          </p>
                        </div>
                        
                        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-md">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-sm">ROCm</span>
                            </div>
                            <h5 className="text-lg font-bold text-gray-900">ROCm</h5>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Support AMD ROCm pour les cartes graphiques AMD sur Linux et Windows.
                          </p>
                        </div>
                        
                        <div className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-md">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-sm">macOS</span>
                            </div>
                            <h5 className="text-lg font-bold text-gray-900">macOS</h5>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Support natif pour macOS avec optimisation Metal Performance Shaders.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chapitre 6: Sécurité et éthique */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">6</span>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900">Sécurité et éthique</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Filtres de contenu :</strong> Notre système intègre des filtres avancés pour prévenir la génération 
                        de contenu inapproprié ou nuisible, garantissant un environnement créatif sûr.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Respect des droits :</strong> Nous encourageons l'utilisation éthique de l'IA et le respect 
                        des droits de propriété intellectuelle dans toutes les créations.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Transparence :</strong> Nous nous engageons à être transparents sur les capacités et les limitations 
                        de notre technologie pour une utilisation responsable.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Créativité</h4>
                      <p className="text-gray-700 text-sm">Libérez votre imagination avec des outils de génération d'images avancés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Génération rapide d'images haute qualité avec notre infrastructure optimisée.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Sécurité</h4>
                      <p className="text-gray-700 text-sm">Filtres de contenu et utilisation éthique garantis.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <h4 className="font-bold text-cyan-900 mb-3 text-lg">Accessibilité</h4>
                      <p className="text-gray-700 text-sm">Interface intuitive accessible à tous les niveaux d'expertise.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">⚙️</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Configuration</h5>
                        <p className="text-gray-600 text-sm">Aucune installation requise</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Liens utiles */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Liens utiles</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://github.com/lllyasviel/Fooocus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🔗</span>
                      GitHub
                    </a>
                    <a
                      href="https://github.com/lllyasviel/Fooocus#readme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">📚</span>
                      Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal pour l'iframe */}
      {iframeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {iframeModal.title}
              </h3>
              <button
                onClick={() => setIframeModal({isOpen: false, url: '', title: ''})}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenu de l'iframe */}
            <div className="flex-1 p-4">
              <iframe
                src={iframeModal.url || ''}
                className="w-full h-full border-0 rounded"
                title={iframeModal.title || 'Module'}
                allowFullScreen
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId="ruinedfooocus"
        moduleName="RuinedFooocus"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        icon="🎨"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        accessUrl={RUINEDFOOOCUS_APP_URL}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'RuinedFooocus',
          userId: userId,
          userEmail: email,
          moduleCost: 100,
          moduleDescription: card?.description
        })}
      />
    </div>
  );
}






