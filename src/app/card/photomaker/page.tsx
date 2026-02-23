'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import ModuleActivationButton from '../../../components/ModuleActivationButton';
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

export default function PhotoMakerPage() {
  const router = useRouter();
  
  // Configuration du module PhotoMaker
  const photomakerModule = {
    id: 'photomaker',
    title: 'PhotoMaker',
    subtitle: 'Personnalisation de photos réalistes par IA via Stacked ID Embedding',
    description: 'PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding. Créez des portraits personnalisés en quelques secondes sans entraînement LoRA supplémentaire, avec une fidélité d\'identité impressionnante, diversité et contrôle textuel.',
    category: 'AI GENERATION',
    price: '100 tokens',
    image_url: '/images/photomaker.jpg',
    github_url: 'https://github.com/TencentARC/PhotoMaker',
    features: [
      'Personnalisation rapide en quelques secondes',
      'Fidélité d\'identité impressionnante',
      'Pas d\'entraînement LoRA requis',
      'Diversité et contrôle textuel',
      'Génération de haute qualité',
      'Compatible avec différents modèles de base',
      'Stacked ID Embedding'
    ]
  };

  const [card, setCard] = useState<Card | null>(photomakerModule as Card);
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

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // PhotoMaker est payant

  // Fonction pour vérifier si un module est déjà accessible
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!session?.user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-accès', {
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
      // Générer un token d'accès standard comme pour les autres modules
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          userEmail: session.user.email,
          moduleId: 'photomaker'
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Utiliser le sous-domaine comme les autres modules IA
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const photomakerUrl = isDevelopment 
        ? 'http://localhost:7881' 
        : 'https://photomaker.iahome.fr';
      
      const accessUrl = `${photomakerUrl}?token=${encodeURIComponent(tokenData.token)}`;
      console.log('🔗 photomaker: Accès direct au sous-domaine avec token:', accessUrl);
      window.open(accessUrl, '_blank');
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
                expires_at: access.expires_at,
                is_active: access.is_active
              }
            };
          } catch (error) {
            continue;
          }
        }

        setUserSubscriptions(subscriptions);

        // Vérifier si le module actuel est déjà accessible dans user_applications
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PhotoMaker - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "PhotoMaker est une technologie révolutionnaire de personnalisation de photos réalistes via Stacked ID Embedding. Créez des portraits personnalisés en quelques secondes sans entraînement LoRA supplémentaire. Fidélité d'identité impressionnante, diversité, contrôle textuel prometteur et génération de haute qualité.",
      "url": "https://iahome.fr/card/photomaker",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "450"
      },
      "featureList": [
        "Personnalisation rapide en quelques secondes",
        "Fidélité d'identité impressionnante",
        "Pas d'entraînement LoRA requis",
        "Diversité et contrôle textuel",
        "Génération de haute qualité",
        "Compatible avec différents modèles de base",
        "Stacked ID Embedding"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que PhotoMaker ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding. Cette technologie permet de créer des portraits personnalisés en quelques secondes sans nécessiter d'entraînement LoRA supplémentaire, avec une fidélité d'identité impressionnante."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser PhotoMaker ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser PhotoMaker, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface via photomaker.iahome.fr. Téléchargez une ou plusieurs photos de la personne que vous souhaitez personnaliser, entrez un prompt textuel détaillé, et PhotoMaker génère automatiquement des portraits personnalisés avec une fidélité d'identité exceptionnelle."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la qualité des images générées par PhotoMaker ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PhotoMaker génère des images de haute qualité avec une fidélité d'identité impressionnante. La technologie Stacked ID Embedding permet de capturer les caractéristiques faciales avec précision, tout en offrant diversité et contrôle textuel pour créer des variations créatives."
          }
        },
        {
          "@type": "Question",
          "name": "PhotoMaker est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès de PhotoMaker coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : personnalisation rapide, fidélité d'identité impressionnante, pas d'entraînement LoRA requis, et génération de haute qualité."
          }
        },
        {
          "@type": "Question",
          "name": "Dois-je entraîner un modèle LoRA pour utiliser PhotoMaker ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, PhotoMaker ne nécessite pas d'entraînement LoRA supplémentaire. La technologie Stacked ID Embedding permet de personnaliser des photos en quelques secondes simplement en téléchargeant des photos de référence de la personne."
          }
        },
        {
          "@type": "Question",
          "name": "Combien de photos de référence dois-je fournir ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Vous pouvez fournir une ou plusieurs photos de référence. Plus vous fournissez de photos, meilleure sera la fidélité d'identité. PhotoMaker utilise la technologie Stacked ID Embedding pour combiner les caractéristiques de toutes les photos fournies."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait PhotoMaker ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PhotoMaker est fait pour plusieurs types d'utilisateurs : photographes et créateurs de contenu qui veulent créer des portraits personnalisés, professionnels du marketing qui génèrent des visuels avec des visages spécifiques, artistes qui explorent de nouvelles possibilités créatives, et toute personne qui veut personnaliser des photos avec l'IA."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-pm';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-pm';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-pm')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-pm')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-pm');
      const existingScript2 = document.getElementById('faq-schema-pm');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Charger les données du module PhotoMaker depuis Supabase si disponible
  useEffect(() => {
    // Essayer de charger depuis Supabase pour mettre à jour les données si disponibles
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'photomaker')
          .single();

        if (!error && data) {
          // Si trouvé dans Supabase, utiliser ces données
          setCard(data);
        }
        // Sinon, garder les données par défaut déjà initialisées
      } catch (error) {
        // En cas d'erreur, garder les données par défaut
        console.log('Module PhotoMaker non trouvé dans Supabase, utilisation des données par défaut');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
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

      {/* Bannière spéciale pour PhotoMaker */}
      <section className="bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 py-8 relative overflow-hidden">
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
                PhotoMaker : personnalisation de photos réalistes par IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI GENERATION').toUpperCase()}
              </span>
              <p className="text-xl text-pink-100 mb-6">
                Créez des portraits personnalisés en quelques secondes avec PhotoMaker. Personnalisation rapide sans entraînement LoRA, fidélité d'identité impressionnante, diversité et contrôle textuel. Parfait pour photographes, créateurs de contenu et professionnels du marketing.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📸 Personnalisation rapide
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎯 Fidélité d'identité
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Sans LoRA requis
                </span>
              </div>
            </div>
            
            {/* Visuel PhotoMaker avec image ou logo */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites animées */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-pink-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-rose-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-red-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo PhotoMaker centré avec effet 3D */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-pink-50 to-rose-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-pink-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      {/* Icône appareil photo avec effet glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <svg className="w-24 h-24 relative z-10" viewBox="0 0 24 24" fill="none">
                          {/* Appareil photo stylisé PhotoMaker */}
                          <rect 
                            x="5" y="3" width="14" height="16" rx="2.5" 
                            stroke="#EC4899" 
                            strokeWidth="2.5" 
                            fill="url(#gradient1)"
                            className="drop-shadow-lg"
                          />
                          <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F472B6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          <circle 
                            cx="12" cy="11" r="3.5" 
                            stroke="#EC4899" 
                            strokeWidth="2" 
                            fill="none"
                            className="drop-shadow-md"
                          />
                          <path 
                            d="M9 3 L9 1 M15 3 L15 1" 
                            stroke="#EC4899" 
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          {/* Flash LED */}
                          <circle cx="17" cy="7" r="1.5" fill="#EC4899" className="animate-pulse">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                        </svg>
                      </div>
                      {/* Texte PhotoMaker */}
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          PhotoMaker
                        </div>
                        <div className="text-xs text-pink-600/80 mt-1 font-medium">
                          Stacked ID Embedding
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéos PhotoMaker - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Deuxième vidéo - Démonstration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo de démonstration */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Démonstration PhotoMaker</h3>
            <YouTubeEmbed
              videoId="ZTck128jfFY"
              title="PhotoMaker vs IPAdapter - Comparaison et Démonstration"
              origin="https://iahome.fr"
            />
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  100 tokens
                </div>
                <div className="text-sm opacity-90">
                  par accès, et utilisez l'application aussi longtemps que vous souhaitez
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Message si le module est déjà accessible */}
                {alreadyActivatedModules.includes(card.id) && (
                  <div className="w-3/4 mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center space-x-3 text-green-800">
                      <span className="text-2xl">✅</span>
                      <div className="text-center">
                        <p className="font-semibold">Accès direct disponible</p>
                        <p className="text-sm opacity-80">Vous pouvez accéder à cette application depuis vos applications</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => accessModuleWithJWT(card.title, card.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <span className="mr-2">📱</span>
                        Voir mes applications
                      </button>
                    </div>
                  </div>
                )}

{/* Bouton d'accès avec tokens */}
                {!alreadyActivatedModules.includes(card.id) && (
                  <div className="w-3/4 mx-auto">
                    <ModuleActivationButton
                      moduleId={card.id}
                      moduleName={card.title}
                      moduleCost={100}
                      moduleDescription={card.description}
                      onActivationSuccess={() => {
                        setAlreadyActivatedModules(prev => [...prev, card.id]);
                        alert(`✅ Application ${card.title} accessible avec succès ! Vous pouvez maintenant l'utiliser depuis vos applications.`);
                      }}
                      onActivationError={(error) => {
                        console.error('Erreur accès:', error);
                      }}
                    />
                  </div>
                )}

                {/* Bouton "Accéder maintenant" pour les modules payants */}
                {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && !alreadyActivatedModules.includes(card.id) && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = '/login';
                        return;
                      }

                      // Vérifier si le module est déjà accessible avant de procéder au paiement
                      if (alreadyActivatedModules.includes(card.id)) {
                        alert(`ℹ️ L'application ${card.title} est déjà accessible ! Vous pouvez l'utiliser depuis vos applications.`);
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

        {/* Section Exemples visuels PhotoMaker */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Exemples de résultats PhotoMaker</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exemple 1 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👤</div>
                  <div className="text-sm text-pink-700 font-medium">Portrait personnalisé</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Portraits personnalisés</h4>
              <p className="text-sm text-gray-600">Créez des portraits avec une identité spécifique à partir de photos de référence</p>
            </div>

            {/* Exemple 2 */}
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-red-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-sm text-rose-700 font-medium">Style artistique</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Styles variés</h4>
              <p className="text-sm text-gray-600">Générez des portraits dans différents styles artistiques avec contrôle textuel</p>
            </div>

            {/* Exemple 3 */}
            <div className="bg-gradient-to-br from-red-50 to-fuchsia-50 rounded-2xl p-6 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-red-100 to-fuchsia-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-sm text-red-700 font-medium">Génération rapide</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Rapidité</h4>
              <p className="text-sm text-gray-600">Personnalisation en quelques secondes sans entraînement LoRA requis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-pink-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-rose-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-red-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-pink-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-rose-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-4">
                  À propos de PhotoMaker
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-2xl border-l-4 border-pink-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding.</strong> Cette technologie permet de créer des portraits personnalisés en quelques secondes sans nécessiter d'entraînement LoRA supplémentaire, avec une fidélité d'identité impressionnante, diversité, contrôle textuel prometteur et génération de haute qualité. C'est l'outil idéal pour photographes, créateurs de contenu, professionnels du marketing et artistes qui veulent créer des portraits personnalisés avec l'IA.
                  </p>
                </div>

                {/* H2 - À quoi sert PhotoMaker ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    À quoi sert PhotoMaker ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      PhotoMaker permet de créer des portraits personnalisés à partir de photos de référence avec une fidélité d'identité exceptionnelle. Il répond aux besoins de ceux qui souhaitent générer des visuels avec des visages spécifiques, créer des portraits personnalisés, ou produire du contenu visuel avec des identités reconnaissables.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Créer des portraits personnalisés :</strong> Générez des portraits avec une identité spécifique à partir de photos de référence</li>
                      <li className="text-lg"><strong>Personnalisation rapide :</strong> Créez des portraits personnalisés en quelques secondes sans entraînement LoRA</li>
                      <li className="text-lg"><strong>Fidélité d'identité :</strong> Maintenez une fidélité d'identité impressionnante dans toutes vos créations</li>
                      <li className="text-lg"><strong>Contrôle créatif :</strong> Utilisez des prompts textuels pour créer des variations créatives</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Créez des portraits personnalisés pour vos projets créatifs, générez des visuels avec des visages spécifiques pour vos campagnes marketing, créez des avatars personnalisés, produisez des supports visuels avec des identités reconnaissables, ou explorez de nouvelles possibilités créatives avec la personnalisation d'identité.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire PhotoMaker ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    Que peut faire PhotoMaker ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                      <h3 className="text-2xl font-bold text-pink-900 mb-4">Personnalisation rapide</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Créez des portraits personnalisés en quelques secondes sans nécessiter d'entraînement LoRA supplémentaire. Téléchargez simplement des photos de référence et PhotoMaker génère automatiquement des portraits personnalisés avec une fidélité d'identité impressionnante.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200">
                      <h3 className="text-2xl font-bold text-rose-900 mb-4">Stacked ID Embedding</h3>
                      <p className="text-gray-700 leading-relaxed">
                        La technologie Stacked ID Embedding permet de capturer les caractéristiques faciales avec précision en combinant plusieurs photos de référence. Plus vous fournissez de photos, meilleure sera la fidélité d'identité.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                      <h3 className="text-2xl font-bold text-red-900 mb-4">Fidélité d'identité</h3>
                      <p className="text-gray-700 leading-relaxed">
                        PhotoMaker maintient une fidélité d'identité impressionnante dans toutes vos créations. Les portraits générés conservent les caractéristiques faciales essentielles tout en offrant diversité et contrôle textuel.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-6 rounded-2xl border border-fuchsia-200">
                      <h3 className="text-2xl font-bold text-fuchsia-900 mb-4">Contrôle textuel</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Utilisez des prompts textuels détaillés pour créer des variations créatives de vos portraits personnalisés. Le contrôle textuel permet d'influencer le style, la composition, et l'ambiance de vos créations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser PhotoMaker ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser PhotoMaker ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à PhotoMaker</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Accédez à PhotoMaker avec 100 tokens. L'accès est immédiat, le service est accessible depuis vos applications via photomaker.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-2xl border border-rose-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Télécharger des photos de référence</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Téléchargez une ou plusieurs photos de la personne que vous souhaitez personnaliser. Plus vous fournissez de photos, meilleure sera la fidélité d'identité. PhotoMaker utilise la technologie Stacked ID Embedding pour combiner les caractéristiques de toutes les photos fournies.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-fuchsia-50 p-6 rounded-2xl border border-red-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Entrer un prompt textuel</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Entrez un prompt textuel détaillé décrivant le style, la composition, et l'ambiance du portrait que vous souhaitez créer. Le contrôle textuel permet d'influencer chaque aspect de votre création selon vos préférences.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 p-6 rounded-2xl border border-fuchsia-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Générer et télécharger</h3>
                          <p className="text-gray-700 leading-relaxed">
                            PhotoMaker génère automatiquement des portraits personnalisés avec une fidélité d'identité impressionnante. Vous pouvez ensuite télécharger les portraits générés, les réutiliser, ou générer de nouvelles variations pour explorer différentes possibilités créatives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait PhotoMaker ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait PhotoMaker ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                      <div className="text-4xl mb-4">📸</div>
                      <h3 className="text-xl font-bold text-pink-900 mb-2">Photographes et créateurs</h3>
                      <p className="text-gray-700">Créez des portraits personnalisés, des avatars uniques, et explorez de nouvelles possibilités créatives avec la personnalisation d'identité.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-rose-900 mb-2">Marketing et publicité</h3>
                      <p className="text-gray-700">Générez des visuels avec des visages spécifiques pour vos campagnes, créez des contenus visuels avec des identités reconnaissables.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold text-red-900 mb-2">Artistes et designers</h3>
                      <p className="text-gray-700">Explorez de nouvelles possibilités créatives avec la personnalisation d'identité, créez des œuvres artistiques avec des portraits personnalisés.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - PhotoMaker vs autres outils de personnalisation */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    PhotoMaker vs autres outils de personnalisation
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">PhotoMaker</th>
                            <th className="border border-gray-300 p-4 text-center">Autres outils</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Personnalisation rapide</td>
                            <td className="border border-gray-300 p-4 text-center">✅ En quelques secondes</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Nécessite entraînement LoRA</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Fidélité d'identité</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Impressionnante (Stacked ID Embedding)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon l'entraînement</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Entraînement requis</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Aucun (pas de LoRA requis)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent nécessaire</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Diversité et contrôle</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Diversité et contrôle textuel</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Contrôle limité</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Coûts d'entraînement souvent élevés</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> PhotoMaker offre une alternative rapide et efficace aux autres outils de personnalisation. Contrairement aux outils qui nécessitent souvent un entraînement LoRA supplémentaire, PhotoMaker permet de créer des portraits personnalisés en quelques secondes avec une fidélité d'identité impressionnante. C'est la solution idéale pour ceux qui veulent personnaliser des photos rapidement sans compromis sur la qualité.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur PhotoMaker (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur PhotoMaker (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que PhotoMaker ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding. Cette technologie permet de créer des portraits personnalisés en quelques secondes sans nécessiter d'entraînement LoRA supplémentaire, avec une fidélité d'identité impressionnante.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-2xl border-l-4 border-rose-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser PhotoMaker ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser PhotoMaker, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface via photomaker.iahome.fr. Téléchargez une ou plusieurs photos de la personne que vous souhaitez personnaliser, entrez un prompt textuel détaillé, et PhotoMaker génère automatiquement des portraits personnalisés avec une fidélité d'identité exceptionnelle.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-fuchsia-50 p-6 rounded-2xl border-l-4 border-red-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la qualité des images générées par PhotoMaker ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        PhotoMaker génère des images de haute qualité avec une fidélité d'identité impressionnante. La technologie Stacked ID Embedding permet de capturer les caractéristiques faciales avec précision, tout en offrant diversité et contrôle textuel pour créer des variations créatives.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 p-6 rounded-2xl border-l-4 border-fuchsia-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">PhotoMaker est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'accès de PhotoMaker coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : personnalisation rapide, fidélité d'identité impressionnante, pas d'entraînement LoRA requis, et génération de haute qualité.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Dois-je entraîner un modèle LoRA pour utiliser PhotoMaker ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Non, PhotoMaker ne nécessite pas d'entraînement LoRA supplémentaire. La technologie Stacked ID Embedding permet de personnaliser des photos en quelques secondes simplement en téléchargeant des photos de référence de la personne.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-2xl border-l-4 border-rose-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Combien de photos de référence dois-je fournir ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Vous pouvez fournir une ou plusieurs photos de référence. Plus vous fournissez de photos, meilleure sera la fidélité d'identité. PhotoMaker utilise la technologie Stacked ID Embedding pour combiner les caractéristiques de toutes les photos fournies.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-fuchsia-50 p-6 rounded-2xl border-l-4 border-red-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait PhotoMaker ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        PhotoMaker est fait pour plusieurs types d'utilisateurs : photographes et créateurs de contenu qui veulent créer des portraits personnalisés, professionnels du marketing qui génèrent des visuels avec des visages spécifiques, artistes qui explorent de nouvelles possibilités créatives, et toute personne qui veut personnaliser des photos avec l'IA.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    PhotoMaker est une technologie révolutionnaire qui transforme vos photos de référence en portraits personnalisés de haute qualité. 
                    Cette technologie de pointe vous permet de créer des visuels uniques avec une fidélité d'identité exceptionnelle en quelques secondes.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📸</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Personnalisation</h4>
                      <p className="text-gray-700 text-sm">Créez des portraits personnalisés en quelques secondes sans entraînement LoRA.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h4 className="font-bold text-rose-900 mb-3 text-lg">Fidélité</h4>
                      <p className="text-gray-700 text-sm">Fidélité d'identité impressionnante avec Stacked ID Embedding.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 sm:p-8 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-red-900 mb-3 text-lg">Rapidité</h4>
                      <p className="text-gray-700 text-sm">Génération rapide sans compromis sur la qualité.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-6 sm:p-8 rounded-2xl border border-fuchsia-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-fuchsia-900 mb-3 text-lg">Créativité</h4>
                      <p className="text-gray-700 text-sm">Contrôle textuel pour créer des variations créatives.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-pink-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 tokens par accès, et utilisez l\'application aussi longtemps que vous souhaitez'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                    Prêt à créer des portraits personnalisés avec PhotoMaker ? Commencez dès maintenant et explorez les possibilités infinies de la personnalisation d'identité par IA !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={card?.id || 'photomaker'}
        moduleName="PhotoMaker"
        tokenCost={100}
        tokenUnit="par accès, et utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
        icon="📸"
        isModuleActivated={alreadyActivatedModules.includes(card?.id || '')}
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'PhotoMaker',
          userId: userId,
          userEmail: email,
          moduleCost: 100,
          moduleDescription: card?.description
        })}
        onActivationSuccess={() => {
          if (card?.id) {
            setAlreadyActivatedModules(prev => [...prev, card.id]);
          }
        }}
      />
    </div>
  );
}





