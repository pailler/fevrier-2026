'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
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

export default function ComfyUIPage() {
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

  // Vérifier si c'est un module gratuit
  const isFreeModule = false; // ComfyUI est payant

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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ComfyUI - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "ComfyUI est une interface graphique avancée pour créer des workflows d'intelligence artificielle complexes. Système de nœuds modulaires, workflows réutilisables, contrôle granulaire. Parfait pour artistes, développeurs et professionnels du marketing. Interface graphique intuitive accessible à tous les niveaux d'expertise technique.",
      "url": "https://iahome.fr/card/comfyui",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "320"
      },
      "featureList": [
        "Interface graphique intuitive",
        "Système de nœuds modulaires",
        "Workflows réutilisables",
        "Contrôle granulaire des paramètres",
        "Performance optimisée",
        "Architecture modulaire",
        "Extensibilité avancée",
        "Accessibilité pour tous niveaux"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que ComfyUI ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ComfyUI est une interface graphique avancée conçue pour créer et exécuter des workflows d'intelligence artificielle complexes. Contrairement aux interfaces traditionnelles, ComfyUI utilise un système de nœuds visuels qui permet de connecter différents modules d'IA de manière intuitive et flexible. Cette plateforme transforme la façon dont vous interagissez avec les modèles d'IA, en vous donnant un contrôle total sur chaque étape de votre processus de génération."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser ComfyUI ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser ComfyUI, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface graphique via comfyui.iahome.fr. Créez vos workflows en connectant des nœuds visuels selon vos besoins : générateurs, processeurs, filtres. Ajustez chaque paramètre avec précision, sauvegardez vos workflows pour les réutiliser, et exécutez vos processus d'IA complexes avec une flexibilité maximale."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont les avantages de ComfyUI par rapport aux autres interfaces IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ComfyUI offre plusieurs avantages : flexibilité maximale pour créer des workflows personnalisés sans limitation de complexité, interface intuitive accessible même sans connaissances techniques approfondies, performance optimisée pour des temps de traitement rapides, architecture modulaire pour une maintenance facile, extensibilité pour ajouter de nouveaux nœuds et fonctionnalités, et contrôle granulaire sur chaque paramètre de vos modèles d'IA."
          }
        },
        {
          "@type": "Question",
          "name": "ComfyUI est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès de ComfyUI coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à l'interface graphique complète avec toutes les fonctionnalités : système de nœuds modulaires, workflows réutilisables, contrôle granulaire, et performance optimisée."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait ComfyUI ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ComfyUI est fait pour plusieurs types d'utilisateurs : artistes et créateurs qui veulent créer des workflows de génération d'images complexes et combiner différents modèles d'IA, développeurs et chercheurs qui testent et optimisent leurs modèles d'IA et créent des pipelines personnalisés, et professionnels du marketing qui automatisent la génération de contenu visuel et optimisent leurs processus créatifs."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je sauvegarder et partager mes workflows ComfyUI ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, ComfyUI permet de sauvegarder et partager vos workflows créés. Cette fonctionnalité permet une collaboration efficace et la réutilisation de processus complexes. Vous pouvez sauvegarder vos configurations de nœuds, vos paramètres personnalisés, et vos pipelines d'IA pour les utiliser ultérieurement ou les partager avec d'autres utilisateurs."
          }
        },
        {
          "@type": "Question",
          "name": "Quels types de workflows puis-je créer avec ComfyUI ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Avec ComfyUI, vous pouvez créer une grande variété de workflows d'IA : génération d'images complexes avec combinaison de modèles, pipelines de post-traitement personnalisés, workflows de test et optimisation de modèles, processus de traitement d'images automatisés, pipelines créatifs pour artistes, et workflows de recherche pour développeurs. La flexibilité du système de nœuds permet de créer pratiquement n'importe quel type de processus d'IA."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-cui';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-cui';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-cui')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-cui')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-cui');
      const existingScript2 = document.getElementById('faq-schema-cui');
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
          .eq('id', 'comfyui')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
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

      {/* Bannière spéciale pour ComfyUI */}
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
                ComfyUI : interface graphique avancée pour créer des workflows IA complexes
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI INTERFACE').toUpperCase()}
              </span>
              <p className="text-xl text-emerald-100 mb-6">
                Créez des workflows d'intelligence artificielle complexes avec ComfyUI. Interface graphique intuitive avec système de nœuds modulaires, workflows réutilisables, contrôle granulaire. Parfait pour artistes, développeurs et professionnels du marketing.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎛️ Interface graphique
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔗 Workflows modulaires
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Performance optimisée
                </span>
              </div>
            </div>
            
            {/* Logo ComfyUI animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-teal-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-cyan-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo interface graphique centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-emerald-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Interface graphique stylisée */}
                      <rect x="2" y="2" width="20" height="20" rx="2" stroke="#10B981" strokeWidth="2" fill="none"/>
                      
                      {/* Nœuds de workflow */}
                      <circle cx="8" cy="8" r="2" fill="#10B981" opacity="0.8"/>
                      <circle cx="16" cy="8" r="2" fill="#10B981" opacity="0.8"/>
                      <circle cx="8" cy="16" r="2" fill="#10B981" opacity="0.8"/>
                      <circle cx="16" cy="16" r="2" fill="#10B981" opacity="0.8"/>
                      <circle cx="12" cy="12" r="2" fill="#10B981" opacity="0.8"/>
                      
                      {/* Connexions entre nœuds */}
                      <path d="M10 8 L14 12" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 8 L10 12" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10 12 L14 16" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 12 L10 16" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
                      
                      {/* Indicateurs de flux */}
                      <circle cx="10" cy="8" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="14" cy="12" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                      </circle>
                      <circle cx="10" cy="16" r="0.5" fill="#10B981" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo ComfyUI - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <YouTubeEmbed
            videoId="fw_FURLT72M"
            title="Démonstration ComfyUI"
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
                    moduleId={card.id}
                    moduleName={card.title}
                    moduleCost={100}
                    moduleDescription={card.description}
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
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={async () => {
                      if (!session) {
                        window.location.href = '/login';
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

      {/* Section principale avec contenu SEO optimisé */}
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
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-2xl border-l-4 border-emerald-500 mb-8">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>ComfyUI est une interface graphique avancée qui permet de créer des workflows d'intelligence artificielle complexes avec un système de nœuds modulaires.</strong> Contrairement aux interfaces traditionnelles, ComfyUI offre une flexibilité maximale pour orchestrer vos processus d'IA, avec des workflows réutilisables, un contrôle granulaire sur chaque paramètre, et une performance optimisée. Parfait pour artistes, développeurs et professionnels du marketing qui veulent créer des pipelines d'IA personnalisés sans limitation de complexité.
                </p>
              </div>

              {/* H2 - À quoi sert ComfyUI ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  À quoi sert ComfyUI ?
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    ComfyUI permet de créer des workflows d'intelligence artificielle complexes de manière intuitive et visuelle. Il répond aux besoins de ceux qui souhaitent orchestrer leurs processus d'IA avec une flexibilité maximale, sans être limités par les interfaces traditionnelles.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Créer des workflows personnalisés :</strong> Concevez des pipelines d'IA adaptés à vos besoins spécifiques avec un système de nœuds modulaires</li>
                    <li className="text-lg"><strong>Orchestrer des processus complexes :</strong> Connectez différents modules d'IA pour créer des workflows sophistiqués</li>
                    <li className="text-lg"><strong>Contrôle granulaire :</strong> Ajustez chaque paramètre de vos modèles d'IA avec une précision extrême</li>
                    <li className="text-lg"><strong>Réutiliser et partager :</strong> Sauvegardez vos workflows pour les réutiliser et les partager avec d'autres utilisateurs</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Créez des workflows de génération d'images complexes, combinez différents modèles d'IA, testez et optimisez vos modèles, automatisez la génération de contenu visuel, créez des pipelines de post-traitement personnalisés, ou explorez de nouvelles techniques créatives.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire ComfyUI ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  Que peut faire ComfyUI ?
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                    <h3 className="text-2xl font-bold text-emerald-900 mb-4">Système de nœuds modulaires</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Connectez différents types de nœuds (générateurs, processeurs, filtres) pour créer des pipelines d'IA personnalisés selon vos besoins spécifiques. Chaque composant est indépendant et réutilisable.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                    <h3 className="text-2xl font-bold text-teal-900 mb-4">Workflows réutilisables</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Sauvegardez et partagez vos workflows créés, permettant une collaboration efficace et la réutilisation de processus complexes. Optimisez votre productivité en réutilisant vos configurations.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                    <h3 className="text-2xl font-bold text-cyan-900 mb-4">Contrôle granulaire</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Ajustez chaque paramètre de vos modèles d'IA avec une précision extrême, vous donnant un contrôle total sur vos résultats. Personnalisez chaque aspect de vos workflows.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Performance optimisée</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Infrastructure haute performance garantissant des temps de traitement rapides même pour les workflows les plus complexes. Exécution efficace de vos processus d'IA.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser ComfyUI ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  Comment utiliser ComfyUI ?
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à ComfyUI</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à ComfyUI avec 100 crédits. L'accès est immédiat, le service est accessible depuis vos applications via comfyui.iahome.fr.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Créer votre workflow</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Utilisez l'interface graphique pour créer votre workflow en connectant des nœuds visuels selon vos besoins : générateurs, processeurs, filtres. L'approche visuelle par nœuds rend la création accessible à tous.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ajuster les paramètres</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Ajustez chaque paramètre de vos modèles d'IA avec une précision extrême. Le contrôle granulaire vous donne un contrôle total sur vos résultats.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Exécuter et sauvegarder</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Exécutez votre workflow et sauvegardez-le pour le réutiliser ultérieurement ou le partager avec d'autres utilisateurs. Les workflows réutilisables optimisent votre productivité.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait ComfyUI ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  Pour qui est fait ComfyUI ?
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Artistes et créateurs</h3>
                    <p className="text-gray-700">Créez des workflows de génération d'images complexes, combinez différents modèles d'IA, et explorez de nouvelles techniques créatives avec une flexibilité maximale.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 text-center">
                    <div className="text-4xl mb-4">👨‍💻</div>
                    <h3 className="text-xl font-bold text-teal-900 mb-2">Développeurs et chercheurs</h3>
                    <p className="text-gray-700">Testez et optimisez vos modèles d'IA, créez des pipelines de traitement personnalisés, et expérimentez avec de nouvelles architectures.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-cyan-900 mb-2">Professionnels du marketing</h3>
                    <p className="text-gray-700">Automatisez la génération de contenu visuel, créez des workflows de post-traitement, et optimisez vos processus créatifs.</p>
                  </div>
                </div>
              </div>

              {/* H2 - ComfyUI vs autres interfaces IA */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  ComfyUI vs autres interfaces IA
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">ComfyUI</th>
                          <th className="border border-gray-300 p-4 text-center">Autres interfaces IA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Flexibilité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Maximale (nœuds modulaires)</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Limitée par l'interface</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Complexité des workflows</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune limitation</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Limites imposées</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Contrôle granulaire</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Paramètres ajustables individuellement</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Contrôle limité</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Réutilisabilité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Workflows sauvegardables et partageables</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Réutilisation limitée</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Accessibilité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Interface intuitive pour tous niveaux</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Courbe d'apprentissage variable</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> ComfyUI offre une alternative flexible et puissante aux interfaces IA traditionnelles. Contrairement aux autres interfaces qui imposent des limitations sur la complexité des workflows, ComfyUI permet de créer des processus d'IA personnalisés sans restriction, avec un contrôle granulaire et une réutilisabilité optimale. C'est la solution idéale pour ceux qui veulent orchestrer leurs processus d'IA avec une flexibilité maximale.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur ComfyUI (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-6">
                  Questions fréquentes sur ComfyUI (FAQ)
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6"></div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que ComfyUI ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ComfyUI est une interface graphique avancée conçue pour créer et exécuter des workflows d'intelligence artificielle complexes. Contrairement aux interfaces traditionnelles, ComfyUI utilise un système de nœuds visuels qui permet de connecter différents modules d'IA de manière intuitive et flexible. Cette plateforme transforme la façon dont vous interagissez avec les modèles d'IA, en vous donnant un contrôle total sur chaque étape de votre processus de génération.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser ComfyUI ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour utiliser ComfyUI, accédez directement au service avec 100 crédits. L'accès est immédiat, accédez à l'interface graphique via comfyui.iahome.fr. Créez vos workflows en connectant des nœuds visuels selon vos besoins : générateurs, processeurs, filtres. Ajustez chaque paramètre avec précision, sauvegardez vos workflows pour les réutiliser, et exécutez vos processus d'IA complexes avec une flexibilité maximale.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels sont les avantages de ComfyUI par rapport aux autres interfaces IA ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ComfyUI offre plusieurs avantages : flexibilité maximale pour créer des workflows personnalisés sans limitation de complexité, interface intuitive accessible même sans connaissances techniques approfondies, performance optimisée pour des temps de traitement rapides, architecture modulaire pour une maintenance facile, extensibilité pour ajouter de nouveaux nœuds et fonctionnalités, et contrôle granulaire sur chaque paramètre de vos modèles d'IA.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">ComfyUI est-il gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'accès de ComfyUI coûte 100 crédits par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous avez accès à l'interface graphique complète avec toutes les fonctionnalités : système de nœuds modulaires, workflows réutilisables, contrôle granulaire, et performance optimisée.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait ComfyUI ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ComfyUI est fait pour plusieurs types d'utilisateurs : artistes et créateurs qui veulent créer des workflows de génération d'images complexes et combiner différents modèles d'IA, développeurs et chercheurs qui testent et optimisent leurs modèles d'IA et créent des pipelines personnalisés, et professionnels du marketing qui automatisent la génération de contenu visuel et optimisent leurs processus créatifs.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je sauvegarder et partager mes workflows ComfyUI ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, ComfyUI permet de sauvegarder et partager vos workflows créés. Cette fonctionnalité permet une collaboration efficace et la réutilisation de processus complexes. Vous pouvez sauvegarder vos configurations de nœuds, vos paramètres personnalisés, et vos pipelines d'IA pour les utiliser ultérieurement ou les partager avec d'autres utilisateurs.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels types de workflows puis-je créer avec ComfyUI ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Avec ComfyUI, vous pouvez créer une grande variété de workflows d'IA : génération d'images complexes avec combinaison de modèles, pipelines de post-traitement personnalisés, workflows de test et optimisation de modèles, processus de traitement d'images automatisés, pipelines créatifs pour artistes, et workflows de recherche pour développeurs. La flexibilité du système de nœuds permet de créer pratiquement n'importe quel type de processus d'IA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent mb-4">
                  À propos de ComfyUI
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    ComfyUI est une interface graphique révolutionnaire qui vous permet de créer des workflows d'intelligence artificielle complexes 
                    de manière intuitive et visuelle. Cette plateforme vous offre une flexibilité maximale pour orchestrer vos processus d'IA.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que ComfyUI */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900">Qu'est-ce que ComfyUI ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        ComfyUI est une interface graphique avancée conçue pour créer et exécuter des workflows d'intelligence artificielle complexes. 
                        Contrairement aux interfaces traditionnelles, ComfyUI utilise un système de nœuds visuels qui vous permet de connecter 
                        différents modules d'IA de manière intuitive et flexible.
                      </p>
                      <p className="text-base leading-relaxed">
                        Cette plateforme révolutionnaire transforme la façon dont vous interagissez avec les modèles d'IA, en vous donnant 
                        un contrôle total sur chaque étape de votre processus de génération. Que vous soyez un artiste, un développeur ou un chercheur, 
                        ComfyUI vous offre les outils nécessaires pour créer des workflows d'IA sophistiqués.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir ComfyUI */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-teal-900">Pourquoi choisir ComfyUI ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Flexibilité maximale :</strong> Créez des workflows d'IA personnalisés en connectant des nœuds selon vos besoins spécifiques. 
                        Aucune limitation sur la complexité de vos processus de génération.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Interface intuitive :</strong> L'approche visuelle par nœuds rend la création de workflows accessible à tous, 
                        même sans connaissances techniques approfondies en programmation.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Performance optimisée :</strong> Notre infrastructure haute performance garantit des temps de traitement rapides 
                        même pour les workflows les plus complexes.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Fonctionnalités avancées */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-cyan-900">Fonctionnalités avancées</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Système de nœuds modulaires :</strong> Connectez différents types de nœuds (générateurs, processeurs, 
                        filtres) pour créer des pipelines d'IA personnalisés selon vos besoins spécifiques.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Workflows réutilisables :</strong> Sauvegardez et partagez vos workflows créés, permettant une collaboration 
                        efficace et la réutilisation de processus complexes.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Contrôle granulaire :</strong> Ajustez chaque paramètre de vos modèles d'IA avec une précision extrême, 
                        vous donnant un contrôle total sur vos résultats.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 4: Cas d'usage */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Cas d'usage et applications</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Artistes et créateurs :</strong> Créez des workflows de génération d'images complexes, combinez différents 
                        modèles d'IA, et explorez de nouvelles techniques créatives avec une flexibilité maximale.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Développeurs et chercheurs :</strong> Testez et optimisez vos modèles d'IA, créez des pipelines de traitement 
                        personnalisés, et expérimentez avec de nouvelles architectures.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Professionnels du marketing :</strong> Automatisez la génération de contenu visuel, créez des workflows 
                        de post-traitement, et optimisez vos processus créatifs.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Avantages techniques */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Avantages techniques</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Architecture modulaire :</strong> Chaque composant est indépendant et réutilisable, permettant une maintenance 
                        facile et des mises à jour sans interruption de service.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Extensibilité :</strong> Ajoutez facilement de nouveaux nœuds et fonctionnalités pour adapter la plateforme 
                        à vos besoins spécifiques.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Performance optimisée :</strong> Notre infrastructure garantit des temps de réponse rapides et une stabilité 
                        maximale pour vos workflows les plus exigeants.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎛️</span>
                      </div>
                      <h4 className="font-bold text-emerald-900 mb-3 text-lg">Interface graphique</h4>
                      <p className="text-gray-700 text-sm">Créez des workflows visuels intuitifs avec notre système de nœuds avancé.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔗</span>
                      </div>
                      <h4 className="font-bold text-teal-900 mb-3 text-lg">Workflows modulaires</h4>
                      <p className="text-gray-700 text-sm">Connectez des modules d'IA de manière flexible pour des processus personnalisés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-cyan-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Exécution rapide et optimisée de vos workflows d'IA les plus complexes.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Accessibilité</h4>
                      <p className="text-gray-700 text-sm">Interface intuitive accessible à tous les niveaux d'expertise technique.</p>
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
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez'}
                        </p>
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
                      href="https://github.com/comfyanonymous/ComfyUI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <span className="mr-2">🔗</span>
                      GitHub
                    </a>
                    <a
                      href="https://github.com/comfyanonymous/ComfyUI#readme"
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
        moduleId={card?.id || 'comfyui'}
        moduleName="ComfyUI"
        tokenCost={100}
        tokenUnit="par accès. Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        icon="🎭"
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'ComfyUI',
          userId: userId,
          userEmail: email,
          moduleCost: 100,
          moduleDescription: card?.description
        })}
      />
    </div>
  );
}






