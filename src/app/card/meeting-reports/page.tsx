'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import ModuleActivationButton from '../../../components/ModuleActivationButton';

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

export default function MeetingReportsPage() {
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Meeting Reports est un module payant
  const isFreeModule = false;

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!session?.user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: session.user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'activation:', error);
    }
    return false;
  }, [session?.user?.id]);

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = useCallback(async (moduleId: string, moduleUrl: string) => {
    if (!session?.user?.id) {
      alert('Vous devez être connecté pour accéder à ce module.');
      return;
    }

    console.log(`🔗 Tentative d'accès au module ${moduleId} avec l'URL: ${moduleUrl}`);

    try {
      // Générer un JWT pour l'accès au module
      const response = await fetch('/api/generate-module-jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: session.user.id,
          moduleUrl: moduleUrl
        }),
      });

      if (response.ok) {
        const { token } = await response.json();
        const urlWithToken = `${moduleUrl}?token=${token}`;
        console.log(`✅ JWT généré, ouverture de: ${urlWithToken}`);
        window.open(urlWithToken, '_blank');
      } else {
        console.error('❌ Erreur lors de la génération du JWT, fallback vers URL directe');
        // Fallback: ouvrir directement l'URL
        console.log(`🔗 Fallback: ouverture directe de ${moduleUrl}`);
        window.open(moduleUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      // Fallback: ouvrir directement l'URL
      console.log(`🔗 Fallback après erreur: ouverture directe de ${moduleUrl}`);
      window.open(moduleUrl, '_blank');
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
                expires_at: access.expires_at,
                is_active: access.is_active
              }
            };
          } catch (error) {
            console.error(`❌ Exception traitement module ${access.module_id}:`, error);
            continue;
          }
        }

        setUserSubscriptions(subscriptionsMap);

        // Vérifier si le module actuel est déjà activé
        if (card?.id) {
          setCheckingActivation(true);
          const isActivated = await checkModuleActivation(card.id);
          if (isActivated) {
            setAlreadyActivatedModules(prev => [...prev, card.id]);
          }
          setCheckingActivation(false);
        }
      } catch (error) {
        console.log('Erreur lors du chargement des données utilisateur:', error);
        setUserSubscriptions({});
        setCheckingActivation(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id, card?.id, checkModuleActivation]);

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
      try {
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


  const handleActivate = async (card: Card) => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    try {
      setIsActivating(true);
      
      // Appeler l'API pour activer le module Meeting Reports
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
        throw new Error(result.error || 'Erreur lors de l\'activation du module');
      }

      // Ajouter le module aux modules activés
      setAlreadyActivatedModules(prev => [...prev, card.id]);
      
      // Rediriger vers la page de transition
      router.push('/transition?module=' + encodeURIComponent(card.title) + '&id=' + card.id);
      
    } catch (error) {
      console.error('Erreur lors de l\'activation du module:', error);
      alert('Erreur lors de l\'activation du module. Veuillez réessayer.');
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
    
    if (isFreeModule) {
      window.open(moduleUrl, '_blank');
    } else {
      accessModuleWithJWT(card?.id || 'meeting-reports', moduleUrl);
    }
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
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Transformez vos réunions en rapports professionnels avec l'IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'PRODUCTIVITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-emerald-100 mb-6">
                Enregistrez, transcrivez et résumez automatiquement vos réunions avec l'intelligence artificielle. 
                Générez des rapports détaillés en quelques minutes.
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
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/33-XXG-AI8c?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration Compte rendus IA"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  100 tokens
                </div>
                <div className="text-sm opacity-90">
                  par utilisation
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Message si le module est déjà activé */}
                {alreadyActivatedModules.includes(card?.id || '') && (
                  <div className="w-3/4 mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center space-x-3 text-green-800">
                      <span className="text-2xl">✅</span>
                      <div className="text-center">
                        <p className="font-semibold">Application déjà activée !</p>
                        <p className="text-sm opacity-80">Vous pouvez accéder à cette application depuis vos applications</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => router.push('/encours')}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <span className="mr-2">📱</span>
                        Voir mes applications
                      </button>
                    </div>
                  </div>
                )}

                {/* Bouton d'activation avec tokens */}
                {!alreadyActivatedModules.includes(card?.id || '') && (
                  <div className="w-3/4 mx-auto">
                    <ModuleActivationButton
                      moduleId={card?.id || 'meeting-reports'}
                      moduleName={card?.title || 'Compte rendus IA'}
                      moduleCost={100}
                      moduleDescription={card?.description || 'Application Compte rendus IA activée'}
                      onActivationSuccess={() => {
                        setAlreadyActivatedModules(prev => [...prev, card?.id || 'meeting-reports']);
                        alert(`✅ Application ${card?.title || 'Compte rendus IA'} activée avec succès ! Vous pouvez maintenant l'utiliser depuis vos applications.`);
                      }}
                      onActivationError={(error) => {
                        console.error('Erreur activation:', error);
                      }}
                    />
                  </div>
                )}


                {!alreadyActivatedModules.includes(card?.id || '') && showActivateButton && (
                  <div className="w-3/4 space-y-3">
                    <button 
                      className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleActivate(card!)}
                      disabled={isActivating}
                    >
                      {isActivating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Activation...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">⚡</span>
                          <span>Activer {card?.title}</span>
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
                  <p className="text-gray-600 text-sm">100 tokens par utilisation</p>
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
    </div>
  );
}
