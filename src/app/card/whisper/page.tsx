'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import WhisperLimits from '../../../components/WhisperLimits';
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

export default function WhisperPage() {
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

  // Whisper IA est un module payant
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Whisper IA - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Support multilingue, interface moderne, transcription audio/vidéo précise, reconnaissance de texte (OCR) sur images et PDF.",
      "url": "https://iahome.fr/card/whisper",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "580"
      },
      "featureList": [
        "Transcription audio de haute qualité",
        "Transcription vidéo avec horodatage",
        "Reconnaissance de texte (OCR) sur images",
        "Support multilingue (50+ langues)",
        "Interface moderne et intuitive",
        "Précision exceptionnelle",
        "Traitement rapide",
        "Confidentialité garantie"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que Whisper IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Développée avec les dernières avancées en intelligence artificielle, cette plateforme vous donne accès à des capacités de traitement multimédia de niveau professionnel."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser Whisper IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser Whisper IA, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via whisper.iahome.fr. Uploadez vos fichiers audio, vidéo ou images, sélectionnez la langue si nécessaire, et l'IA génère automatiquement la transcription ou la reconnaissance de texte. Vous pouvez ensuite télécharger le résultat en format texte ou l'utiliser directement dans votre workflow."
          }
        },
        {
          "@type": "Question",
          "name": "Quels types de fichiers Whisper IA peut-il traiter ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Whisper IA peut traiter trois types de fichiers : fichiers audio (MP3, WAV, M4A, etc.) pour transcription audio, fichiers vidéo (MP4, AVI, MOV, etc.) pour transcription vidéo avec horodatage, et images/PDF (JPG, PNG, PDF, etc.) pour reconnaissance de texte (OCR). Tous les formats courants sont supportés pour une polyvalence maximale."
          }
        },
        {
          "@type": "Question",
          "name": "Whisper IA est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'activation de Whisper IA coûte 100 tokens par utilisation. Une fois activé, vous avez accès à toutes les fonctionnalités : transcription audio/vidéo, reconnaissance de texte (OCR), support multilingue, et interface moderne. Il n'y a pas de frais supplémentaires pour le traitement des fichiers."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles langues sont supportées par Whisper IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Whisper IA supporte plus de 50 langues et dialectes pour la transcription audio et vidéo, incluant le français, l'anglais, l'espagnol, l'allemand, l'italien, et bien d'autres. Pour la reconnaissance de texte (OCR), l'outil est optimisé pour le français et l'anglais, avec un support étendu pour d'autres langues européennes."
          }
        },
        {
          "@type": "Question",
          "name": "Quelle est la précision de Whisper IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Whisper IA offre une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR. Les modèles OpenAI Whisper sont entraînés sur des millions d'heures d'audio multilingue pour une transcription au mot près, même dans des conditions difficiles. Pour l'OCR, Tesseract est optimisé pour extraire le texte des images et documents numérisés avec une grande précision."
          }
        },
        {
          "@type": "Question",
          "name": "Pour qui est fait Whisper IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Whisper IA est fait pour plusieurs types d'utilisateurs : professionnels qui transcrivent réunions, interviews et conférences, étudiants qui transforment cours enregistrés en notes textuelles, créateurs de contenu qui génèrent automatiquement des sous-titres pour leurs vidéos, et toute personne qui a besoin de transformer du contenu multimédia en texte éditable."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-wh';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-wh';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-wh')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-wh')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-wh');
      const existingScript2 = document.getElementById('faq-schema-wh');
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
      
      // Appeler l'API pour activer le module Whisper
      const response = await fetch('/api/activate-whisper', {
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
      router.push('/encours');
      
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Whisper IA : transcription audio, vidéo et OCR avec précision
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(card?.category || 'PRODUCTIVITÉ').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Transformez vos fichiers audio, vidéo et images en texte avec Whisper IA. Transcription audio/vidéo précise avec OpenAI Whisper, reconnaissance de texte (OCR) avec Tesseract. Support multilingue, interface moderne. Parfait pour professionnels, étudiants et créateurs de contenu.
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

      {/* Affichage des limites de taille */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <WhisperLimits />
      </div>

      {/* Vidéo Whisper IA - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Vidéo */}
          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/VtEkYRnl5uI?autoplay=0&rel=0&modestbranding=1"
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
                      moduleId={card?.id || 'whisper'}
                      moduleName={card?.title || 'Whisper'}
                      moduleCost={100}
                      moduleDescription={card?.description || 'Application Whisper activée'}
                      onActivationSuccess={() => {
                        setAlreadyActivatedModules(prev => [...prev, card?.id || 'whisper']);
                        alert(`✅ Application ${card?.title || 'Whisper'} activée avec succès ! Vous pouvez maintenant l'utiliser depuis vos applications.`);
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
                {/* Paragraphe citable par les IA (GEO) */}
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl border-l-4 border-blue-500 mb-8">
                  <p className="text-lg leading-relaxed text-gray-800">
                    <strong>Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle.</strong> Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Avec support multilingue (50+ langues), interface moderne, et traitement rapide, c'est l'outil idéal pour professionnels, étudiants et créateurs de contenu qui veulent transformer du contenu multimédia en texte éditable.
                  </p>
                </div>

                {/* H2 - À quoi sert Whisper IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    À quoi sert Whisper IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg leading-relaxed">
                      Whisper IA permet de transformer vos fichiers audio, vidéo et images en texte éditable avec une précision exceptionnelle. Il répond aux besoins de ceux qui souhaitent créer des transcriptions, extraire du texte depuis des documents scannés, ou générer des sous-titres automatiques.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li className="text-lg"><strong>Transcrire du contenu audio/vidéo :</strong> Convertissez vos enregistrements vocaux et vidéos en texte avec précision au mot près</li>
                      <li className="text-lg"><strong>Extraire du texte depuis des images :</strong> Utilisez l'OCR pour transformer vos images et PDFs en texte éditable</li>
                      <li className="text-lg"><strong>Générer des sous-titres :</strong> Créez automatiquement des sous-titres pour vos vidéos avec horodatage précis</li>
                      <li className="text-lg"><strong>Améliorer la productivité :</strong> Économisez du temps en automatisant la transcription manuelle</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-4">
                      <strong>Cas concrets d'utilisation :</strong> Transcrivez vos réunions, interviews et conférences, transformez vos cours enregistrés en notes textuelles, générez automatiquement des sous-titres pour vos vidéos, extrayez le texte de vos documents scannés, créez des transcriptions de podcasts pour améliorer le SEO, ou analysez du contenu vidéo avec horodatage précis.
                    </p>
                  </div>
                </div>

                {/* H2 - Que peut faire Whisper IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    Que peut faire Whisper IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">Transcription audio</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Convertissez vos enregistrements vocaux en texte avec une précision au mot près. Support de plus de 50 langues et dialectes, même dans des conditions difficiles. Parfait pour transcrire réunions, interviews, podcasts, et cours enregistrés.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                      <h3 className="text-2xl font-bold text-green-900 mb-4">Transcription vidéo</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Extrayez le texte des vidéos avec horodatage précis des mots. Idéal pour créer des sous-titres, analyser du contenu vidéo, ou générer des transcriptions de vidéos de formation ou de marketing avec synchronisation temporelle.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">Reconnaissance de texte (OCR)</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Transformez vos images et PDFs en texte éditable avec Tesseract OCR, optimisé pour le français et l'anglais. Extrayez le texte de documents scannés, images, captures d'écran, et bien plus pour faciliter l'édition et la recherche.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                      <h3 className="text-2xl font-bold text-orange-900 mb-4">Support multilingue</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Support de plus de 50 langues et dialectes pour la transcription audio/vidéo. Interface moderne et intuitive accessible depuis n'importe quel navigateur, avec traitement rapide et confidentialité garantie.
                      </p>
                    </div>
                  </div>
                </div>

                {/* H2 - Comment utiliser Whisper IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    Comment utiliser Whisper IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Activer Whisper IA</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Activez Whisper IA avec 100 tokens. Une fois activé, le service est accessible depuis vos applications actives via whisper.iahome.fr.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Uploadez vos fichiers</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Uploadez vos fichiers audio (MP3, WAV, M4A), vidéo (MP4, AVI, MOV), ou images/PDF (JPG, PNG, PDF) dans l'interface. Tous les formats courants sont supportés pour une polyvalence maximale.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez la langue</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Pour la transcription audio/vidéo, sélectionnez la langue si nécessaire. Whisper IA supporte plus de 50 langues et peut détecter automatiquement la langue dans la plupart des cas.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-200">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Téléchargez le résultat</h3>
                          <p className="text-gray-700 leading-relaxed">
                            L'IA génère automatiquement la transcription ou la reconnaissance de texte. Vous pouvez télécharger le résultat en format texte, l'utiliser directement dans votre workflow, ou le copier pour un usage immédiat.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* H2 - Pour qui est fait Whisper IA ? */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    Pour qui est fait Whisper IA ?
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                      <div className="text-4xl mb-4">💼</div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Professionnels</h3>
                      <p className="text-gray-700">Transcrivez vos réunions, interviews et conférences. Créez des sous-titres pour vos vidéos de formation ou de marketing. Extrayez le texte de vos documents scannés.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Étudiants</h3>
                      <p className="text-gray-700">Transformez vos cours enregistrés en notes textuelles. Extrayez le texte de vos documents scannés pour faciliter l'étude. Créez des transcriptions de conférences.</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                      <div className="text-4xl mb-4">🎬</div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Créateurs de contenu</h3>
                      <p className="text-gray-700">Générez automatiquement des sous-titres pour vos vidéos. Créez des transcriptions de podcasts pour améliorer le SEO. Extrayez le texte de vos images pour vos projets.</p>
                    </div>
                  </div>
                </div>

                {/* H2 - Whisper IA vs autres solutions de transcription */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    Whisper IA vs autres solutions de transcription
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                            <th className="border border-gray-300 p-4 text-center">Whisper IA</th>
                            <th className="border border-gray-300 p-4 text-center">Autres solutions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Précision</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Exceptionnelle (OpenAI Whisper)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Variable selon la solution</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Polyvalence</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Audio, vidéo, images (OCR)</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Souvent limité à un type</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Multilingue</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 50+ langues supportées</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Support limité</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 p-4 font-semibold">Interface</td>
                            <td className="border border-gray-300 p-4 text-center">✅ Moderne et intuitive</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Interface variable</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-gray-300 p-4 font-semibold">Prix</td>
                            <td className="border border-gray-300 p-4 text-center">✅ 100 tokens par utilisation</td>
                            <td className="border border-gray-300 p-4 text-center">⚠️ Abonnements mensuels souvent chers</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">
                      <strong>En résumé :</strong> Whisper IA offre une alternative précise et polyvalente aux autres solutions de transcription. Contrairement aux solutions qui se limitent souvent à un type de fichier ou qui ont un support multilingue limité, Whisper IA combine transcription audio/vidéo et OCR dans une seule interface moderne, avec une précision exceptionnelle et un support de 50+ langues. C'est la solution idéale pour ceux qui veulent transformer du contenu multimédia en texte avec précision et flexibilité.
                    </p>
                  </div>
                </div>

                {/* H2 - Questions fréquentes sur Whisper IA (FAQ) */}
                <div className="mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                    Questions fréquentes sur Whisper IA (FAQ)
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que Whisper IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Whisper IA est une plateforme d'intelligence artificielle multimédia qui transforme vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle. Basée sur les technologies OpenAI Whisper et Tesseract OCR, elle offre une solution complète pour tous vos besoins de transcription et reconnaissance de texte. Développée avec les dernières avancées en intelligence artificielle, cette plateforme vous donne accès à des capacités de traitement multimédia de niveau professionnel.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser Whisper IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pour utiliser Whisper IA, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface via whisper.iahome.fr. Uploadez vos fichiers audio, vidéo ou images, sélectionnez la langue si nécessaire, et l'IA génère automatiquement la transcription ou la reconnaissance de texte. Vous pouvez ensuite télécharger le résultat en format texte ou l'utiliser directement dans votre workflow.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quels types de fichiers Whisper IA peut-il traiter ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Whisper IA peut traiter trois types de fichiers : fichiers audio (MP3, WAV, M4A, etc.) pour transcription audio, fichiers vidéo (MP4, AVI, MOV, etc.) pour transcription vidéo avec horodatage, et images/PDF (JPG, PNG, PDF, etc.) pour reconnaissance de texte (OCR). Tous les formats courants sont supportés pour une polyvalence maximale.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Whisper IA est-il gratuit ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'activation de Whisper IA coûte 100 tokens par utilisation. Une fois activé, vous avez accès à toutes les fonctionnalités : transcription audio/vidéo, reconnaissance de texte (OCR), support multilingue, et interface moderne. Il n'y a pas de frais supplémentaires pour le traitement des fichiers.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-2xl border-l-4 border-rose-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles langues sont supportées par Whisper IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Whisper IA supporte plus de 50 langues et dialectes pour la transcription audio et vidéo, incluant le français, l'anglais, l'espagnol, l'allemand, l'italien, et bien d'autres. Pour la reconnaissance de texte (OCR), l'outil est optimisé pour le français et l'anglais, avec un support étendu pour d'autres langues européennes.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border-l-4 border-red-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la précision de Whisper IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Whisper IA offre une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR. Les modèles OpenAI Whisper sont entraînés sur des millions d'heures d'audio multilingue pour une transcription au mot près, même dans des conditions difficiles. Pour l'OCR, Tesseract est optimisé pour extraire le texte des images et documents numérisés avec une grande précision.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border-l-4 border-orange-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Pour qui est fait Whisper IA ?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Whisper IA est fait pour plusieurs types d'utilisateurs : professionnels qui transcrivent réunions, interviews et conférences, étudiants qui transforment cours enregistrés en notes textuelles, créateurs de contenu qui génèrent automatiquement des sous-titres pour leurs vidéos, et toute personne qui a besoin de transformer du contenu multimédia en texte éditable.
                      </p>
                    </div>
                  </div>
                </div>

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
                  <p className="text-gray-600 text-sm">€9.99/mois</p>
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
                href="https://github.com/openai/whisper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="mr-2">🔗</span>
                GitHub OpenAI
              </a>
              <a
                href="https://github.com/openai/whisper#readme"
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
    </div>
  );
}