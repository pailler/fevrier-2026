'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';

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

export default function WhisperPage() {
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Whisper IA est un module gratuit
  const isFreeModule = true;

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
        window.open(urlWithToken, '_blank');
      } else {
        console.error('Erreur lors de la génération du JWT');
        // Fallback: ouvrir directement l'URL
        window.open(moduleUrl, '_blank');
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Fallback: ouvrir directement l'URL
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
      async (event, session) => {
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
        // Vérifier si la table user_subscriptions existe avant de faire la requête
        const { data: subscriptions, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          // Si la table n'existe pas, on continue sans erreur
          if (error.code === '42P01') {
            console.log('Table user_subscriptions n\'existe pas, continuons sans abonnements');
            setUserSubscriptions({});
            return;
          }
          console.error('Erreur lors du chargement des abonnements:', error);
          setUserSubscriptions({});
          return;
        }

        const subscriptionsMap: {[key: string]: any} = {};
        subscriptions?.forEach(sub => {
          subscriptionsMap[sub.module_id] = sub;
        });

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
          .eq('id', 'whisper')
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
  }, [router, session]);

  // Gérer l'accès rapide pour les modules gratuits
  useEffect(() => {
    if (isFreeModule && card && !quickAccessAttempted && session?.user?.id) {
      setQuickAccessAttempted(true);
      // Pour les modules gratuits, on peut accéder directement
    }
  }, [isFreeModule, card, quickAccessAttempted, session?.user?.id]);

  const handleSubscribe = (card: Card) => {
    if (isFreeModule) {
      // Pour les modules gratuits, afficher le bouton d'activation
      setShowActivateButton(true);
    } else {
      // Logique d'abonnement pour les modules payants
      router.push(`/subscription/${card.id}`);
    }
  };

  const handleActivate = async (card: Card) => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    try {
      setIsActivating(true);
      
      // Appeler l'API pour activer le module
      const response = await fetch('/api/activate-module', {
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
    if (card?.url) {
      if (isFreeModule) {
        window.open(card.url, '_blank');
      } else {
        accessModuleWithJWT(card.id, card.url);
      }
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

      {/* Bannière spéciale pour Whisper IA */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8 relative overflow-hidden">
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
                Transformez vos fichiers audio, vidéo et images en texte avec précision
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'PRODUCTIVITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Grâce aux technologies OpenAI Whisper et Tesseract OCR, obtenez des transcriptions et reconnaissances de texte d'une précision exceptionnelle.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎤 Transcription audio
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎬 Transcription vidéo
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🖼️ Reconnaissance OCR
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🌐 Multilingue
                </span>
              </div>

            </div>
            
            {/* Logo Whisper IA animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo IA centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Microphone stylisé */}
                      <path 
                        d="M12 2 C8 2 4 4 4 8 C4 12 8 14 12 14 C16 14 20 12 20 8 C20 4 16 2 12 2 Z" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M8 6 C8 8 10 10 12 10 C14 10 16 8 16 6" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 14 L12 20" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      <path 
                        d="M8 20 L16 20" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      
                      {/* Particules d'IA */}
                      <circle cx="6" cy="6" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="6" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="6" cy="18" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                      <circle cx="18" cy="18" r="1" fill="#3B82F6" className="animate-pulse">
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

      {/* Vidéo Whisper IA - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration Whisper IA"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  Free
                </div>
                <div className="text-sm opacity-90">
                  Gratuit
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
                        <p className="font-semibold">Module déjà activé !</p>
                        <p className="text-sm opacity-80">Vous pouvez accéder à ce module depuis vos applications</p>
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

                {!alreadyActivatedModules.includes(card?.id || '') && !showActivateButton && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => handleSubscribe(card!)}
                  >
                    <span className="text-xl">🔐</span>
                    <span>Choisir</span>
                  </button>
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
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  À propos de Whisper IA
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. 
                    Cette technologie de pointe vous permet de créer des transcriptions et reconnaissances de texte en quelques secondes.
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

      {/* Contenu détaillé Whisper IA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Découvrez la puissance de l'IA multimédia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whisper IA révolutionne la façon dont vous transformez vos contenus multimédias en texte, 
              avec une précision et une rapidité exceptionnelles.
            </p>
          </div>

          {/* Description détaillée en plusieurs chapitres */}
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Chapitre 1: Qu'est-ce que Whisper IA */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que Whisper IA ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme 
                  vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. 
                  Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution 
                  complète pour tous vos besoins de transcription et reconnaissance de texte.
                </p>
                <p className="text-base leading-relaxed">
                  Développée avec les dernières avancées en intelligence artificielle, cette plateforme 
                  vous donne accès à des capacités de traitement multimédia de niveau professionnel, 
                  le tout dans une interface moderne et intuitive accessible depuis n'importe quel navigateur.
                </p>
              </div>
            </div>

            {/* Chapitre 2: Pourquoi choisir Whisper IA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir Whisper IA ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Précision exceptionnelle :</strong> Utilise les modèles OpenAI Whisper les plus avancés 
                  pour une transcription audio et vidéo d'une précision remarquable, même dans des conditions difficiles.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Polyvalence multimédia :</strong> Traitez audio, vidéo et images dans une seule interface. 
                  De la transcription de réunions à l'extraction de texte depuis des documents scannés.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Interface moderne :</strong> Une expérience utilisateur soignée qui s'adapte à tous les 
                  appareils, avec des fonctionnalités avancées et une navigation intuitive.
                </p>
              </div>
            </div>

            {/* Chapitre 3: Fonctionnalités avancées */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h4 className="text-2xl font-bold text-purple-900">Fonctionnalités avancées</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Transcription audio :</strong> Convertissez vos enregistrements vocaux en texte avec 
                  une précision au mot près. Support de plus de 50 langues et dialectes.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Transcription vidéo :</strong> Extrayez le texte des vidéos avec horodatage précis 
                  des mots, parfait pour créer des sous-titres ou analyser du contenu vidéo.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Reconnaissance de texte (OCR) :</strong> Transformez vos images et PDFs en texte 
                  éditable avec Tesseract OCR, optimisé pour le français et l'anglais.
                </p>
              </div>
            </div>

            {/* Chapitre 4: Cas d'usage */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">4</span>
                </div>
                <h4 className="text-2xl font-bold text-orange-900">Cas d'usage et applications</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Professionnels :</strong> Transcrivez vos réunions, interviews et conférences. 
                  Créez des sous-titres pour vos vidéos de formation ou de marketing.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Étudiants :</strong> Transformez vos cours enregistrés en notes textuelles, 
                  extrayez le texte de vos documents scannés pour faciliter l'étude.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Créateurs de contenu :</strong> Générez automatiquement des sous-titres pour vos vidéos, 
                  créez des transcriptions de podcasts pour améliorer le SEO.
                </p>
              </div>
            </div>

            {/* Chapitre 5: Technologies utilisées */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">5</span>
                </div>
                <h4 className="text-2xl font-bold text-red-900">Technologies de pointe</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>OpenAI Whisper :</strong> Modèle de reconnaissance vocale de nouvelle génération, 
                  entraîné sur des millions d'heures d'audio multilingue pour une précision maximale.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Tesseract OCR :</strong> Moteur de reconnaissance de caractères optiques open-source, 
                  optimisé pour extraire le texte des images et documents numérisés.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Infrastructure Docker :</strong> Déploiement sécurisé et scalable avec des conteneurs 
                  isolés, garantissant la confidentialité et la performance de vos données.
                </p>
              </div>
            </div>
          </div>
          
          {/* Fonctionnalités principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎵</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-3 text-lg">Audio</h4>
                <p className="text-gray-700 text-sm">Transcription audio de haute qualité avec support multilingue.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎬</span>
                </div>
                <h4 className="font-bold text-green-900 mb-3 text-lg">Vidéo</h4>
                <p className="text-gray-700 text-sm">Transcription vidéo avec horodatage précis des mots.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h4 className="font-bold text-purple-900 mb-3 text-lg">Images</h4>
                <p className="text-gray-700 text-sm">Reconnaissance de texte (OCR) sur images et PDF.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🌐</span>
                </div>
                <h4 className="font-bold text-orange-900 mb-3 text-lg">Multilingue</h4>
                <p className="text-gray-700 text-sm">Support de plus de 50 langues et dialectes.</p>
              </div>
            </div>
          </div>
          
          {/* Informations pratiques */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">€</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Prix</h5>
                  <p className="text-gray-600 text-sm">Gratuit</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">📱</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                  <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">⚙️</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Configuration</h5>
                  <p className="text-gray-600 text-sm">Aucune installation requise</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="text-center pt-8">
            <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-4xl mx-auto">
              Prêt à découvrir {card?.title} ? Commencez dès maintenant et profitez de toutes ses fonctionnalités !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleQuickAccess}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                <span className="text-xl mr-2">🚀</span>
                Commencer maintenant
              </button>
              <span className="text-sm text-gray-500">
                Accès instantané et gratuit
              </span>
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