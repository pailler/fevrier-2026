'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import ModuleAccessButton from '../../../components/ModuleAccessButton';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
import CardPageActivationSection from '../../../components/CardPageActivationSection';
import { getHunyuan3dAppUrl } from '../../../utils/hunyuan3dAppUrl';

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

export default function Hunyuan3DPage() {
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
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Hunyuan 3D est un module payant
  const isFreeModule = false;

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = useCallback(async (moduleId: string, moduleUrl: string) => {
    if (!session?.user?.id) {
      alert('Vous devez être connecté pour accéder à ce module.');
      return;
    }

    try {
      // Générer un token d'accès (décompte tokens inclus)
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
        window.open(urlWithToken, '_blank');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Erreur lors de la génération du token d\'accès');
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Hunyuan 3D - IA Home",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Plateforme d'intelligence artificielle pour générer des modèles 3D réalistes à partir d'images. Hunyuan 3D transforme vos images 2D en modèles 3D détaillés avec textures précises, géométries complexes, et export multi-formats. Solution de génération 3D par IA développée par Tencent.",
      "url": "https://iahome.fr/card/hunyuan3d",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "350"
      },
      "featureList": [
        "Génération 3D à partir d'images",
        "Reconstruction 3D précise",
        "Textures et géométries détaillées",
        "Export multi-formats (OBJ, STL, PLY)",
        "Haute qualité professionnelle",
        "Interface intuitive",
        "Génération rapide",
        "IA de pointe Tencent"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que Hunyuan 3D ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hunyuan 3D est une plateforme d'intelligence artificielle qui transforme vos images en modèles 3D détaillés et réalistes. Basée sur les technologies d'IA les plus avancées développées par Tencent, elle offre une solution complète pour créer des objets 3D à partir d'images 2D avec une précision exceptionnelle."
          }
        },
        {
          "@type": "Question",
          "name": "Comment générer un modèle 3D avec Hunyuan 3D ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour générer un modèle 3D avec Hunyuan 3D, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface, uploadez une image 2D, et l'IA génère automatiquement un modèle 3D détaillé avec textures et géométries précises. Vous pouvez ensuite exporter le modèle dans les formats standards (OBJ, STL, PLY)."
          }
        },
        {
          "@type": "Question",
          "name": "Hunyuan 3D est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès du service Hunyuan 3D coûte 100 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez générer des modèles 3D. Il n'y a pas de frais supplémentaires pour la génération ou l'export des modèles."
          }
        },
        {
          "@type": "Question",
          "name": "Quels formats d'export sont supportés par Hunyuan 3D ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hunyuan 3D supporte l'export dans les formats standards 3D : OBJ, STL, et PLY. Ces formats sont compatibles avec la plupart des logiciels de design 3D, d'impression 3D, et de visualisation, garantissant une intégration facile dans vos workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la qualité des modèles 3D générés ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les modèles 3D générés par Hunyuan 3D sont de haute qualité professionnelle avec des textures précises, des géométries détaillées, et une reconstruction fidèle de l'image source. Les modèles sont prêts pour l'impression 3D, l'utilisation dans des projets de design, ou l'intégration dans des applications VR/AR."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je utiliser Hunyuan 3D sans compétences en modélisation 3D ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, Hunyuan 3D est conçu pour être accessible à tous, même sans compétences en modélisation 3D. L'interface est intuitive et la génération est entièrement automatisée par l'IA. Il suffit d'uploader une image et l'IA génère le modèle 3D automatiquement."
          }
        },
        {
          "@type": "Question",
          "name": "Quels types d'images puis-je utiliser avec Hunyuan 3D ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hunyuan 3D peut traiter différents types d'images : objets du quotidien, créations artistiques, produits, sculptures, et bien plus. L'IA s'adapte à vos besoins et génère des modèles 3D adaptés à chaque type d'objet. Pour de meilleurs résultats, utilisez des images claires et bien éclairées."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-hy3d';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-hy3d';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-hy3d')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-hy3d')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-hy3d');
      const existingScript2 = document.getElementById('faq-schema-hy3d');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Charger les détails de la carte
  useEffect(() => {
    const fetchCardDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 'hunyuan3d')
          .single();

        if (error) {
          router.push('/');
          return;
        }

        if (data) {
          // Forcer l'URL YouTube si elle est vide
          if (!data.youtube_url || data.youtube_url.trim() === '') {
            data.youtube_url = 'https://www.youtube.com/embed/CP2cDFgbs8s?autoplay=0&rel=0&modestbranding=1';
          }
          // App opérationnelle : Hi3DGen sur le domaine principal (remplace hunyuan3d.iahome.fr)
          data.url = getHunyuan3dAppUrl();
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
      
      // Appeler l'API pour Accéder à le module Hunyuan 3D
      const response = await fetch('/api/activate-hunyuan3d', {
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

  const handleAccessClick = async (card: Card) => {
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    if (card?.url) {
      try {
        // Générer un token d'accès (décompte tokens inclus)
        const response = await fetch('/api/generate-access-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId: card.id,
            userId: session.user.id,
            userEmail: session.user.email,
          }),
        });

        if (response.ok) {
          const { token } = await response.json();
          const separator = card.url.includes('?') ? '&' : '?';
          const urlWithToken = `${card.url}${separator}token=${encodeURIComponent(token)}`;
          window.open(urlWithToken, '_blank');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          throw new Error(errorData.error || 'Erreur lors de la génération du token d\'accès');
        }
      } catch (error) {
        console.error('Erreur inattendue lors de l\'accès au module:', error);
        alert(`Une erreur inattendue est survenue lors de l'accès au module: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    } else {
      alert('URL du module non disponible.');
    }
  };

  const handleDemoClick = (card: Card) => {
    if (card?.demo_url) {
      setIframeModal({
        isOpen: true,
        url: card.demo_url,
        title: `Démo - ${card.title}`
      });
    } else {
      alert('URL de démo non disponible.');
    }
  };

  const handleQuickAccess = () => {
    if (card?.url) {
      accessModuleWithJWT(card.id, card.url);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: card?.title || 'Hunyuan 3D' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour Hunyuan 3D */}
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
                Hunyuan 3D : génération de modèles 3D à partir d'images avec l'IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'IA').toUpperCase()}
              </span>
              <p className="text-xl text-purple-100 mb-6">
                Générez des modèles 3D réalistes à partir d'images avec Hunyuan 3D. Intelligence artificielle pour créer des objets 3D détaillés, textures précises, export multi-formats. Génération 3D par IA de Tencent.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎲 Génération 3D
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🖼️ Image vers 3D
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Haute qualité
                </span>
              </div>

            </div>
            
            {/* Logo Hunyuan 3D animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites 3D */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 transform rotate-45 opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo 3D centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-purple-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Cube 3D stylisé */}
                      <path 
                        d="M12 2 L20 6 L20 14 L12 18 L4 14 L4 6 Z" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 2 L20 6 L12 10 L4 6 Z" 
                        stroke="#6366F1" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M20 6 L20 14 L12 18 L12 10 Z" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      
                      {/* Particules 3D */}
                      <circle cx="6" cy="6" r="1" fill="#8B5CF6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="18" cy="6" r="1" fill="#6366F1" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="6" cy="18" r="1" fill="#3B82F6" className="animate-pulse">
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

      {/* Vidéo Hunyuan 3D - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Vidéo de démonstration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo de démonstration */}
          <YouTubeEmbed
            videoId="CP2cDFgbs8s"
            title="Démonstration Hunyuan 3D"
            origin="https://iahome.fr"
          />
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                {/* Bouton d'accès avec tokens */}
                <div className="w-3/4 mx-auto">
                  <ModuleAccessButton
                    moduleId={card?.id || 'hunyuan3d'}
                    moduleName={card?.title || 'Hunyuan 3D'}
                    moduleCost={100}
                    moduleDescription={card?.description || 'Application Hunyuan 3D accessible'}
                    onAccessSuccess={() => {
                      alert(`✅ Application ${card?.title || 'Hunyuan 3D'} accessible avec succès !`);
                    }}
                    onAccessError={(error) => {
                      console.error('Erreur accès:', error);
                    }}
                  />
                </div>

                {/* Bouton de démo */}
                {card?.demo_url && (
                  <div className="w-3/4 mx-auto">
                    <button
                      onClick={() => handleDemoClick(card)}
                      className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-300 shadow-md"
                    >
                      <span className="mr-2">▶️</span>
                      Voir la démo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section SEO optimisée - Contenu structuré */}
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
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-2xl mb-8 border-l-4 border-purple-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>Hunyuan 3D est une plateforme d'intelligence artificielle qui transforme vos images en modèles 3D détaillés et réalistes.</strong> Basée sur les technologies d'IA les plus avancées développées par Tencent, elle offre une solution complète pour créer des objets 3D à partir d'images 2D avec une précision exceptionnelle. Les modèles générés incluent des textures précises, des géométries complexes, et peuvent être exportés dans les formats standards (OBJ, STL, PLY) pour l'impression 3D, le design, ou l'intégration dans des applications VR/AR.
                </p>
              </div>

              {/* H2 - À quoi sert Hunyuan 3D ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert Hunyuan 3D ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Hunyuan 3D permet de créer des modèles 3D à partir d'images sans compétences en modélisation 3D. Il répond aux besoins de ceux qui souhaitent générer rapidement des objets 3D pour leurs projets, prototyper des idées, ou créer des assets 3D sans passer par des logiciels complexes.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Génération rapide :</strong> Créez des modèles 3D en quelques secondes à partir d'images, sans compétences en modélisation 3D complexes</li>
                    <li className="text-lg"><strong>Prototypage :</strong> Prototypez rapidement vos idées en 3D, créez des concepts visuels pour vos projets, ou générez des modèles pour l'impression 3D</li>
                    <li className="text-lg"><strong>Création d'assets :</strong> Créez des assets 3D pour vos jeux vidéo, applications VR/AR, ou visualisations interactives sans compétences en modélisation</li>
                    <li className="text-lg"><strong>Exploration artistique :</strong> Explorez de nouvelles formes de création artistique, générez des sculptures numériques ou des objets d'art uniques</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Créez des modèles 3D de produits pour vos catalogues, générez des assets pour vos jeux vidéo, prototypez des designs avant production, créez des modèles pour l'impression 3D, ou explorez de nouvelles formes de création artistique.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire Hunyuan 3D ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire Hunyuan 3D ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Image vers 3D</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Transformez vos images 2D en modèles 3D avec une reconstruction précise de la géométrie et des textures. L'IA analyse l'image et génère automatiquement un modèle 3D détaillé.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">Haute qualité</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Obtenez des modèles 3D détaillés et réalistes avec des textures précises et des géométries complexes. Les modèles sont prêts pour l'impression 3D ou l'utilisation dans vos projets.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Export multi-formats</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Exportez vos modèles 3D dans les formats standards (OBJ, STL, PLY) pour une compatibilité maximale avec vos outils de design, d'impression 3D, ou de visualisation.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                    <h3 className="text-2xl font-bold text-cyan-900 mb-4">Génération rapide</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Créez des modèles 3D en quelques secondes. L'IA traite l'image et génère le modèle 3D automatiquement, sans intervention manuelle nécessaire.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser Hunyuan 3D ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser Hunyuan 3D ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à Hunyuan 3D</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à Hunyuan 3D avec 100 tokens. L'accès est immédiat, le service est accessible depuis vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Uploader une image</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Uploadez une image 2D de l'objet que vous souhaitez transformer en modèle 3D. Pour de meilleurs résultats, utilisez des images claires et bien éclairées.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Générer le modèle 3D</h3>
                        <p className="text-gray-700 leading-relaxed">
                          L'IA analyse l'image et génère automatiquement un modèle 3D détaillé avec textures et géométries précises. La génération prend généralement quelques secondes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border border-cyan-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Exporter le modèle</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Téléchargez votre modèle 3D dans le format de votre choix (OBJ, STL, PLY) et utilisez-le dans vos projets, pour l'impression 3D, ou dans vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait Hunyuan 3D ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait Hunyuan 3D ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Designers</h3>
                    <p className="text-gray-700">Prototypez rapidement vos idées en 3D, créez des concepts visuels pour vos projets, ou générez des modèles pour l'impression 3D.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                    <div className="text-4xl mb-4">👨‍💻</div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Développeurs</h3>
                    <p className="text-gray-700">Créez des assets 3D pour vos jeux vidéo, applications VR/AR, ou visualisations interactives sans compétences en modélisation.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">🎭</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Artistes</h3>
                    <p className="text-gray-700">Explorez de nouvelles formes de création artistique, générez des sculptures numériques ou des objets d'art uniques.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
                    <div className="text-4xl mb-4">🏭</div>
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">Entreprises</h3>
                    <p className="text-gray-700">Créez des modèles 3D de produits pour vos catalogues, prototypez des designs avant production, ou générez des visualisations.</p>
                  </div>
                </div>
              </div>

              {/* H2 - Hunyuan 3D vs modélisation 3D traditionnelle */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Hunyuan 3D vs modélisation 3D traditionnelle</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">Hunyuan 3D</th>
                          <th className="border border-gray-300 p-4 text-center">Modélisation traditionnelle</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Temps de création</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Quelques secondes</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Heures ou jours</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Compétences requises</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune compétence</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Compétences avancées</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Source</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Image 2D</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Création manuelle</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Précision</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Haute précision IA</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Contrôle total</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Coût</td>
                          <td className="border border-gray-300 p-4 text-center">100 tokens</td>
                          <td className="border border-gray-300 p-4 text-center">Logiciels payants</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> Hunyuan 3D offre une alternative rapide et accessible à la modélisation 3D traditionnelle. Contrairement aux logiciels de modélisation qui nécessitent des compétences avancées et des heures de travail, Hunyuan 3D génère des modèles 3D en quelques secondes à partir d'une simple image, sans compétences en modélisation. C'est la solution idéale pour ceux qui veulent créer des modèles 3D rapidement sans passer par des logiciels complexes.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur Hunyuan 3D (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur Hunyuan 3D (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que Hunyuan 3D ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Hunyuan 3D est une plateforme d'intelligence artificielle qui transforme vos images en modèles 3D détaillés et réalistes. Basée sur les technologies d'IA les plus avancées développées par Tencent, elle offre une solution complète pour créer des objets 3D à partir d'images 2D avec une précision exceptionnelle.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment générer un modèle 3D avec Hunyuan 3D ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour générer un modèle 3D avec Hunyuan 3D, accédez directement au service avec 100 tokens. L'accès est immédiat, accédez à l'interface, uploadez une image 2D, et l'IA génère automatiquement un modèle 3D détaillé avec textures et géométries précises. Vous pouvez ensuite exporter le modèle dans les formats standards (OBJ, STL, PLY).
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Hunyuan 3D est-il gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'accès du service Hunyuan 3D coûte 100 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez générer des modèles 3D. Il n'y a pas de frais supplémentaires pour la génération ou l'export des modèles.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels formats d'export sont supportés par Hunyuan 3D ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Hunyuan 3D supporte l'export dans les formats standards 3D : OBJ, STL, et PLY. Ces formats sont compatibles avec la plupart des logiciels de design 3D, d'impression 3D, et de visualisation, garantissant une intégration facile dans vos workflows.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la qualité des modèles 3D générés ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les modèles 3D générés par Hunyuan 3D sont de haute qualité professionnelle avec des textures précises, des géométries détaillées, et une reconstruction fidèle de l'image source. Les modèles sont prêts pour l'impression 3D, l'utilisation dans des projets de design, ou l'intégration dans des applications VR/AR.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je utiliser Hunyuan 3D sans compétences en modélisation 3D ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, Hunyuan 3D est conçu pour être accessible à tous, même sans compétences en modélisation 3D. L'interface est intuitive et la génération est entièrement automatisée par l'IA. Il suffit d'uploader une image et l'IA génère le modèle 3D automatiquement.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels types d'images puis-je utiliser avec Hunyuan 3D ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Hunyuan 3D peut traiter différents types d'images : objets du quotidien, créations artistiques, produits, sculptures, et bien plus. L'IA s'adapte à vos besoins et génère des modèles 3D adaptés à chaque type d'objet. Pour de meilleurs résultats, utilisez des images claires et bien éclairées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description principale */}
              <div className="text-center max-w-5xl mx-auto mb-8">
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                  Hunyuan 3D est une plateforme d'intelligence artificielle révolutionnaire qui transforme vos idées en modèles 3D détaillés. 
                  Cette technologie de pointe vous permet de créer des objets 3D réalistes à partir d'images en quelques secondes.
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
      </section>

      {/* Contenu détaillé Hunyuan 3D */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Découvrez la puissance de la génération 3D par IA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hunyuan 3D révolutionne la façon dont vous créez des modèles 3D, 
              avec une précision et une rapidité exceptionnelles.
            </p>
          </div>

          {/* Description détaillée en plusieurs chapitres */}
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Chapitre 1: Qu'est-ce que Hunyuan 3D */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h4 className="text-2xl font-bold text-purple-900">Qu'est-ce que Hunyuan 3D ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Hunyuan 3D est une plateforme d'intelligence artificielle de nouvelle génération qui transforme 
                  vos images en modèles 3D détaillés et réalistes. 
                  Basée sur les technologies d'IA les plus avancées, elle offre une solution complète pour tous vos besoins de création 3D.
                </p>
                <p className="text-base leading-relaxed">
                  Développée avec les dernières avancées en intelligence artificielle, cette plateforme 
                  vous donne accès à des capacités de génération 3D de niveau professionnel, 
                  le tout dans une interface moderne et intuitive accessible depuis n'importe quel navigateur.
                </p>
              </div>
            </div>

            {/* Chapitre 2: Pourquoi choisir Hunyuan 3D */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir Hunyuan 3D ?</h4>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  <strong>Génération rapide :</strong> Créez des modèles 3D en quelques secondes à partir d'images. 
                  Plus besoin de compétences en modélisation 3D complexes.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Haute qualité :</strong> Obtenez des modèles 3D détaillés et réalistes avec des textures et des géométries précises, 
                  prêts pour l'impression 3D ou l'utilisation dans vos projets.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Polyvalence :</strong> Générez des objets 3D de toutes sortes, des objets du quotidien aux créations artistiques complexes. 
                  L'IA s'adapte à vos besoins.
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
                  <strong>Image vers 3D :</strong> Transformez vos images 2D en modèles 3D avec une reconstruction précise de la géométrie et des textures.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Export multi-formats :</strong> Exportez vos modèles 3D dans les formats standards (OBJ, STL, PLY) 
                  pour une compatibilité maximale avec vos outils de design.
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
                  <strong>Designers :</strong> Prototypez rapidement vos idées en 3D, créez des concepts visuels pour vos projets, 
                  générez des modèles pour l'impression 3D.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Développeurs :</strong> Créez des assets 3D pour vos jeux vidéo, applications VR/AR, 
                  ou visualisations interactives sans compétences en modélisation.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Artistes :</strong> Explorez de nouvelles formes de création artistique, 
                  générez des sculptures numériques ou des objets d'art uniques.
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
                  <strong>IA Générative 3D :</strong> Modèles d'intelligence artificielle spécialisés dans la génération 3D, 
                  entraînés sur des millions de modèles 3D pour une qualité maximale.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Reconstruction 3D :</strong> Algorithmes avancés de reconstruction de géométrie 3D à partir d'images 2D, 
                  avec préservation des détails et des textures.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Infrastructure Cloud :</strong> Déploiement sécurisé et scalable avec des ressources GPU dédiées, 
                  garantissant des temps de génération rapides et une qualité optimale.
                </p>
              </div>
            </div>
          </div>
          
          {/* Fonctionnalités principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 my-12">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h4 className="font-bold text-indigo-900 mb-3 text-lg">Image vers 3D</h4>
                <p className="text-gray-700 text-sm">Reconstruction 3D précise à partir d'images 2D.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-3 text-lg">Haute qualité</h4>
                <p className="text-gray-700 text-sm">Modèles 3D détaillés avec textures et géométries précises.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <h4 className="font-bold text-cyan-900 mb-3 text-lg">Export</h4>
                <p className="text-gray-700 text-sm">Export dans les formats standards (OBJ, STL, PLY).</p>
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
                  <p className="text-gray-600 text-sm">100 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez</p>
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
          
          {/* Liens utiles */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Liens utiles</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/Tencent/Hunyuan3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="mr-2">🔗</span>
                GitHub Tencent
              </a>
              <a
                href="https://github.com/Tencent/Hunyuan3D#readme"
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
        moduleId={card?.id || 'hunyuan3d'}
        moduleName="Hunyuan 3D"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-hunyuan3d"
        gradientColors="from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        icon="🎭"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        moduleCategory={card?.category}
        moduleUrl={card?.url}
      />
    </div>
  );
}







