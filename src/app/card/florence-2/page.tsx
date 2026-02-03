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

export default function Florence2Page() {
  const router = useRouter();
  
  // Configuration du module Florence-2
  const florence2Module = {
    id: 'florence-2',
    title: 'Florence-2',
    subtitle: 'Modèle vision-language unifié pour multiples tâches de vision par ordinateur',
    description: 'Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d\'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur le dataset FLD-5B (5,4 milliards d\'annotations sur 126 millions d\'images), Florence-2 peut effectuer du captioning, de la détection d\'objets, de la segmentation, de l\'OCR et bien plus encore, le tout avec un modèle compact de 0,23B ou 0,77B paramètres.',
    category: 'AI VISION',
    price: '100 tokens',
    image_url: '/images/florence-2.jpg',
    github_url: 'https://github.com/anyantudre/Florence-2-Vision-Language-Model',
    features: [
      'Modèle unifié pour multiples tâches vision',
      'Captioning, détection d\'objets, segmentation, OCR',
      'Modèle compact (0,23B ou 0,77B paramètres)',
      'Entraîné sur FLD-5B (5,4B annotations)',
      'Performance zero-shot exceptionnelle',
      'Open source sous licence MIT',
      'Déploiement efficace sur appareils limités'
    ]
  };

  const [card, setCard] = useState<Card | null>(florence2Module as Card);
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
          moduleId: 'florence-2'
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      
      // Utiliser le sous-domaine comme les autres modules IA
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const florence2Url = isDevelopment 
        ? 'http://127.0.0.1:7884' 
        : 'https://florence2.iahome.fr';
      
      const accessUrl = `${florence2Url}?token=${encodeURIComponent(tokenData.token)}`;
      console.log('🔗 florence-2: Accès direct au sous-domaine avec token:', accessUrl);
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
      "name": "Florence-2 - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur FLD-5B, il peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore.",
      "url": "https://iahome.fr/card/florence-2",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "320"
      },
      "featureList": [
        "Modèle unifié pour multiples tâches vision",
        "Captioning, détection d'objets, segmentation, OCR",
        "Modèle compact (0,23B ou 0,77B paramètres)",
        "Entraîné sur FLD-5B (5,4B annotations)",
        "Performance zero-shot exceptionnelle",
        "Open source sous licence MIT",
        "Déploiement efficace"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que Florence-2 ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur le dataset FLD-5B (5,4 milliards d'annotations sur 126 millions d'images), Florence-2 peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser Florence-2 ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser Florence-2, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via florence2.iahome.fr. Florence-2 utilise des prompts textuels spécifiques pour chaque tâche (comme <CAPTION>, <OD> pour object detection, <OCR>, etc.) et génère les résultats correspondants."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles tâches Florence-2 peut-il effectuer ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Florence-2 peut effectuer de nombreuses tâches : captioning (légendes d'images), détection d'objets, segmentation, OCR (reconnaissance de texte), grounding de phrases, génération de légendes détaillées, et bien plus encore. Toutes ces tâches sont accessibles via des prompts textuels spécifiques."
          }
        },
        {
          "@type": "Question",
          "name": "Florence-2 est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'activation de Florence-2 coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Une fois activé, vous avez accès à toutes les fonctionnalités : captioning, détection d'objets, segmentation, OCR, et toutes les autres tâches supportées par le modèle."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la taille du modèle Florence-2 ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Florence-2 existe en deux versions : Florence-2-base avec 0,23 milliard de paramètres et Florence-2-large avec 0,77 milliard de paramètres. Malgré sa taille compacte, le modèle atteint des performances de pointe grâce à son entraînement sur le dataset FLD-5B."
          }
        },
        {
          "@type": "Question",
          "name": "Florence-2 nécessite-t-il un fine-tuning ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, Florence-2 fonctionne en mode zero-shot pour toutes les tâches supportées, ce qui signifie qu'il peut être utilisé directement sans fine-tuning. Cependant, vous pouvez fine-tuner le modèle pour des tâches spécifiques ou des domaines particuliers si nécessaire."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait Florence-2 ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Florence-2 est fait pour les développeurs et chercheurs en vision par ordinateur, les créateurs de contenu qui ont besoin d'annotations automatiques d'images, les entreprises qui veulent automatiser des tâches de vision, et toute personne intéressée par les modèles vision-language unifiés."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-f2';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-f2';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-f2')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-f2')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-f2');
      const existingScript2 = document.getElementById('faq-schema-f2');
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
          .eq('id', 'florence-2')
          .single();

        if (!error && data) {
          // Si trouvé dans Supabase, utiliser ces données
          setCard(data);
        }
        // Sinon, garder les données par défaut déjà initialisées
      } catch (error) {
        // En cas d'erreur, garder les données par défaut
        console.log('Module Florence-2 non trouvé dans Supabase, utilisation des données par défaut');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
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

      {/* Bannière spéciale pour Florence-2 */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 py-8 relative overflow-hidden">
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
                Florence-2 : modèle vision-language unifié par Microsoft
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'AI VISION').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Exécutez plus de 10 tâches de vision par ordinateur avec un seul modèle. Captioning, détection d'objets, segmentation, OCR et bien plus encore. Modèle compact et performant, open source sous licence MIT. Parfait pour développeurs, chercheurs et créateurs de contenu.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  👁️ Vision unifiée
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 10+ tâches
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Modèle compact
                </span>
              </div>
            </div>
            
            {/* Visuel Florence-2 avec logo */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites animées */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-cyan-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-teal-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo Florence-2 centré avec effet 3D */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-blue-500/30 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col items-center">
                      {/* Icône vision/œil avec effet glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <svg className="w-24 h-24 relative z-10" viewBox="0 0 24 24" fill="none">
                          {/* Œil stylisé pour vision */}
                          <ellipse 
                            cx="12" cy="12" rx="8" ry="5" 
                            stroke="#3B82F6" 
                            strokeWidth="2.5" 
                            fill="url(#gradientVision)"
                            className="drop-shadow-lg"
                          />
                          <defs>
                            <linearGradient id="gradientVision" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          {/* Pupille */}
                          <circle cx="12" cy="12" r="3" fill="#3B82F6" />
                          {/* Reflet */}
                          <circle cx="13" cy="11" r="1" fill="#FFFFFF" />
                          {/* Lignes de vision */}
                          <path 
                            d="M4 12 L8 12 M16 12 L20 12" 
                            stroke="#3B82F6" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                            className="drop-shadow-md"
                          />
                          {/* Étoile décorative */}
                          <path 
                            d="M12 2 L12.5 4 L14.5 4 L12.8 5.2 L13.3 7.2 L12 6 L10.7 7.2 L11.2 5.2 L9.5 4 L11.5 4 Z" 
                            fill="#06B6D4" 
                            className="animate-pulse"
                          >
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                          </path>
                        </svg>
                      </div>
                      {/* Texte Florence-2 */}
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          Florence-2
                        </div>
                        <div className="text-xs text-blue-600/80 mt-1 font-medium">
                          Vision-Language Model
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Démonstration Florence-2</h3>
            <YouTubeEmbed
              videoId="qep8smEBE3k"
              title="Microsoft's Florence 2: Breaking Boundaries in AI Vision Language!"
              origin="https://iahome.fr"
            />
          </div>
          
          {/* Colonne 2 - Système de boutons */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
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
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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

        {/* Section Exemples visuels Florence-2 */}
        <div className="mt-12 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Exemples de tâches Florence-2</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exemple 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-sm text-blue-700 font-medium">Captioning</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Génération de légendes</h4>
              <p className="text-sm text-gray-600">Générez des légendes d'images à différents niveaux de détail (simple, détaillé, très détaillé)</p>
            </div>

            {/* Exemple 2 */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm text-cyan-700 font-medium">Détection d'objets</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Object Detection</h4>
              <p className="text-sm text-gray-600">Détectez et localisez des objets dans les images avec des bounding boxes et labels</p>
            </div>

            {/* Exemple 3 */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">✂️</div>
                  <div className="text-sm text-teal-700 font-medium">Segmentation</div>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Segmentation</h4>
              <p className="text-sm text-gray-600">Segmentez des objets ou régions dans les images avec des polygones précis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-cyan-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-teal-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-cyan-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-4">
                  À propos de Florence-2
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl border-l-4 border-blue-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle.</strong> Entraîné sur le dataset FLD-5B contenant 5,4 milliards d'annotations sur 126 millions d'images, Florence-2 peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore. Malgré sa taille compacte (0,23B ou 0,77B paramètres), le modèle atteint des performances de pointe grâce à son entraînement massif. C'est l'outil idéal pour les développeurs, chercheurs et créateurs de contenu qui ont besoin d'un modèle unifié pour multiples tâches de vision.
                  </p>
                </div>

                {/* H2 - À quoi sert Florence-2 ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    À quoi sert Florence-2 ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Florence-2 permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle unifié. Il répond aux besoins de ceux qui souhaitent annoter automatiquement des images, détecter des objets, segmenter des régions, extraire du texte, ou générer des légendes détaillées sans avoir besoin de plusieurs modèles spécialisés.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Captioning d'images :</strong> Générez des légendes d'images à différents niveaux de détail (simple, détaillé, très détaillé)</li>
                      <li className="text-lg"><strong>Détection d'objets :</strong> Détectez et localisez des objets dans les images avec des bounding boxes et labels</li>
                      <li className="text-lg"><strong>Segmentation :</strong> Segmentez des objets ou régions dans les images avec des polygones précis</li>
                      <li className="text-lg"><strong>OCR :</strong> Extrayez du texte des images avec ou sans localisation</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Annotez automatiquement des datasets d'images, créez des légendes pour vos contenus visuels, détectez des objets dans des images pour l'analyse, extrayez du texte de documents scannés, segmentez des objets pour l'édition d'images, ou explorez les capacités vision-language avec un modèle unifié.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire Florence-2 ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    Que peut faire Florence-2 ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">Captioning d'images</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Générez des légendes d'images à différents niveaux de détail. Utilisez &lt;CAPTION&gt; pour des légendes simples, &lt;DETAILED_CAPTION&gt; pour des descriptions détaillées, ou &lt;MORE_DETAILED_CAPTION&gt; pour des descriptions très détaillées.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
                      <h3 className="text-2xl font-bold text-cyan-900 mb-4">Détection d'objets</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Détectez et localisez des objets dans les images avec des bounding boxes et labels. Utilisez &lt;OD&gt; pour la détection d'objets standard ou &lt;DENSE_REGION_CAPTION&gt; pour des captions de régions denses.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                      <h3 className="text-2xl font-bold text-teal-900 mb-4">Segmentation</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Segmentez des objets ou régions dans les images avec des polygones précis. Utilisez &lt;REFERRING_EXPRESSION_SEGMENTATION&gt; pour la segmentation basée sur le texte ou &lt;REGION_TO_SEGMENTATION&gt; pour la segmentation basée sur les bounding boxes.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-2xl border border-sky-200">
                      <h3 className="text-2xl font-bold text-sky-900 mb-4">OCR et extraction de texte</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Extrayez du texte des images avec &lt;OCR&gt; ou avec localisation avec &lt;OCR_WITH_REGION&gt;. Florence-2 peut identifier et localiser le texte dans les images avec une grande précision.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser Florence-2 ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser Florence-2 ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Activer Florence-2</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Activez Florence-2 avec 100 tokens. Une fois activé, le service est accessible depuis vos applications actives via florence2.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border border-cyan-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Choisir la tâche</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Sélectionnez la tâche que vous souhaitez effectuer en utilisant les prompts spécifiques : &lt;CAPTION&gt; pour les légendes, &lt;OD&gt; pour la détection d'objets, &lt;OCR&gt; pour l'extraction de texte, &lt;REFERRING_EXPRESSION_SEGMENTATION&gt; pour la segmentation, etc.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border border-teal-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Uploader l'image</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Téléchargez l'image que vous souhaitez analyser. Florence-2 traite l'image et génère les résultats selon la tâche sélectionnée. Pour certaines tâches, vous pouvez également fournir du texte supplémentaire (comme des noms d'objets pour la détection).
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Obtenir les résultats</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Florence-2 génère automatiquement les résultats selon la tâche : légendes textuelles, bounding boxes avec labels, polygones de segmentation, ou texte extrait avec localisation. Vous pouvez ensuite télécharger ou réutiliser ces résultats.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait Florence-2 ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait Florence-2 ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                      <div className="text-4xl mb-4">👨‍💻</div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Développeurs et chercheurs</h3>
                      <p className="text-gray-700">Annotez automatiquement des datasets d'images, intégrez des capacités vision-language dans vos applications, et explorez les modèles vision-language unifiés.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-cyan-900 mb-2">Créateurs de contenu</h3>
                      <p className="text-gray-700">Générez des légendes automatiques pour vos images, détectez des objets dans vos visuels, extrayez du texte de documents, et automatisez l'annotation d'images.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 text-center">
                      <div className="text-4xl mb-4">🏢</div>
                      <h3 className="text-xl font-bold text-teal-900 mb-2">Entreprises</h3>
                      <p className="text-gray-700">Automatisez des tâches de vision par ordinateur, analysez des images à grande échelle, extrayez des informations de documents, et intégrez l'IA vision dans vos workflows.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - Florence-2 vs autres modèles vision */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    Florence-2 vs autres modèles vision
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">Florence-2</th>
                            <th className="border border-gray-300 p-4 text-center">Autres modèles</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Tâches multiples</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 10+ tâches dans un seul modèle</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Modèles spécialisés séparés</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Taille du modèle</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Compact (0,23B ou 0,77B)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent plus volumineux</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Dataset d'entraînement</td>
                            <td className="border border-gray-300 p-4 text-center">✅ FLD-5B (5,4B annotations)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Datasets plus limités</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Zero-shot</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Performance zero-shot exceptionnelle</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Nécessite souvent fine-tuning</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Coûts variables</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> Florence-2 offre une alternative exceptionnelle aux autres modèles vision. Contrairement aux modèles spécialisés qui nécessitent plusieurs modèles pour différentes tâches, Florence-2 unifie toutes ces capacités dans un seul modèle compact. C'est la solution idéale pour ceux qui veulent un modèle vision-language polyvalent et efficace.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur Florence-2 (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur Florence-2 (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que Florence-2 ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d'exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur le dataset FLD-5B (5,4 milliards d'annotations sur 126 millions d'images), Florence-2 peut effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser Florence-2 ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser Florence-2, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via florence2.iahome.fr. Florence-2 utilise des prompts textuels spécifiques pour chaque tâche (comme &lt;CAPTION&gt; pour les légendes, &lt;OD&gt; pour la détection d'objets, &lt;OCR&gt; pour l'extraction de texte, etc.) et génère les résultats correspondants.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles tâches Florence-2 peut-il effectuer ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Florence-2 peut effectuer de nombreuses tâches : captioning (légendes d'images), détection d'objets, segmentation, OCR (reconnaissance de texte), grounding de phrases, génération de légendes détaillées, et bien plus encore. Toutes ces tâches sont accessibles via des prompts textuels spécifiques.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Florence-2 est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'activation de Florence-2 coûte 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Une fois activé, vous avez accès à toutes les fonctionnalités : captioning, détection d'objets, segmentation, OCR, et toutes les autres tâches supportées par le modèle.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-sky-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la taille du modèle Florence-2 ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Florence-2 existe en deux versions : Florence-2-base avec 0,23 milliard de paramètres et Florence-2-large avec 0,77 milliard de paramètres. Malgré sa taille compacte, le modèle atteint des performances de pointe grâce à son entraînement sur le dataset FLD-5B.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Florence-2 nécessite-t-il un fine-tuning ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Non, Florence-2 fonctionne en mode zero-shot pour toutes les tâches supportées, ce qui signifie qu'il peut être utilisé directement sans fine-tuning. Cependant, vous pouvez fine-tuner le modèle pour des tâches spécifiques ou des domaines particuliers si nécessaire.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border-l-4 border-teal-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait Florence-2 ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Florence-2 est fait pour les développeurs et chercheurs en vision par ordinateur, les créateurs de contenu qui ont besoin d'annotations automatiques d'images, les entreprises qui veulent automatiser des tâches de vision, et toute personne intéressée par les modèles vision-language unifiés.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Florence-2 est un modèle révolutionnaire qui unifie multiples tâches de vision par ordinateur dans un seul modèle compact. 
                    Cette technologie de pointe vous permet d'effectuer du captioning, de la détection d'objets, de la segmentation, de l'OCR et bien plus encore avec un seul modèle performant.
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">👁️</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Vision unifiée</h4>
                      <p className="text-gray-700 text-sm">10+ tâches dans un seul modèle compact et performant.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h4 className="font-bold text-cyan-900 mb-3 text-lg">Captioning</h4>
                      <p className="text-gray-700 text-sm">Génération de légendes à différents niveaux de détail.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h4 className="font-bold text-teal-900 mb-3 text-lg">Détection</h4>
                      <p className="text-gray-700 text-sm">Détection d'objets, segmentation et OCR intégrés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-6 sm:p-8 rounded-2xl border border-sky-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-sky-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Modèle compact (0,23B-0,77B) avec performance zero-shot.</p>
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
                        <p className="text-gray-600 text-sm">
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : '100 tokens par accès, et utilisez l\'application aussi longtemps que vous souhaitez'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📱</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Compatibilité</h5>
                        <p className="text-gray-600 text-sm">Tous les navigateurs modernes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
        moduleId={card?.id || 'florence-2'}
        moduleName="Florence-2"
        tokenCost={100}
        tokenUnit="par accès, et utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-module"
        gradientColors="from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        icon="👁️"
        isModuleActivated={alreadyActivatedModules.includes(card?.id || '')}
        moduleTitle={card?.title}
        moduleDescription={card?.description}
        customRequestBody={(userId, email, moduleId) => ({
          moduleId: moduleId,
          moduleName: card?.title || 'Florence-2',
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
