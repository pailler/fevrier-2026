'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginHrefFromWindow } from '@/utils/loginRedirect';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import ModuleAccessButton from '../../../components/ModuleAccessButton';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
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

export default function MeetingReportsPage({ initialModule }: CardInteractiveProps) {
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
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Meeting Reports est un module payant
  const isFreeModule = false;

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = useCallback(async (moduleId: string, moduleUrl: string) => {
    if (!session?.user?.id) {
      alert('Vous devez être connecté pour accéder à ce module.');
      return;
    }

    console.log(`🔗 Tentative d'accès au module ${moduleId} avec l'URL: ${moduleUrl}`);

    try {
      // Générer un token d'accès (décompte crédits inclus)
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      if (response.ok) {
        const { token } = await response.json();
        const separator = moduleUrl.includes('?') ? '&' : '?';
        const urlWithToken = `${moduleUrl}${separator}token=${encodeURIComponent(token)}`;
        console.log(`✅ JWT généré, ouverture de: ${urlWithToken}`);
        window.open(urlWithToken, '_blank');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Erreur lors de la génération du token d\'accès');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [session?.user?.id]);

  // Vérification de la session
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

  // Charger les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        // Utiliser user_applications au lieu de user_subscriptions
        const { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true);

        if (accessError) {
          console.log('⚠️ Table user_applications non trouvée, pas d\'abonnements actifs');
          setUserSubscriptions({});
          return;
        }

        const subscriptionsMap: {[key: string]: any} = {};
        
        for (const access of accessData || []) {
          try {
            subscriptionsMap[access.module_id] = {
              module_id: access.module_id,
              status: access.is_active ? 'active' : 'inactive',
                access: {
                id: access.id,
                created_at: access.created_at,
                access_level: access.access_level,
                is_active: access.is_active
              }
            };
          } catch (error) {
            console.error(`❌ Exception traitement module ${access.module_id}:`, error);
            continue;
          }
        }

        setUserSubscriptions(subscriptionsMap);
      } catch (error) {
        console.log('Erreur lors du chargement des données utilisateur:', error);
        setUserSubscriptions({});
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  // Charger les modules sélectionnés
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
          .eq('id', 'meeting-reports')
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

  // Gérer l'accès rapide pour les modules gratuits
  useEffect(() => {
    if (isFreeModule && card && !quickAccessAttempted && session?.user?.id) {
      setQuickAccessAttempted(true);
      // Pour les modules gratuits, on peut accéder directement
    }
  }, [isFreeModule, card, quickAccessAttempted, session?.user?.id]);


  const handleActivate = async (card: CardModuleData) => {
    if (!session?.user?.id) {
      router.push(loginHrefFromWindow());
      return;
    }

    try {
      setIsActivating(true);
      
      // Appeler l'API pour Accéder à le module Meeting Reports
      const response = await fetch('/api/activate-meeting-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: card.id,
          userId: session.user.id,
          moduleTitle: card.title,
          moduleDescription: card.description,
          moduleCategory: card.category,
          moduleUrl: card.url
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'accès du module');
      }

      // Rediriger vers la page de transition
      handleQuickAccess();
      
    } catch (error) {
      console.error('Erreur lors de l\'accès du module:', error);
      alert('Erreur lors de l\'accès du module. Veuillez réessayer.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleQuickAccess = () => {
    // URL par défaut pour Meeting Reports
    // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const meetingReportsUrl = isDevelopment ? 'http://localhost:3050' : 'https://meeting-reports.iahome.fr';
    const moduleUrl = card?.url || meetingReportsUrl;
    
    accessModuleWithJWT(card?.id || 'meeting-reports', moduleUrl);
  };

  const handleDemo = () => {
    if (card?.demo_url) {
      setIframeModal({
        isOpen: true,
        url: card.demo_url,
        title: `Démo - ${card.title}`
      });
    }
  };

  // Fonction pour vérifier si une carte est sélectionnée
  const isCardSelected = (cardId: string) => {
    return selectedCards.some(card => card.id === cardId);
  };

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
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
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

      {/* Bannière spéciale pour Meeting Reports */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-8 relative overflow-hidden">
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
                Compte rendus IA : transformez vos réunions en rapports professionnels automatiquement
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'PRODUCTIVITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-emerald-100 mb-6">
                Transformez automatiquement vos réunions en rapports professionnels avec Compte rendus IA. Enregistrement audio, transcription automatique avec Whisper, résumé intelligent avec GPT, export PDF. Gain de temps considérable pour équipes et professionnels.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎤 Enregistrement audio
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 Transcription automatique
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 Résumé IA
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📄 Export PDF
                </span>
              </div>

            </div>
            
                {/* Logo Compte rendus IA animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-teal-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-cyan-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Compte rendus IA centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-emerald-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Microphone stylisé */}
                      <path 
                        d="M12 2 C8 2 4 4 4 8 C4 12 8 14 12 14 C16 14 20 12 20 8 C20 4 16 2 12 2 Z" 
                        stroke="#10B981" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M8 6 C8 8 10 10 12 10 C14 10 16 8 16 6" 
                        stroke="#10B981" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 14 L12 20" 
                        stroke="#10B981" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      <path 
                        d="M8 20 L16 20" 
                        stroke="#10B981" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      
                      {/* Document de rapport */}
                      <rect x="2" y="16" width="8" height="6" rx="1" stroke="#10B981" strokeWidth="2" fill="none"/>
                      <path d="M4 18 L6 18 M4 20 L8 20" stroke="#10B981" strokeWidth="1"/>
                      
                      {/* Particules d'IA */}
                      <circle cx="6" cy="6" r="1" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="6" r="1" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="6" cy="18" r="1" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                      <circle cx="18" cy="18" r="1" fill="#10B981" className="animate-pulse">
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

      {/* Vidéo Meeting Reports - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="33-XXG-AI8c"
            title="Démonstration Compte rendus IA"
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
                    moduleId={card?.id || 'meeting-reports'}
                    moduleName={card?.title || 'Compte rendus IA'}
                    moduleCost={100}
                    moduleDescription={card?.description || 'Application Compte rendus IA accessible'}
                    onAccessSuccess={() => {
                      alert(`✅ Application ${card?.title || 'Compte rendus IA'} accessible avec succès !`);
                    }}
                    onAccessError={(error) => {
                      console.error('Erreur accès:', error);
                    }}
                  />
                </div>


                {showActivateButton && (
                  <div className="w-3/4 space-y-3">
                    <button 
                      className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleActivate(card!)}
                      disabled={isActivating}
                    >
                      {isActivating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>accès...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">⚡</span>
                          <span>Accéder à {card?.title}</span>
                        </>
                      )}
                    </button>
                    <button 
                      className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowActivateButton(false)}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-emerald-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-teal-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-4">
                  À propos de Compte rendus IA
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-2xl border-l-4 border-emerald-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>Compte rendus IA est une plateforme d'intelligence artificielle qui transforme automatiquement vos réunions en rapports professionnels détaillés.</strong> Enregistrez vos réunions, uploadez des fichiers audio, et obtenez instantanément des transcriptions précises avec OpenAI Whisper et des résumés intelligents avec GPT. Avec identification des intervenants, extraction des points clés, actions à suivre automatiques, et export PDF professionnel, c'est l'outil idéal pour équipes et professionnels qui veulent automatiser la création de rapports de réunion et gagner un temps considérable.
                  </p>
                </div>

                {/* H2 - À quoi sert Compte rendus IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    À quoi sert Compte rendus IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Compte rendus IA permet de transformer automatiquement vos réunions en rapports professionnels détaillés avec une précision exceptionnelle. Il répond aux besoins de ceux qui souhaitent automatiser la documentation de leurs réunions, gagner du temps, et améliorer la productivité de leur équipe.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Automatiser la documentation :</strong> Plus besoin de prendre des notes manuellement, l'IA capture tout et génère des rapports complets</li>
                      <li className="text-lg"><strong>Gagner du temps :</strong> Transformez vos réunions en rapports professionnels en quelques minutes au lieu de plusieurs heures</li>
                      <li className="text-lg"><strong>Améliorer la précision :</strong> Transcription fidèle avec identification des intervenants et extraction des points clés</li>
                      <li className="text-lg"><strong>Faciliter le suivi :</strong> Extraction automatique des actions à suivre et des décisions prises</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Documentez automatiquement vos réunions d'équipe, stand-ups et réunions de projet, transcrivez vos sessions de formation et créez des supports de cours, enregistrez et analysez vos entretiens pour un suivi précis, ou créez des rapports professionnels pour vos clients et partenaires.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire Compte rendus IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    Que peut faire Compte rendus IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                      <h3 className="text-2xl font-bold text-emerald-900 mb-4">Enregistrement audio</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Enregistrez vos réunions directement depuis l'interface avec un microphone intégré et une qualité audio optimale. Enregistrement en temps réel avec contrôle simple et intuitif.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                      <h3 className="text-2xl font-bold text-teal-900 mb-4">Transcription automatique</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Transcription automatique avec OpenAI Whisper, un modèle de nouvelle génération capable de comprendre la parole avec une précision exceptionnelle. Support de multiples formats audio (MP3, WAV, WebM).
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-4">Résumé intelligent</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'IA génère automatiquement des résumés structurés avec points clés, décisions prises et actions à suivre. Utilise GPT pour une compréhension contextuelle et une extraction intelligente des informations.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">Export professionnel</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Téléchargez vos rapports en PDF ou Markdown avec mise en forme professionnelle. Rapports prêts à partager avec votre équipe, vos clients ou vos partenaires.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser Compte rendus IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser Compte rendus IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à Compte rendus IA</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Accédez à Compte rendus IA avec 100 crédits. L'accès est immédiat, le service est accessible depuis vos applications via meeting-reports.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Enregistrer ou uploader</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Enregistrez vos réunions en temps réel avec le microphone intégré, ou uploadez des fichiers audio existants (MP3, WAV, WebM). L'interface simple rend l'utilisation accessible à tous.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Transcription et résumé automatiques</h3>
                          <p className="text-gray-700 leading-relaxed">
                            L'IA transcrit automatiquement l'audio avec Whisper, puis génère un résumé intelligent avec GPT incluant les points clés, les décisions prises et les actions à suivre. Le processus est entièrement automatique.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Télécharger le rapport</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Téléchargez votre rapport en PDF ou Markdown avec mise en forme professionnelle. Partagez-le avec votre équipe, vos clients ou vos partenaires, ou archivez-le pour référence future.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait Compte rendus IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait Compte rendus IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 text-center">
                      <div className="text-4xl mb-4">💼</div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">Équipes professionnelles</h3>
                      <p className="text-gray-700">Documentez automatiquement vos réunions hebdomadaires, stand-ups et réunions de projet avec des rapports détaillés. Gagnez du temps et améliorez la productivité.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 text-center">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-teal-900 mb-2">Formateurs et conférenciers</h3>
                      <p className="text-gray-700">Transcrivez vos sessions de formation et créez des supports de cours automatiquement. Transformez vos conférences en documents exploitables.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
                      <div className="text-4xl mb-4">🤝</div>
                      <h3 className="text-xl font-bold text-cyan-900 mb-2">Recruteurs et professionnels</h3>
                      <p className="text-gray-700">Enregistrez et analysez vos entretiens pour un suivi précis des candidats et des clients. Créez des rapports professionnels automatiquement.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - Compte rendus IA vs prise de notes manuelle */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    Compte rendus IA vs prise de notes manuelle
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">Compte rendus IA</th>
                            <th className="border border-gray-300 p-4 text-center">Prise de notes manuelle</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Temps de création</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Quelques minutes</td>
                            <td className="border border-gray-300 p-4 text-center">❌ Plusieurs heures</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Précision</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Transcription fidèle (Whisper)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Oublis et erreurs possibles</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Identification intervenants</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Automatique</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Manuelle et sujette à erreurs</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Extraction points clés</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Automatique avec IA</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Manuelle et subjective</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Actions à suivre</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Extraction automatique</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Manuelle et souvent incomplète</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> Compte rendus IA offre une alternative rapide et précise à la prise de notes manuelle. Contrairement à la prise de notes manuelle qui prend plusieurs heures et est sujette aux oublis et erreurs, Compte rendus IA génère des rapports professionnels en quelques minutes avec une transcription fidèle, une identification automatique des intervenants, et une extraction intelligente des points clés et des actions à suivre. C'est la solution idéale pour ceux qui veulent automatiser la documentation de leurs réunions et gagner un temps considérable.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur Compte rendus IA (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur Compte rendus IA (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que Compte rendus IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Compte rendus IA est une plateforme d'intelligence artificielle qui transforme automatiquement vos réunions en rapports professionnels détaillés. Enregistrez vos réunions, uploadez des fichiers audio, et obtenez instantanément des transcriptions précises avec OpenAI Whisper et des résumés intelligents avec GPT. Basée sur les technologies OpenAI Whisper pour la transcription et GPT pour le résumé, cette solution vous permet de capturer, analyser et documenter vos réunions avec une efficacité maximale.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser Compte rendus IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser Compte rendus IA, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface via meeting-reports.iahome.fr. Enregistrez vos réunions en temps réel avec le microphone intégré, ou uploadez des fichiers audio existants (MP3, WAV, WebM). L'IA transcrit automatiquement l'audio avec Whisper, puis génère un résumé intelligent avec GPT incluant les points clés, les décisions prises et les actions à suivre. Vous pouvez ensuite télécharger le rapport en PDF ou Markdown.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la précision de la transcription de Compte rendus IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Compte rendus IA utilise OpenAI Whisper, un modèle de transcription audio de nouvelle génération capable de comprendre la parole avec une précision exceptionnelle. La transcription est fidèle avec identification des intervenants, extraction des points clés et des actions à suivre. La précision est généralement très élevée, même dans des conditions difficiles ou avec plusieurs intervenants.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Compte rendus IA est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'accès de Compte rendus IA coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : enregistrement audio, transcription automatique, résumé intelligent, identification des intervenants, extraction des points clés, et export PDF/Markdown. Il n'y a pas de frais supplémentaires pour le traitement des réunions.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quels formats audio sont supportés par Compte rendus IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Compte rendus IA supporte une large gamme de formats audio : MP3, WAV, WebM, et bien d'autres. L'outil utilise FFmpeg pour la conversion audio optimisée, garantissant le support de tous les formats de fichiers audio et vidéo courants. Vous pouvez enregistrer directement depuis l'interface ou uploader vos fichiers existants.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Combien de temps prend la génération d'un rapport de réunion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Le temps de traitement dépend de la durée de la réunion. Généralement, la transcription et le résumé sont générés en quelques minutes pour une réunion d'une heure. Grâce à notre infrastructure haute performance et aux technologies OpenAI Whisper et GPT, vous obtenez des résultats rapides même pour les réunions les plus longues.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait Compte rendus IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Compte rendus IA est fait pour plusieurs types d'utilisateurs : équipes professionnelles qui documentent leurs réunions hebdomadaires, stand-ups et réunions de projet, formateurs et conférenciers qui transcrivent leurs sessions de formation, recruteurs et professionnels qui enregistrent et analysent des entretiens, et toute personne qui veut automatiser la création de rapports de réunion professionnels.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Compte rendus IA est une solution d'intelligence artificielle qui transforme automatiquement vos réunions 
                    en rapports professionnels détaillés. Enregistrez, transcrivez et résumez vos réunions avec une précision exceptionnelle.
                  </p>
                  {card?.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu détaillé Meeting Reports */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Révolutionnez vos réunions avec l'IA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compte rendus IA automatise la création de rapports de réunion professionnels, 
              vous faisant gagner du temps et améliorant la productivité de votre équipe.
            </p>
          </div>

          {/* Description détaillée en plusieurs chapitres */}
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Chapitre 1: Qu'est-ce que Meeting Reports */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h4 className="text-2xl font-bold text-emerald-900">Qu'est-ce que Compte rendus IA ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Compte rendus IA est une plateforme d'intelligence artificielle qui transforme automatiquement 
                  vos réunions en rapports professionnels détaillés. Enregistrez vos réunions, uploadez des fichiers audio, 
                  et obtenez instantanément des transcriptions précises et des résumés intelligents.
                </p>
                <p className="text-base leading-relaxed">
                  Basée sur les technologies OpenAI Whisper pour la transcription et GPT pour le résumé, 
                  cette solution vous permet de capturer, analyser et documenter vos réunions avec une efficacité maximale.
                </p>
              </div>
            </div>

            {/* Chapitre 2: Pourquoi choisir Meeting Reports */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir Compte rendus IA ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Gain de temps considérable :</strong> Plus besoin de prendre des notes manuellement. 
                  L'IA capture tout et génère des rapports complets en quelques minutes.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Précision exceptionnelle :</strong> Transcription fidèle avec identification des intervenants, 
                  extraction des points clés et des actions à suivre.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Interface intuitive :</strong> Enregistrement en un clic, upload de fichiers audio, 
                  et génération automatique de rapports PDF professionnels.
                </p>
              </div>
            </div>

            {/* Chapitre 3: Fonctionnalités avancées */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h4 className="text-2xl font-bold text-teal-900">Fonctionnalités avancées</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Enregistrement en temps réel :</strong> Enregistrez vos réunions directement depuis l'interface 
                  avec un microphone intégré et une qualité audio optimale.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Upload de fichiers :</strong> Uploadez vos enregistrements existants (MP3, WAV, WebM) 
                  pour une transcription et analyse immédiate.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Résumé intelligent :</strong> L'IA génère automatiquement des résumés structurés avec 
                  points clés, décisions prises et actions à suivre.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Export professionnel :</strong> Téléchargez vos rapports en PDF ou Markdown 
                  avec mise en forme professionnelle.
                </p>
              </div>
            </div>

            {/* Chapitre 4: Cas d'usage */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">4</span>
                </div>
                <h4 className="text-2xl font-bold text-cyan-900">Cas d'usage et applications</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Réunions d'équipe :</strong> Documentez automatiquement vos réunions hebdomadaires, 
                  stand-ups et réunions de projet avec des rapports détaillés.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Formations et conférences :</strong> Transcrivez vos sessions de formation 
                  et créez des supports de cours automatiquement.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Interviews et entretiens :</strong> Enregistrez et analysez vos entretiens 
                  pour un suivi précis des candidats et des clients.
                </p>
              </div>
            </div>

            {/* Chapitre 5: Technologies utilisées */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">5</span>
                </div>
                <h4 className="text-2xl font-bold text-blue-900">Technologies de pointe</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>OpenAI Whisper :</strong> Modèle de transcription audio de nouvelle génération, 
                  capable de comprendre la parole avec une précision exceptionnelle.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>OpenAI GPT :</strong> Intelligence artificielle pour la génération de résumés 
                  intelligents et l'extraction d'informations clés.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>FFmpeg :</strong> Conversion audio optimisée pour supporter tous les formats 
                  de fichiers audio et vidéo.
                </p>
              </div>
            </div>
          </div>
          
          {/* Fonctionnalités principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎤</span>
                </div>
                <h4 className="font-bold text-emerald-900 mb-3 text-lg">Enregistrement</h4>
                <p className="text-gray-700 text-sm">Enregistrement en temps réel avec microphone intégré.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-bold text-teal-900 mb-3 text-lg">Transcription</h4>
                <p className="text-gray-700 text-sm">Transcription automatique avec Whisper IA.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="font-bold text-cyan-900 mb-3 text-lg">Résumé IA</h4>
                <p className="text-gray-700 text-sm">Génération automatique de résumés intelligents.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📄</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-3 text-lg">Export PDF</h4>
                <p className="text-gray-700 text-sm">Rapports professionnels en PDF et Markdown.</p>
              </div>
            </div>
          </div>
          
          {/* Informations pratiques */}
          <div className="bg-gradient-to-r from-gray-50 to-emerald-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">€</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Prix</h5>
                  <p className="text-gray-600 text-sm">100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">📱</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                  <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                href="https://github.com/openai/whisper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="mr-2">🔗</span>
                Documentation OpenAI Whisper
              </a>
              <a
                href="https://platform.openai.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="mr-2">📚</span>
                API OpenAI
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modal pour l'iframe */}
      {iframeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
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
            <div className="flex-1 p-4">
              <iframe
                src={iframeModal.url}
                className="w-full h-full rounded-lg"
                title={iframeModal.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={card?.id || 'meeting-reports'}
        moduleName="Meeting Reports"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-meeting-reports"
        gradientColors="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        icon="📝"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        moduleCategory={card?.category}
        moduleUrl={card?.url}
      />
    </div>
  );
}






