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

export default function AnimagineXLPage() {
  const router = useRouter();
  
  // Configuration du module Animagine XL
  const animagineXLModule = {
    id: 'animagine-xl',
    title: 'Animagine XL',
    subtitle: 'Modèle SDXL super-optimisé pour l\'anime et les mangas',
    description: 'Animagine XL 3.1 est un modèle Stable Diffusion XL spécialement entraîné pour la génération d\'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d\'images et 500+ heures d\'entraînement. Il connaît près de 5000 personnages d\'anime et peut générer des images de haute qualité sans nécessiter de LoRA supplémentaires.',
    category: 'AI GENERATION',
    price: '100 tokens',
    image_url: '/images/animagine-xl.jpg',
    github_url: 'https://github.com/cagliostro-research-lab/animagine-xl',
    features: [
      'Génération d\'anime et manga de haute qualité',
      'Connaissance de 5000+ personnages d\'anime',
      'Pas de LoRA requis pour les personnages connus',
      'Génération optimisée avec CFG Scale 5-7',
      'Support de multiples dimensions (1024x1024, etc.)',
      'Tags de qualité et esthétique intégrés',
      'Génération rapide (27 steps recommandés)'
    ]
  };

  const [card, setCard] = useState<Card | null>(animagineXLModule as Card);
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
  const isFreeModule = false; // Animagine XL est payant

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
      // Générer un token d'accès standard comme pour les autres modules
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          userEmail: session.user.email,
          moduleId: 'animagine-xl'
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Utiliser le sous-domaine comme les autres modules IA
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const animaginexlUrl = isDevelopment 
        ? 'http://localhost:7883' 
        : 'https://animaginexl.iahome.fr';
      
      const accessUrl = `${animaginexlUrl}?token=${encodeURIComponent(tokenData.token)}`;
      console.log('🔗 animagine-xl: Accès direct au sous-domaine avec token:', accessUrl);
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Animagine XL - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Animagine XL 3.1 est un modèle Stable Diffusion XL super-optimisé pour la génération d'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle connaît près de 5000 personnages d'anime et génère des images de haute qualité sans nécessiter de LoRA supplémentaires.",
      "url": "https://iahome.fr/card/animagine-xl",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "320"
      },
      "featureList": [
        "Génération d'anime et manga de haute qualité",
        "Connaissance de 5000+ personnages d'anime",
        "Pas de LoRA requis pour les personnages connus",
        "Génération optimisée avec CFG Scale 5-7",
        "Support de multiples dimensions",
        "Tags de qualité et esthétique intégrés",
        "Génération rapide"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce qu'Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Animagine XL 3.1 est un modèle Stable Diffusion XL spécialement entraîné pour la génération d'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d'images et 500+ heures d'entraînement pour devenir le meilleur modèle open source de génération d'animes."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser Animagine XL, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via animagine-xl.iahome.fr. Utilisez la structure de prompt recommandée (1girl/1boy, nom du personnage, tags descriptifs, tags de qualité) et générez vos images d'anime de haute qualité."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la qualité des images générées par Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Animagine XL génère des images d'anime de qualité exceptionnelle. Le modèle a été entraîné avec un soin particulier apporté aux descriptions et comprend très bien les prompts. Il peut générer des mains avec une excellente anatomie et connaît près de 5000 personnages d'anime sans nécessiter de LoRA."
          }
        },
        {
          "@type": "Question",
          "name": "Animagine XL est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'activation d'Animagine XL coûte 100 tokens par utilisation. Une fois activé, vous avez accès à toutes les fonctionnalités : génération d'anime de haute qualité, connaissance de 5000+ personnages, pas de LoRA requis pour les personnages connus, et génération optimisée."
          }
        },
        {
          "@type": "Question",
          "name": "Dois-je utiliser des LoRAs avec Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, pour la plupart des personnages d'anime connus, vous n'avez pas besoin de LoRA. Animagine XL connaît déjà près de 5000 personnages et peut les générer simplement en utilisant leur nom dans le prompt. Vous pouvez cependant utiliser des LoRAs pour des personnages supplémentaires ou des styles spécifiques."
          }
        },
        {
          "@type": "Question",
          "name": "Quels paramètres recommandez-vous pour Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les créateurs recommandent d'utiliser une CFG Scale d'environ 5-7, de ne pas dépasser les 30 steps et d'utiliser l'échantillonneur Euler Ancestral. Ces paramètres optimisent la vitesse de génération sans compromettre la qualité des résultats."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait Animagine XL ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Animagine XL est fait pour les amateurs d'anime et de manga qui veulent créer des images de haute qualité, les artistes qui explorent la création d'anime avec l'IA, les créateurs de contenu qui ont besoin d'illustrations de style anime, et toute personne intéressée par la génération d'images d'anime avec l'IA."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-axl';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-axl';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-axl')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-axl')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-axl');
      const existingScript2 = document.getElementById('faq-schema-axl');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Charger les données du module Animagine XL depuis Supabase si disponible
  useEffect(() => {
    // Essayer de charger depuis Supabase pour mettre à jour les données si disponibles
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'animagine-xl')
          .single();

        if (!error && data) {
          // Si trouvé dans Supabase, utiliser ces données
          setCard(data);
        }
        // Sinon, garder les données par défaut déjà initialisées
      } catch (error) {
        // En cas d'erreur, garder les données par défaut
        console.log('Module Animagine XL non trouvé dans Supabase, utilisation des données par défaut');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
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

      {/* Bannière spéciale pour Animagine XL */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 py-8 relative overflow-hidden">
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
                Animagine XL : génération d'anime et manga par IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI GENERATION').toUpperCase()}
              </span>
              <p className="text-xl text-indigo-100 mb-6">
                Créez des images d'anime et de manga de haute qualité avec Animagine XL. Modèle SDXL super-optimisé, connaissance de 5000+ personnages d'anime, génération rapide sans LoRA requis. Parfait pour les amateurs d'anime, artistes et créateurs de contenu.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Génération anime
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📚 5000+ personnages
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Sans LoRA requis
                </span>
              </div>
            </div>
            
            {/* Visuel Animagine XL avec logo */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites animées */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-purple-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-pink-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Animagine XL centré avec effet 3D */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      {/* Icône anime/manga avec effet glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <svg className="w-24 h-24 relative z-10" viewBox="0 0 24 24" fill="none">
                          {/* Visage anime stylisé */}
                          <circle 
                            cx="12" cy="10" r="6" 
                            stroke="#6366F1" 
                            strokeWidth="2.5" 
                            fill="url(#gradientAnime)"
                            className="drop-shadow-lg"
                          />
                          <defs>
                            <linearGradient id="gradientAnime" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          {/* Yeux anime */}
                          <circle cx="9.5" cy="9" r="1.5" fill="#6366F1" />
                          <circle cx="14.5" cy="9" r="1.5" fill="#6366F1" />
                          {/* Bouche */}
                          <path 
                            d="M9 12 Q12 14 15 12" 
                            stroke="#6366F1" 
                            strokeWidth="2" 
                            fill="none"
                            strokeLinecap="round"
                          />
                          {/* Cheveux anime */}
                          <path 
                            d="M6 8 Q6 4 12 4 Q18 4 18 8" 
                            stroke="#6366F1" 
                            strokeWidth="2.5" 
                            fill="none"
                            className="drop-shadow-md"
                          />
                          {/* Étoile décorative */}
                          <path 
                            d="M12 2 L12.5 4 L14.5 4 L12.8 5.2 L13.3 7.2 L12 6 L10.7 7.2 L11.2 5.2 L9.5 4 L11.5 4 Z" 
                            fill="#A78BFA" 
                            className="animate-pulse"
                          >
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                          </path>
                        </svg>
                      </div>
                      {/* Texte Animagine XL */}
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Animagine XL
                        </div>
                        <div className="text-xs text-indigo-600/80 mt-1 font-medium">
                          SDXL pour Anime
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

      {/* Vidéos Animagine XL - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Vidéo - Démonstration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo de démonstration */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Démonstration Animagine XL</h3>
            <YouTubeEmbed
              videoId="SvBV65wQfCc"
              title="Animagine XL 3.0 - Is This The Best SDXL Anime Model Yet?"
              origin="https://iahome.fr"
            />
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
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
                {alreadyActivatedModules.includes(card.id) && (
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
                {!alreadyActivatedModules.includes(card.id) && (
                  <div className="w-3/4 mx-auto">
                    <ModuleActivationButton
                      moduleId={card.id}
                      moduleName={card.title}
                      moduleCost={100}
                      moduleDescription={card.description}
                      onActivationSuccess={() => {
                        setAlreadyActivatedModules(prev => [...prev, card.id]);
                        alert(`✅ Application ${card.title} activée avec succès ! Vous pouvez maintenant l'utiliser depuis vos applications.`);
                      }}
                      onActivationError={(error) => {
                        console.error('Erreur activation:', error);
                      }}
                    />
                  </div>
                )}

                {/* Bouton "Payer et activer" pour les modules payants */}
                {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && !alreadyActivatedModules.includes(card.id) && (
                  <button 
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = '/login';
                        return;
                      }

                      // Vérifier si le module est déjà activé avant de procéder au paiement
                      if (alreadyActivatedModules.includes(card.id)) {
                        alert(`ℹ️ L'application ${card.title} est déjà activée ! Vous pouvez l'utiliser depuis vos applications.`);
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

        {/* Section Exemples visuels Animagine XL */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Exemples de résultats Animagine XL</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exemple 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-sm text-indigo-700 font-medium">Style anime</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Génération anime</h4>
              <p className="text-sm text-gray-600">Créez des images d'anime de haute qualité avec une compréhension approfondie du style manga</p>
            </div>

            {/* Exemple 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">👤</div>
                  <div className="text-sm text-purple-700 font-medium">Personnages connus</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">5000+ personnages</h4>
              <p className="text-sm text-gray-600">Générez des personnages d'anime connus sans LoRA, simplement en utilisant leur nom</p>
            </div>

            {/* Exemple 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-indigo-50 rounded-2xl p-6 border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-indigo-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-sm text-pink-700 font-medium">Génération rapide</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Performance optimisée</h4>
              <p className="text-sm text-gray-600">Génération rapide avec CFG Scale 5-7 et 27 steps recommandés pour des résultats optimaux</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-pink-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-indigo-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-purple-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-4">
                  À propos d'Animagine XL
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl border-l-4 border-indigo-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>Animagine XL 3.1 est un modèle Stable Diffusion XL super-optimisé pour la génération d'images de type anime et manga.</strong> Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d'images et 500+ heures d'entraînement pour devenir le meilleur modèle open source de génération d'animes. Il connaît près de 5000 personnages d'anime et peut générer des images de haute qualité sans nécessiter de LoRA supplémentaires. C'est l'outil idéal pour les amateurs d'anime, artistes et créateurs de contenu qui veulent créer des images d'anime avec l'IA.
                  </p>
                </div>

                {/* H2 - À quoi sert Animagine XL ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    À quoi sert Animagine XL ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Animagine XL permet de créer des images d'anime et de manga de haute qualité avec une compréhension approfondie du style anime. Il répond aux besoins de ceux qui souhaitent générer des personnages d'anime, créer des illustrations de style manga, ou produire du contenu visuel inspiré de l'anime.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Créer des images d'anime :</strong> Générez des images d'anime de haute qualité avec un style authentique</li>
                      <li className="text-lg"><strong>Personnages connus :</strong> Générez près de 5000 personnages d'anime connus sans LoRA requis</li>
                      <li className="text-lg"><strong>Génération rapide :</strong> Créez des images d'anime rapidement avec des paramètres optimisés</li>
                      <li className="text-lg"><strong>Contrôle créatif :</strong> Utilisez des tags et prompts structurés pour un contrôle précis</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Créez des illustrations d'anime pour vos projets créatifs, générez des personnages d'anime connus, créez des images de style manga, produisez des visuels inspirés de l'anime pour vos campagnes, ou explorez la création d'anime avec l'IA.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire Animagine XL ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    Que peut faire Animagine XL ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                      <h3 className="text-2xl font-bold text-indigo-900 mb-4">Génération d'anime</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Créez des images d'anime de haute qualité avec un style authentique. Animagine XL a été entraîné avec un soin particulier apporté aux descriptions et comprend très bien les prompts pour générer des images d'anime exceptionnelles.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">5000+ personnages connus</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Animagine XL connaît près de 5000 personnages d'anime et peut les générer simplement en utilisant leur nom dans le prompt. Plus besoin de LoRA pour chaque personnage - le modèle les connaît déjà !
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                      <h3 className="text-2xl font-bold text-pink-900 mb-4">Génération optimisée</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Utilisez les paramètres recommandés (CFG Scale 5-7, Euler Ancestral, 27 steps) pour une génération rapide et optimale. Ces paramètres ont été testés et optimisés pour Animagine XL.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-2xl border border-violet-200">
                      <h3 className="text-2xl font-bold text-violet-900 mb-4">Tags de qualité</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Utilisez des tags de qualité (masterpiece, best quality, etc.) et des tags esthétiques (aesthetic, very aesthetic) pour influencer le style et la qualité de vos générations d'anime.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser Animagine XL ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser Animagine XL ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Activer Animagine XL</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Activez Animagine XL avec 100 tokens. Une fois activé, le service est accessible depuis vos applications actives via animagine-xl.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Structurer votre prompt</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Utilisez la structure recommandée : commencez par 1girl ou 1boy, suivi du nom du personnage (s'il est connu), puis les tags descriptifs, et enfin les tags de qualité (masterpiece, best quality). Exemple : "1girl, nami (one piece), one piece, solo, idol, masterpiece, best quality"
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-indigo-50 p-6 rounded-2xl border border-pink-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Configurer les paramètres</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Utilisez les paramètres recommandés : CFG Scale 5-7, échantillonneur Euler Ancestral, et 27 steps maximum. Ces paramètres optimisent la vitesse de génération sans compromettre la qualité.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6 rounded-2xl border border-indigo-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Générer et télécharger</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Animagine XL génère automatiquement vos images d'anime de haute qualité. Vous pouvez ensuite télécharger les images générées, les réutiliser, ou générer de nouvelles variations pour explorer différentes possibilités créatives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait Animagine XL ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait Animagine XL ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold text-indigo-900 mb-2">Amateurs d'anime</h3>
                      <p className="text-gray-700">Créez des images d'anime de haute qualité, générez vos personnages favoris, et explorez la création d'anime avec l'IA.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                      <div className="text-4xl mb-4">🖌️</div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Artistes et illustrateurs</h3>
                      <p className="text-gray-700">Créez des illustrations de style anime et manga, explorez de nouveaux styles artistiques, et produisez du contenu visuel inspiré de l'anime.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="text-xl font-bold text-pink-900 mb-2">Créateurs de contenu</h3>
                      <p className="text-gray-700">Générez des visuels de style anime pour vos projets, créez des illustrations pour vos contenus, et produisez des images d'anime personnalisées.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - Animagine XL vs autres modèles anime */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    Animagine XL vs autres modèles anime
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">Animagine XL</th>
                            <th className="border border-gray-300 p-4 text-center">Autres modèles</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Qualité anime</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Exceptionnelle (1,25M images)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon le modèle</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Personnages connus</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 5000+ personnages sans LoRA</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Nécessite souvent des LoRAs</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Entraînement</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 500+ heures d'entraînement</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Entraînement variable</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Optimisation</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Paramètres optimisés (CFG 5-7, 27 steps)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Paramètres à ajuster manuellement</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 tokens par utilisation</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Coûts variables</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> Animagine XL offre une alternative exceptionnelle aux autres modèles anime. Contrairement aux modèles qui nécessitent souvent des LoRAs pour chaque personnage, Animagine XL connaît déjà 5000+ personnages et peut les générer sans LoRA supplémentaire. C'est la solution idéale pour ceux qui veulent créer des images d'anime de haute qualité rapidement et efficacement.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur Animagine XL (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur Animagine XL (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce qu'Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Animagine XL 3.1 est un modèle Stable Diffusion XL spécialement entraîné pour la génération d'images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d'images et 500+ heures d'entraînement pour devenir le meilleur modèle open source de génération d'animes.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser Animagine XL, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via animagine-xl.iahome.fr. Utilisez la structure de prompt recommandée (1girl/1boy, nom du personnage, tags descriptifs, tags de qualité) et générez vos images d'anime de haute qualité.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la qualité des images générées par Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Animagine XL génère des images d'anime de qualité exceptionnelle. Le modèle a été entraîné avec un soin particulier apporté aux descriptions et comprend très bien les prompts. Il peut générer des mains avec une excellente anatomie et connaît près de 5000 personnages d'anime sans nécessiter de LoRA.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Animagine XL est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'activation d'Animagine XL coûte 100 tokens par utilisation. Une fois activé, vous avez accès à toutes les fonctionnalités : génération d'anime de haute qualité, connaissance de 5000+ personnages, pas de LoRA requis pour les personnages connus, et génération optimisée.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-2xl border-l-4 border-violet-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Dois-je utiliser des LoRAs avec Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Non, pour la plupart des personnages d'anime connus, vous n'avez pas besoin de LoRA. Animagine XL connaît déjà près de 5000 personnages et peut les générer simplement en utilisant leur nom dans le prompt. Vous pouvez cependant utiliser des LoRAs pour des personnages supplémentaires ou des styles spécifiques.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quels paramètres recommandez-vous pour Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Les créateurs recommandent d'utiliser une CFG Scale d'environ 5-7, de ne pas dépasser les 30 steps et d'utiliser l'échantillonneur Euler Ancestral. Ces paramètres optimisent la vitesse de génération sans compromettre la qualité des résultats.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait Animagine XL ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Animagine XL est fait pour les amateurs d'anime et de manga qui veulent créer des images de haute qualité, les artistes qui explorent la création d'anime avec l'IA, les créateurs de contenu qui ont besoin d'illustrations de style anime, et toute personne intéressée par la génération d'images d'anime avec l'IA.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Animagine XL est un modèle révolutionnaire qui transforme vos prompts en images d'anime de haute qualité. 
                    Cette technologie de pointe vous permet de créer des visuels d'anime authentiques avec une connaissance approfondie du style manga et des personnages d'anime.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Génération anime</h4>
                      <p className="text-gray-700 text-sm">Créez des images d'anime de haute qualité avec un style authentique.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">👤</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Personnages connus</h4>
                      <p className="text-gray-700 text-sm">5000+ personnages d'anime sans LoRA requis.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-pink-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Génération rapide avec paramètres optimisés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 sm:p-8 rounded-2xl border border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h4 className="font-bold text-violet-900 mb-3 text-lg">Qualité</h4>
                      <p className="text-gray-700 text-sm">Modèle entraîné avec 1,25M images et 500+ heures.</p>
                    </div>
                  </div>
                </div>
                
                {/* Informations pratiques */}
                <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-8 sm:p-12 rounded-2xl border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">€</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Prix</h5>
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 tokens par utilisation'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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

      {/* Section d'activation en bas de page */}
      <CardPageActivationSection
        moduleId={card?.id || 'animagine-xl'}
        moduleName="Animagine XL"
        tokenCost={100}
        tokenUnit="par utilisation"
        apiEndpoint="/api/activate-module"
        gradientColors="from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        icon="🎨"
        isModuleActivated={alreadyActivatedModules.includes(card?.id || '')}
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'Animagine XL',
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
