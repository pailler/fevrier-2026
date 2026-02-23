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

export default function StableDiffusionPage() {
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

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // StableDiffusion est payant

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
      // Rediriger directement vers stablediffusion via sous-domaine
      const accessUrl = 'https://stablediffusion.iahome.fr';
      console.log('🔗 stablediffusion: Accès direct à:', accessUrl);
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
      "name": "Stable Diffusion - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. Cette technologie de pointe utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Résolution jusqu'à 1024x1024 pixels, contrôle artistique avancé, génération rapide.",
      "url": "https://iahome.fr/card/stablediffusion",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "720"
      },
      "featureList": [
        "Génération text-to-image",
        "Qualité professionnelle",
        "Résolution jusqu'à 1024x1024",
        "Contrôle artistique avancé",
        "Styles variés (photoréalisme, art abstrait)",
        "Génération rapide",
        "Filtres de contenu",
        "Interface intuitive"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que Stable Diffusion ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. Développé par Stability AI, cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser Stable Diffusion ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser Stable Diffusion, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface via stablediffusion.iahome.fr. Entrez une description textuelle détaillée de l'image que vous souhaitez créer, ajustez les paramètres de génération (style, composition, ambiance) si nécessaire, et l'IA génère automatiquement votre image. Plus votre description est détaillée, plus le résultat sera précis."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la qualité des images générées par Stable Diffusion ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stable Diffusion génère des images de qualité professionnelle qui rivalisent avec celles créées par des artistes professionnels. Les images peuvent atteindre une résolution de 1024x1024 pixels avec une attention particulière aux détails, à la composition et à l'esthétique. La qualité varie selon la description fournie et les paramètres choisis, mais les résultats sont généralement d'un niveau très élevé."
          }
        },
        {
          "@type": "Question",
          "name": "Stable Diffusion est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès de Stable Diffusion coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération text-to-image, contrôle artistique avancé, résolution jusqu'à 1024x1024, et interface intuitive. Il n'y a pas de frais supplémentaires pour la génération d'images."
          }
        },
        {
          "@type": "Question",
          "name": "Quels styles d'images puis-je créer avec Stable Diffusion ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stable Diffusion offre une flexibilité créative maximale. Vous pouvez créer des images photoréalistes, de l'art abstrait, des styles artistiques classiques, des portraits, des paysages, des illustrations, des concepts visuels, et bien plus. Du photoréalisme à l'art abstrait, en passant par les styles artistiques classiques, Stable Diffusion s'adapte à tous vos besoins créatifs."
          }
        },
        {
          "@type": "Question",
          "name": "Combien de temps prend la génération d'une image ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Grâce à notre infrastructure haute performance, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Le temps de génération dépend de la complexité de la description et de la résolution choisie, mais généralement, une image est générée en moins d'une minute."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait Stable Diffusion ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stable Diffusion est fait pour plusieurs types d'utilisateurs : artistes et designers qui créent des concepts visuels et explorent de nouveaux styles artistiques, professionnels du marketing et de la publicité qui génèrent des visuels uniques pour leurs campagnes, créateurs de contenu qui ont besoin d'images personnalisées, et toute personne qui veut créer des images de haute qualité avec l'IA."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-sd';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-sd';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-sd')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-sd')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-sd');
      const existingScript2 = document.getElementById('faq-schema-sd');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Charger les détails de la carte
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'stablediffusion')
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

      {/* Bannière spéciale pour StableDiffusion */}
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
                Stable Diffusion : génération d'images par IA de haute qualité
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI GENERATION').toUpperCase()}
              </span>
              <p className="text-xl text-purple-100 mb-6">
                Créez des images de haute qualité avec Stable Diffusion. Génération d'images par IA à partir de descriptions textuelles, qualité professionnelle, résolution jusqu'à 1024x1024. Parfait pour artistes, designers, marketing et créateurs de contenu.
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
            </div>
            
            {/* Logo StableDiffusion animé */}
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

      {/* Vidéos StableDiffusion - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Première vidéo - Introduction */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Introduction à StableDiffusion</h3>
          <div className="max-w-4xl mx-auto">
            <YouTubeEmbed
              videoId="L-gOZrVjHKA"
              title="Introduction StableDiffusion"
              origin="https://iahome.fr"
            />
          </div>
        </div>

        {/* Deuxième vidéo - Démonstration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo de démonstration */}
          <YouTubeEmbed
            videoId="2hH2-esDBQY"
            title="Démonstration StableDiffusion"
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
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
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
                  À propos de StableDiffusion
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-2xl border-l-4 border-purple-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité.</strong> Développé par Stability AI, cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Avec résolution jusqu'à 1024x1024 pixels, contrôle artistique avancé, et génération rapide, c'est l'outil idéal pour artistes, designers, professionnels du marketing et créateurs de contenu qui veulent créer des visuels uniques et créatifs.
                  </p>
                </div>

                {/* H2 - À quoi sert Stable Diffusion ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    À quoi sert Stable Diffusion ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Stable Diffusion permet de créer des images de haute qualité à partir de descriptions textuelles avec une précision et une créativité exceptionnelles. Il répond aux besoins de ceux qui souhaitent générer des visuels uniques, créer des concepts artistiques, ou produire des images professionnelles sans compétences en design.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Créer des images personnalisées :</strong> Générez des visuels uniques à partir de descriptions textuelles détaillées</li>
                      <li className="text-lg"><strong>Explorer la créativité :</strong> Testez différents styles artistiques, compositions et ambiances</li>
                      <li className="text-lg"><strong>Produire du contenu visuel :</strong> Créez des images pour vos projets marketing, publicitaires ou créatifs</li>
                      <li className="text-lg"><strong>Visualiser des concepts :</strong> Transformez vos idées en images concrètes rapidement</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Créez des concepts visuels pour vos projets artistiques, générez des visuels uniques pour vos campagnes marketing, créez des mockups de produits, produisez des supports pédagogiques, explorez de nouveaux styles artistiques, ou visualisez des concepts complexes.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire Stable Diffusion ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Que peut faire Stable Diffusion ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">Génération text-to-image</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Transformez vos idées en images en décrivant simplement ce que vous voulez voir. Plus votre description est détaillée, plus le résultat sera précis. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                      <h3 className="text-2xl font-bold text-indigo-900 mb-4">Contrôle artistique</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Ajustez les paramètres de génération pour influencer le style, la composition, et l'ambiance de vos créations selon vos préférences. Du photoréalisme à l'art abstrait, en passant par les styles artistiques classiques.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">Résolution haute définition</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Générez des images jusqu'à 1024x1024 pixels avec une qualité professionnelle adaptée à tous vos projets. Les images générées rivalisent avec celles créées par des artistes professionnels.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-4">Performance optimisée</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Grâce à notre infrastructure haute performance, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Génération rapide sans compromis sur la qualité.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser Stable Diffusion ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser Stable Diffusion ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à Stable Diffusion</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Accédez à Stable Diffusion avec 100 tokens. L'accès est immédiat, le service est accessible depuis vos applications via stablediffusion.iahome.fr.
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
                            Entrez une description textuelle détaillée de l'image que vous souhaitez créer. Plus votre description est précise et détaillée, plus le résultat sera fidèle à vos attentes. Incluez des détails sur le style, les couleurs, la composition, et l'ambiance.
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
                            L'IA génère automatiquement votre image en quelques secondes. Vous pouvez ensuite télécharger l'image générée, la réutiliser, ou générer de nouvelles variations pour explorer différentes possibilités créatives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait Stable Diffusion ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait Stable Diffusion ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Artistes et designers</h3>
                      <p className="text-gray-700">Créez des concepts visuels, des illustrations personnalisées, et explorez de nouveaux styles artistiques pour vos projets créatifs.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-indigo-900 mb-2">Marketing et publicité</h3>
                      <p className="text-gray-700">Générez des visuels uniques pour vos campagnes, des mockups de produits, et des contenus visuels engageants.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Éducation et recherche</h3>
                      <p className="text-gray-700">Visualisez des concepts complexes, créez des supports pédagogiques, et explorez les possibilités de l'IA générative.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - Stable Diffusion vs autres générateurs d'images */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Stable Diffusion vs autres générateurs d'images
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">Stable Diffusion</th>
                            <th className="border border-gray-300 p-4 text-center">Autres générateurs</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Qualité</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Professionnelle (1024x1024)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon le service</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Flexibilité créative</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Styles variés (photoréalisme, art abstrait)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent limité à un style</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Contrôle artistique</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Paramètres ajustables (style, composition, ambiance)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Contrôle limité</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Performance</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Génération rapide (quelques secondes)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Temps variable</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Abonnements mensuels souvent chers</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> Stable Diffusion offre une alternative de qualité professionnelle aux autres générateurs d'images. Contrairement aux services qui se limitent souvent à un style ou qui ont un contrôle artistique limité, Stable Diffusion combine qualité professionnelle, flexibilité créative maximale, et contrôle artistique avancé dans une seule interface. C'est la solution idéale pour ceux qui veulent créer des images de haute qualité avec une précision et une créativité exceptionnelles.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur Stable Diffusion (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur Stable Diffusion (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Stable Diffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. Développé par Stability AI, cette technologie utilise l'apprentissage profond pour créer des images photoréalistes, des œuvres artistiques, des portraits, des paysages et des illustrations avec un niveau de détail et de réalisme exceptionnel. Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser Stable Diffusion, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface via stablediffusion.iahome.fr. Entrez une description textuelle détaillée de l'image que vous souhaitez créer, ajustez les paramètres de génération (style, composition, ambiance) si nécessaire, et l'IA génère automatiquement votre image. Plus votre description est détaillée, plus le résultat sera précis.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la qualité des images générées par Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Stable Diffusion génère des images de qualité professionnelle qui rivalisent avec celles créées par des artistes professionnels. Les images peuvent atteindre une résolution de 1024x1024 pixels avec une attention particulière aux détails, à la composition et à l'esthétique. La qualité varie selon la description fournie et les paramètres choisis, mais les résultats sont généralement d'un niveau très élevé.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Stable Diffusion est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'accès de Stable Diffusion coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à toutes les fonctionnalités : génération text-to-image, contrôle artistique avancé, résolution jusqu'à 1024x1024, et interface intuitive. Il n'y a pas de frais supplémentaires pour la génération d'images.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quels styles d'images puis-je créer avec Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Stable Diffusion offre une flexibilité créative maximale. Vous pouvez créer des images photoréalistes, de l'art abstrait, des styles artistiques classiques, des portraits, des paysages, des illustrations, des concepts visuels, et bien plus. Du photoréalisme à l'art abstrait, en passant par les styles artistiques classiques, Stable Diffusion s'adapte à tous vos besoins créatifs.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Combien de temps prend la génération d'une image ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Grâce à notre infrastructure haute performance, vous obtenez des résultats en quelques secondes, même pour les images les plus complexes. Le temps de génération dépend de la complexité de la description et de la résolution choisie, mais généralement, une image est générée en moins d'une minute.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-lime-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait Stable Diffusion ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Stable Diffusion est fait pour plusieurs types d'utilisateurs : artistes et designers qui créent des concepts visuels et explorent de nouveaux styles artistiques, professionnels du marketing et de la publicité qui génèrent des visuels uniques pour leurs campagnes, créateurs de contenu qui ont besoin d'images personnalisées, et toute personne qui veut créer des images de haute qualité avec l'IA.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    StableDiffusion est un modèle d'intelligence artificielle révolutionnaire qui transforme vos descriptions textuelles en images de haute qualité. 
                    Cette technologie de pointe vous permet de créer des visuels uniques et créatifs en quelques secondes.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que StableDiffusion */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Qu'est-ce que StableDiffusion ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        StableDiffusion est un modèle de génération d'images par diffusion stable, développé par Stability AI. 
                        Cette technologie révolutionnaire utilise l'apprentissage profond pour créer des images photoréalistes 
                        à partir de descriptions textuelles détaillées.
                      </p>
                      <p className="text-base leading-relaxed">
                        Contrairement aux générateurs d'images traditionnels, StableDiffusion excelle dans la création d'œuvres 
                        artistiques, de portraits, de paysages et d'illustrations avec un niveau de détail et de réalisme exceptionnel. 
                        Le modèle comprend les nuances subtiles du langage et les traduit en visuels cohérents.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir StableDiffusion */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Pourquoi choisir StableDiffusion ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Qualité exceptionnelle :</strong> Les images générées rivalisent avec celles créées par des artistes professionnels, 
                        avec une attention particulière aux détails, à la composition et à l'esthétique.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Flexibilité créative :</strong> Du photoréalisme à l'art abstrait, en passant par les styles artistiques 
                        classiques, StableDiffusion s'adapte à tous vos besoins créatifs.
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

                  {/* Chapitre 5: Sécurité et éthique */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-8 rounded-2xl border border-teal-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-teal-900">Sécurité et éthique</h4>
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
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 tokens par accès, et utilisez l\'application aussi longtemps que vous souhaitez'}
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
                
                {/* Call to action */}
                <div className="text-center pt-8">
                  <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-4xl mx-auto">
                    Prêt à créer des images extraordinaires avec StableDiffusion ? Commencez dès maintenant et explorez les possibilités infinies de l'IA générative !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
        moduleId={card?.id || 'stablediffusion'}
        moduleName="Stable Diffusion"
        tokenCost={100}
        tokenUnit="par accès, et utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        icon="🎨"
        isModuleActivated={alreadyActivatedModules.includes(card?.id || '')}
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'Stable Diffusion',
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





