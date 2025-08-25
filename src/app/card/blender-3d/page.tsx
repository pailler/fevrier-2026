'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';

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

export default function Blender3DPage() {
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

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // Blender 3D est payant

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
      }
    return false;
  }, [session?.user?.id]);

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = useCallback(async (moduleTitle: string, moduleId: string) => {
    if (!session?.user?.id) {
      alert('Vous devez être connecté pour accéder aux modules');
      return;
    }

    if (!moduleTitle || !moduleId) {
      return;
    }

    try {
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          moduleId: moduleId,
          moduleName: moduleTitle.toLowerCase().replace(/\s+/g, ''),
          expirationHours: 12
        }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Erreur HTTP ${response.status}` };
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        throw new Error('Erreur lors du parsing de la réponse');
      }
      
      const { accessToken, moduleName } = responseData;
      const baseUrl = '/blender-3d';
      const accessUrl = `${baseUrl}?token=${accessToken}`;
      setIframeModal({
        isOpen: true,
        url: accessUrl,
        title: moduleTitle
      });
    } catch (error) {
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [session, setIframeModal]);

  // Vérifier la session
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

  // Récupérer les abonnements de l'utilisateur et vérifier l'activation du module
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
                expires_at: access.expires_at,
                is_active: access.is_active
              }
            };
          } catch (error) {
            continue;
          }
        }

        setUserSubscriptions(subscriptions);

        // Vérifier si le module actuel est déjà activé dans user_applications
        if (card?.id) {
          setCheckingActivation(true);
          const isActivated = await checkModuleActivation(card.id);
          if (isActivated) {
            setAlreadyActivatedModules(prev => [...prev, card.id]);
          }
          setCheckingActivation(false);
        }
      } catch (error) {
        setUserSubscriptions({});
        setCheckingActivation(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id, card?.id, checkModuleActivation]);

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
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'blender-3d')
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

  const handleSubscribe = (card: Card) => {
    if (!card?.id) {
      return;
    }

    const isSelected = selectedCards.some(c => c.id === card.id);
    let newSelectedCards;
    
    if (isSelected) {
      newSelectedCards = selectedCards.filter(c => c.id !== card.id);
      } else {
      newSelectedCards = [...selectedCards, card];
      }
    
    setSelectedCards(newSelectedCards);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
      }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
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

      {/* Bannière spéciale pour Blender 3D */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 py-8 relative overflow-hidden">
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
                Créez des objets 3D avec l'IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || '3D GENERATION').toUpperCase()}
              </span>
              <p className="text-xl text-orange-100 mb-6">
                Générateur 3D Blender vous permet de créer des objets 3D complexes à partir de descriptions textuelles avec l'intelligence artificielle et Blender.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Génération 3D
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 IA Blender
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ MCP Protocol
                </span>
              </div>
            </div>
            
            {/* Logo Blender 3D animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques 3D abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-orange-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-red-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-pink-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo 3D centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-orange-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Cube 3D stylisé */}
                      <path 
                        d="M4 4 L12 4 L12 12 L4 12 Z" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 4 L20 4 L20 12 L12 12" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M4 12 L12 12 L12 20 L4 20" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 12 L20 12 L20 20 L12 20" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      
                      {/* Lignes de perspective */}
                      <path 
                        d="M4 4 L4 12" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 4 L12 12" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M20 4 L20 12" 
                        stroke="#F97316" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      
                      {/* Points de connexion */}
                      <circle cx="4" cy="4" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="12" cy="4" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="20" cy="4" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                      <circle cx="4" cy="12" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                      </circle>
                      <circle cx="12" cy="12" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="2s"/>
                      </circle>
                      <circle cx="20" cy="12" r="1" fill="#F97316" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="2.5s"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo Blender 3D - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
              title="Démonstration Blender 3D"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  {card.price === 0 || card.price === '0' ? 'Free' : `€${card.price}`}
                </div>
                <div className="text-sm opacity-90">
                  {card.price === 0 || card.price === '0' ? 'Gratuit' : 'par mois'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Message si le module est déjà activé */}
                {alreadyActivatedModules.includes(card.id) && (
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

                {!alreadyActivatedModules.includes(card.id) && (
                  <button 
                    className={`w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                      isCardSelected(card.id)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                    }`}
                    onClick={() => handleSubscribe(card)}
                  >
                    <span className="text-xl">🔐</span>
                    <span>{isCardSelected(card.id) ? 'Sélectionné' : 'Choisir'}</span>
                  </button>
                )}
                
                {/* Bouton "Payer et activer" pour les modules payants */}
                {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && !alreadyActivatedModules.includes(card.id) && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = '/login';
                        return;
                      }

                      // Vérifier si le module est déjà activé avant de procéder au paiement
                      if (alreadyActivatedModules.includes(card.id)) {
                        alert(`ℹ️ Le module ${card.title} est déjà activé ! Vous pouvez l'utiliser depuis vos applications.`);
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
                            testMode: false, // Mode production activé
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
                        alert(`Erreur lors de l'activation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                      }
                    }}
                  >
                    <span className="text-xl">💳</span>
                    <span>Payer et activer {card.title}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-orange-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-red-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-pink-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-orange-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-red-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-900 via-red-900 to-pink-900 bg-clip-text text-transparent mb-4">
                  À propos du Générateur 3D Blender
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Le Générateur 3D Blender est une innovation révolutionnaire qui combine la puissance de Blender avec l'intelligence artificielle pour créer des objets 3D à partir de descriptions textuelles. 
                    Cette technologie de pointe vous permet de matérialiser vos idées en modèles 3D complexes en quelques secondes.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que le Générateur 3D Blender */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-orange-900">Qu'est-ce que le Générateur 3D Blender ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Le Générateur 3D Blender est un système intelligent qui utilise le protocole MCP (Model Context Protocol) 
                        pour connecter l'intelligence artificielle avec Blender, le logiciel 3D open-source le plus puissant au monde.
                      </p>
                      <p className="text-base leading-relaxed">
                        Cette technologie révolutionnaire permet de créer des objets 3D complexes en décrivant simplement ce que vous voulez voir. 
                        L'IA analyse votre description, comprend le contexte, et génère automatiquement le code Python nécessaire pour créer 
                        l'objet dans Blender avec une précision exceptionnelle.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir le Générateur 3D Blender */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Pourquoi choisir le Générateur 3D Blender ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Précision exceptionnelle :</strong> L'IA comprend les nuances subtiles du langage et les traduit en géométrie 3D 
                        complexe avec une attention particulière aux détails et à la structure.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Flexibilité créative :</strong> Du design industriel à l'art abstrait, en passant par l'architecture et l'animation, 
                        le système s'adapte à tous vos besoins créatifs 3D.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Intégration Blender native :</strong> Utilisez la puissance complète de Blender avec tous ses modificateurs, 
                        matériaux et outils d'animation directement générés par l'IA.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-8 rounded-2xl border border-pink-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-pink-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Génération text-to-3D :</strong> Transformez vos idées en objets 3D en décrivant simplement ce que vous voulez créer. 
                        Plus votre description est détaillée, plus le résultat sera précis.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Modificateurs intelligents :</strong> L'IA applique automatiquement les modificateurs appropriés (subdivision, bevel, 
                        smooth, mirror, array, solidify) pour optimiser votre modèle.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Export multi-format :</strong> Exportez vos créations en OBJ, STL, FBX, ou GLTF pour une compatibilité maximale 
                        avec tous les logiciels 3D et imprimantes 3D.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-8 rounded-2xl border border-rose-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-rose-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Designers et architectes :</strong> Créez des concepts 3D rapidement, des maquettes architecturales, 
                        et des prototypes fonctionnels pour vos projets créatifs.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Artistes 3D :</strong> Générez des objets complexes, des personnages, et des environnements 
                        pour vos projets d'animation et de jeux vidéo.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Ingénieurs et makers :</strong> Convertissez vos concepts en modèles 3D prêts pour l'impression 3D, 
                        la simulation, et la fabrication numérique.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Protocole MCP */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-orange-900">Protocole MCP et Intelligence Artificielle</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>MCP (Model Context Protocol) :</strong> Notre système utilise le protocole MCP pour établir une communication 
                        intelligente entre l'IA et Blender, permettant une compréhension contextuelle avancée.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Claude AI :</strong> Intégration avec Claude 3 Sonnet pour une analyse d'intention sophistiquée 
                        et une génération de code Python optimisée pour Blender.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Apprentissage continu :</strong> Le système s'améliore constamment en apprenant de vos interactions 
                        et en optimisant les résultats pour vos besoins spécifiques.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-orange-900 mb-3 text-lg">Créativité 3D</h4>
                      <p className="text-gray-700 text-sm">Libérez votre imagination avec des outils de génération 3D avancés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 sm:p-8 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-red-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Génération rapide d'objets 3D avec notre infrastructure optimisée.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Sécurité</h4>
                      <p className="text-gray-700 text-sm">Protocole MCP sécurisé et utilisation éthique garantis.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <h4 className="font-bold text-rose-900 mb-3 text-lg">Accessibilité</h4>
                      <p className="text-gray-700 text-sm">Interface intuitive accessible à tous les niveaux d'expertise.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : `€${card.price} par mois`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                    Prêt à créer des objets 3D extraordinaires avec l'IA ? Commencez dès maintenant et explorez les possibilités infinies de la génération 3D intelligente !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/register" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <span className="text-xl mr-2">🚀</span>
                      Commencer maintenant
                    </Link>
                    <span className="text-sm text-gray-500">
                      Accès instantané juste après inscription
                    </span>
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
    </div>
  );
}

