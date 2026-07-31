'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import { loginHrefFromWindow, loginUrlWithReturn } from '@/utils/loginRedirect';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import { TOKEN_COSTS, formatCreditsPerAccess } from '../../../utils/tokenActionService';
import { getAppLinks } from '../../../utils/appUsefulLinks';
import { getHunyuan3dAppUrl } from '../../../utils/hunyuan3dAppUrl';
import YouTubeEmbed from '../../../components/YouTubeEmbed';
// import { NotificationServiceClient } from '../../../utils/notificationServiceClient';
// import AuthorizedAccessButton from '../../../components/AuthorizedAccessButton';

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

export default function CardDetailPage({ initialModule }: CardInteractiveProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginHref = loginUrlWithReturn(pathname, searchParams);
  const { user, isAuthenticated, loading: authLoading, token } = useCustomAuth();
  const [card, setCard] = useState<CardModuleData | null>(initialModule ?? null);
  const [loading, setLoading] = useState(!initialModule);
  const [error, setError] = useState<string | null>(null);
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

  // Vérifier si c'est le module librespeed pour appliquer un style spécial
  const isLibrespeed = Boolean(card?.title?.toLowerCase().includes('librespeed') || card?.id === 'librespeed');
  // Vérifier si c'est le module code-learning
  const isCodeLearning = Boolean((card?.title?.toLowerCase().includes('code') && card?.title?.toLowerCase().includes('apprendre')) || card?.id === 'code-learning');
  // Vérifier si c'est le module apprendre-autrement
  const isApprendreAutrement = Boolean(card?.title?.toLowerCase().includes('apprendre autrement') || card?.id === 'apprendre-autrement');
  
  // Vérifier si c'est le module metube pour appliquer un style spécial
  const isMetube = Boolean(card?.title?.toLowerCase().includes('metube') || card?.id === 'metube');
  
  // Vérifier si c'est le module psitransfer pour appliquer un style spécial
  const isPsitransfer = Boolean(card?.title?.toLowerCase().includes('psitransfer') || card?.id === 'psitransfer');
  
  // Vérifier si c'est le module hunyuan3d pour appliquer un style spécial
  const isHunyuan3d = Boolean(card?.title?.toLowerCase().includes('hunyuan') || card?.id === 'hunyuan3d');
  // Vérifier si c'est le module photobooth pour appliquer un workflow essentiel
  const isPhotobooth = Boolean(card?.title?.toLowerCase().includes('photobooth') || card?.id === 'photobooth');
  
  // Debug MeTube
  console.log('🔍 DEBUG METUBE:', {
    cardId: card?.id,
    cardTitle: card?.title,
    isMetube: isMetube,
    paramsId: params.id
  });
  
  // Vérifier si c'est un module gratuit
  const isFreeModule = Boolean(
    card?.price === 0 || 
    card?.price === '0' || 
    card?.price === null ||
    card?.title?.toLowerCase().includes('metube') ||
    card?.title?.toLowerCase().includes('pdf') ||
    card?.title?.toLowerCase().includes('psitransfer')
  );

  // Fonction helper pour obtenir le texte du prix en crédits
  const getPriceText = (moduleId: string | undefined, modulePrice: number | string | null | undefined): string => {
    if (!moduleId) return 'Gratuit';
    
    // Si le prix est 0 ou null, c'est gratuit
    if (modulePrice === 0 || modulePrice === '0' || modulePrice === null) {
      return 'Gratuit';
    }
    
    // Vérifier si le module a un coût en crédits défini
    const tokenCost = TOKEN_COSTS[moduleId as keyof typeof TOKEN_COSTS];
    if (tokenCost) {
      return formatCreditsPerAccess(tokenCost);
    }
    
    // Fallback: utiliser le prix tel quel (pour compatibilité avec les anciens modules)
    return `€${modulePrice} par mois`;
  };

  // Fonction pour vérifier si un module est déjà accessible
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-accès', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
    }
    return false;
  }, [user?.id]);

  // Fonction pour accéder aux modules avec JWT - ouvre l'application directement avec token (mode connecté)
  const accessModuleWithJWT = useCallback(async (moduleTitle: string, moduleId: string) => {
    if (!user?.id) {
      alert('Vous devez être connecté pour accéder aux modules');
      return;
    }

    if (!moduleTitle || !moduleId) {
      console.error('❌ Paramètres manquants:', { moduleTitle, moduleId });
      return;
    }

    try {
      // Modules internes sans token (administration)
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const applicationUrls: Record<string, string> = {
        'librespeed': isDevelopment ? 'http://localhost:8085' : 'https://librespeed.iahome.fr',
        'metube': 'https://metube.iahome.fr',
        'whisper': 'https://whisper.iahome.fr',
        'psitransfer': 'https://psitransfer.iahome.fr',
        'qrcodes': isDevelopment ? 'http://localhost:7006' : 'https://qrcodes.iahome.fr',
        'pdf': 'https://pdf.iahome.fr',
        'stablediffusion': 'https://stablediffusion.iahome.fr',
        'comfyui': 'https://comfyui.iahome.fr',
        'code-learning': '/code-learning',
        'meeting-reports': isDevelopment ? 'http://localhost:3050' : 'https://meeting-reports.iahome.fr',
        'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
        'cogstudio': 'https://cogstudio.iahome.fr',
        'home-assistant': isDevelopment ? 'http://localhost:8123' : 'https://homeassistant.iahome.fr',
        'prompt-generator': 'https://prompt-generator.iahome.fr',
        'apprendre-autrement': isDevelopment ? 'http://localhost:9001' : 'https://apprendre-autrement.iahome.fr',
        'photobooth': isDevelopment ? 'http://localhost:7885' : 'https://photobooth.iahome.fr',
        'administration': '/administration',
        'ai-detector': isDevelopment ? 'http://localhost:3000/ai-detector' : 'https://iahome.fr/ai-detector',
        'sentinelle-numerique': isDevelopment ? 'http://localhost:3000/sentinelle-numerique' : 'https://iahome.fr/sentinelle-numerique',
        'hunyuan3d': getHunyuan3dAppUrl(),
        'photomaker': isDevelopment ? 'http://localhost:7881' : 'https://photomaker.iahome.fr',
        'animagine-xl': isDevelopment ? 'http://localhost:7883' : 'https://animaginexl.iahome.fr',
        'florence-2': isDevelopment ? 'http://localhost:7884' : 'https://florence2.iahome.fr',
        'birefnet': isDevelopment ? 'http://localhost:7882' : 'https://birefnet.iahome.fr',
        'musetalk': isDevelopment ? 'http://localhost:7886' : 'https://musetalk.iahome.fr',
        'photo-vivante': isDevelopment ? 'http://localhost:7887' : 'https://photo-vivante.iahome.fr',
      };

      const accessUrl = applicationUrls[moduleId];
      if (!accessUrl) {
        throw new Error(`URL d'accès non configurée pour ${moduleId}`);
      }

      // Générer le token d'accès (consomme des crédits, authentifie l'utilisateur pour l'app)
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email, moduleId }),
      });

      if (!tokenResponse.ok) {
        const errData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur génération token');
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData?.token;

      // Routes internes avec token (code-learning, ai-detector)
      if (accessUrl.startsWith('/')) {
        if (token) {
          window.open(`${accessUrl}?token=${encodeURIComponent(token)}`, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = accessUrl;
        }
        return;
      }

      // Toutes les apps externes : ouvrir directement l'application avec token (mode connecté)
      const separator = accessUrl.includes('?') ? '&' : '?';
      const urlWithToken = token ? `${accessUrl}${separator}token=${encodeURIComponent(token)}` : accessUrl;
      window.open(urlWithToken, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [user]);

  // L'authentification est maintenant gérée par useCustomAuth

  // Récupérer les abonnements de l'utilisateur et vérifier l'accès du module
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        // Vérifier les souscriptions existantes
        let { data: accessData, error: accessError } = await supabase
          .from('user_applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (accessError) {
          console.log('⚠️ Table user_applications non trouvée, pas d\'abonnements actifs');
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
            console.error(`❌ Exception traitement module ${access.module_id}:`, error);
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
        console.error('❌ Erreur chargement données utilisateur:', error);
        setUserSubscriptions({});
        setCheckingActivation(false);
      }
    };

    fetchUserData();
  }, [user?.id, card?.id, checkModuleActivation]);

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
      if (!params.id) return;

      if (initialModule) {
        setCard(initialModule);
        setLoading(false);
        return;
      }
      
      // Ne pas attendre l'authentification pour charger les détails de la carte
      console.log('🔧 Chargement carte pour:', params.id);

      // Liste des modules qui ont des pages spécifiques
      const specificPages = ['qrcodes', 'stablediffusion', 'comfyui', 'cogstudio', 'ruinedfooocus', 'whisper', 'meeting-reports', 'psitransfer', 'hunyuan3d', 'photomaker', 'animagine-xl', 'florence-2', 'birefnet', 'musetalk', 'photo-vivante', 'sentinelle-numerique'];
      
      // Si c'est un module avec une page spécifique, charger la page spécifique
      if (specificPages.includes(params.id as string)) {
        console.log(`📄 Chargement de la page spécifique pour ${params.id}`);
        // Ne pas rediriger, continuer avec le chargement normal
      }

      try {
        // Gestion spéciale pour LibreSpeed
        if (params.id === 'librespeed') {
          console.log('🔧 Chargement spécial pour LibreSpeed');
          const librespeedCard = {
            id: 'librespeed',
            title: 'LibreSpeed',
            description: 'Test de vitesse internet rapide et précis. Mesurez votre débit de téléchargement et d\'upload avec précision. Coûte 10 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez.',
            subtitle: 'Test de vitesse internet complet - 10 crédits par accès, utilisez aussi longtemps que vous souhaitez',
            category: 'WEB TOOLS',
            price: 10,
            image_url: '/images/librespeed.jpg',
            features: [
              'Test de vitesse précis',
              'Interface moderne et intuitive',
              'Résultats détaillés',
              'Compatible tous navigateurs',
              '10 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez'
            ],
            requirements: [
              'Connexion internet stable',
              'Navigateur web moderne',
              '10 crédits disponibles'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCard(librespeedCard);
          console.log('✅ LibreSpeed chargé avec succès');
          setLoading(false);
          return;
        }

        // Gestion spéciale pour MeTube
        if (params.id === 'metube') {
          console.log('🔧 Chargement spécial pour MeTube - params.id:', params.id);
          const metubeCard = {
            id: 'metube',
            title: 'MeTube',
            description: 'Téléchargez vos vidéos YouTube préférées de manière privée et sécurisée. Convertissez et gérez vos vidéos facilement.',
            subtitle: 'Téléchargeur YouTube privé',
            category: 'MEDIA TOOLS',
            price: 0,
            image_url: '/images/metube.jpg',
            features: [
              'Téléchargement vidéo',
              'Conversion formats',
              'Privé et sécurisé',
              'Interface intuitive'
            ],
            requirements: [
              'Connexion internet stable',
              'Navigateur web moderne'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCard(metubeCard);
          console.log('✅ MeTube chargé avec succès');
          setLoading(false);
          return;
        }

        // Gestion spéciale pour PsiTransfer
        if (params.id === 'psitransfer') {
          console.log('🔧 Chargement spécial pour PsiTransfer - params.id:', params.id);
          const psitransferCard = {
            id: 'psitransfer',
            title: 'PsiTransfer',
            description: 'Transfert de fichiers sécurisé et privé. Envoyez vos fichiers sans surveillance, sans publicité. Quota maximum: 10 Go.',
            subtitle: 'Transfert de fichiers sécurisé (10 crédits par accès)',
            category: 'WEB TOOLS',
            price: 10,
            image_url: '/images/psitransfer.jpg',
            features: [
              'Transfert de fichiers sécurisé',
              'Aucune limite de taille de fichier',
              'Chiffrement end-to-end',
              'Partage par lien temporaire',
              'Interface simple et intuitive',
              '10 crédits par accès. Utilisez l\'application aussi longtemps que vous souhaitez'
            ],
            requirements: [
              'Connexion internet stable',
              'Navigateur web moderne',
              '10 crédits disponibles'
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCard(psitransferCard);
          console.log('✅ PsiTransfer chargé avec succès');
          setLoading(false);
          return;
        }

        // Cog Studio — l’id en base est souvent numérique ; l’URL /card/cogstudio ne doit pas dépendre du SELECT Supabase
        if (params.id === 'cogstudio') {
          const cogstudioCard = {
            id: 'cogstudio',
            title: 'Cog Studio',
            description:
              'Générez des vidéos IA à partir de vos idées. Accès sécurisé avec vos crédits IAHome vers l’application Cog Studio.',
            subtitle: 'Vidéos générées par intelligence artificielle',
            category: 'MEDIA TOOLS',
            price: 10,
            image_url: '/images/cogstudio.jpg',
            features: [
              'Génération vidéo assistée par IA',
              'Interface dédiée sur cogstudio.iahome.fr',
              '10 crédits par accès, utilisation selon vos crédits',
            ],
            requirements: ['Compte IAHome', 'Crédits disponibles', 'Navigateur moderne'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCard(cogstudioCard as Card);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de la carte:', error);
          // Rediriger immédiatement vers l'accueil si le module n'existe pas
          router.replace('/');
          return;
        }

        if (data) {
          setCard(data);
          console.log('🔍 Debug card:', data.title, 'price:', data.price, 'price type:', typeof data.price, 'user:', !!user);
        }
      } catch (error) {
        console.error('Erreur:', error);
        // Rediriger immédiatement vers l'accueil si erreur
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [params.id, router, initialModule]);

  // Gérer l'accès rapide après login (redirect avec openApp=1 ou quick_access=true)
  useEffect(() => {
    const handleQuickAccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const quickAccess = urlParams.get('quick_access');
      const openApp = urlParams.get('openApp');

      const shouldOpenApp = (openApp === '1' || quickAccess === 'true') && card && isAuthenticated && user && !quickAccessAttempted;

      if (shouldOpenApp) {
        setQuickAccessAttempted(true);
        const isFree = card.price === 0 || card.price === '0';

        if (openApp === '1' || isFree) {
          console.log('🚀 Accès direct à l\'application après login:', card.title);
          setTimeout(async () => {
            try {
              await accessModuleWithJWT(card.title, card.id);
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error('Erreur lors de l\'accès direct:', error);
            }
          }, 800);
        }
      }
    };

    if (card && isAuthenticated && user) {
      handleQuickAccess();
    }
  }, [card, isAuthenticated, user, quickAccessAttempted, accessModuleWithJWT]);


  const isCardSelected = (cardId: string) => {
    if (!cardId) return false;
    return selectedCards.some(card => card.id === cardId);
  };

  // Timeout de sécurité pour éviter un chargement infini
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout de chargement - Arrêt après 10 secondes');
        setLoading(false);
      }, 10000); // 10 secondes maximum
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Timeout de sécurité pour authLoading
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout authLoading - Arrêt après 8 secondes');
        // Ne pas forcer authLoading à false car c'est géré par useCustomAuth
        // Mais on peut forcer loading à false pour débloquer la page
        setLoading(false);
      }, 8000); // 8 secondes maximum
      
      return () => clearTimeout(timeout);
    }
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
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

      {/* Bannière spéciale pour librespeed */}
      {isLibrespeed && (
        <section className="bg-gradient-to-br from-yellow-400 via-blue-500 via-indigo-500 to-emerald-600 py-8 relative overflow-hidden">
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
                  Testez votre vitesse internet en temps réel
                </h1>
                <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                  {(card?.category || 'WEB TOOLS').toUpperCase()}
                </span>
                <p className="text-xl text-blue-100 mb-6">
                  LibreSpeed vous offre une analyse précise et détaillée de vos performances réseau avec une interface moderne et intuitive.
                </p>
                
                {/* Badges de fonctionnalités */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    ⚡ Test de vitesse
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    📊 Statistiques détaillées
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    🔒 Sécurisé et privé
                  </span>
                </div>
              </div>
              
              {/* Logo librespeed animé */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-80 h-64">
                  {/* Formes géométriques abstraites */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                  <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-80 animate-pulse"></div>
                  <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                  
                  {/* Logo speedomètre centré */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                      <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                        {/* Cercle extérieur gris */}
                        <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
                        
                        {/* Graduations du speedomètre */}
                        <path d="M12 2 L12 4" stroke="#9CA3AF" strokeWidth="1"/>
                        <path d="M12 20 L12 22" stroke="#9CA3AF" strokeWidth="1"/>
                        <path d="M2 12 L4 12" stroke="#9CA3AF" strokeWidth="1"/>
                        <path d="M20 12 L22 12" stroke="#9CA3AF" strokeWidth="1"/>
                        
                        {/* Arc coloré orange/rouge pour la zone critique */}
                        <path 
                          d="M12 2 A10 10 0 0 1 20 12" 
                          stroke="url(#gradient)" 
                          strokeWidth="3" 
                          fill="none"
                          strokeLinecap="round"
                        />
                        
                        {/* Aiguille bleue */}
                        <path 
                          d="M12 12 L18 8" 
                          stroke="#2563EB" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                        />
                        
                        {/* Point central */}
                        <circle cx="12" cy="12" r="2" fill="#2563EB"/>
                        
                        {/* Indicateurs digitaux en bas */}
                        <rect x="8" y="16" width="1" height="1" fill="#9CA3AF"/>
                        <rect x="10" y="16" width="1" height="1" fill="#9CA3AF"/>
                        <rect x="12" y="16" width="1" height="1" fill="#9CA3AF"/>
                        <rect x="14" y="16" width="1" height="1" fill="#9CA3AF"/>
                        
                        {/* Gradient pour l'arc coloré */}
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F59E0B"/>
                            <stop offset="100%" stopColor="#EF4444"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bannière spéciale pour MeTube */}
      {isMetube && (
        <section className="bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 py-8 relative overflow-hidden">
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
                  Téléchargez vos vidéos YouTube préférées
                </h1>
                <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                  {(card?.category || 'MEDIA TOOLS').toUpperCase()}
                </span>
                <p className="text-xl text-red-100 mb-6">
                  MeTube vous offre une solution complète pour télécharger, convertir et gérer vos vidéos YouTube de manière privée et sécurisée.
                </p>
                
                {/* Badges de fonctionnalités */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    📹 Téléchargement vidéo
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    🔄 Conversion formats
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    🔒 Privé et sécurisé
                  </span>
                </div>
              </div>
              
              {/* Logo MeTube animé */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-80 h-64">
                  {/* Formes géométriques abstraites */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                  <div className="absolute top-16 right-0 w-20 h-20 bg-pink-400 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-80 animate-pulse"></div>
                  <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                  
                  {/* Logo MeTube centré */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-red-500/20">
                      <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                        {/* Icône de vidéo/play */}
                        <rect x="2" y="6" width="20" height="12" rx="2" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
                        <polygon points="9,9 9,15 15,12" fill="white"/>
                        <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vidéo LibreSpeed - Zone séparée après la bannière */}
      {isLibrespeed && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Vidéo */}
            <YouTubeEmbed
              videoId="6z6Fh4buWrU"
              title="Démonstration LibreSpeed"
              origin="https://iahome.fr"
            />
            
            {/* Colonne 2 - Système de boutons */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="space-y-6">
                {/* Boutons d'action */}
                {(card.price === 0 || card.price === '0') && isAuthenticated && user && !isLibrespeed ? (
                  // Bouton d'accès gratuit pour les modules gratuits (uniquement si connecté, sauf LibreSpeed)
                  <>
                    <button 
                      className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={async () => {
                        if (!isAuthenticated || !user) {
                          alert(`Connectez-vous pour accéder ${card?.title || 'ce module'}`);
                          return;
                        }

                        // Pour les modules essentiels, utiliser les APIs d'accès spécifiques
                        const moduleId = params.id as string;
                        
                        // accès PDF
                        if (moduleId === 'pdf') {
                          try {
                            const response = await fetch('/api/activate-pdf', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: user.id,
                                email: user.email
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              alert('PDF+ accessible avec succès ! Ouverture en cours...');
                              await accessModuleWithJWT(card?.title || 'PDF+', moduleId);
                              return;
                            } else {
                              alert(`Erreur lors de l'accès: ${result.error}`);
                              return;
                            }
                          } catch (error) {
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                            return;
                          }
                        }

                        // Générer le token premium automatiquement pour les modules gratuits
                        if (user?.id && (card.price === 0 || card.price === '0')) {
                          try {
                            const response = await fetch('/api/generate-premium-token', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                moduleName: card.title,
                                userId: user.id
                              })
                            });
                            
                            if (response.ok) {
                              console.log('✅ Token premium généré pour', card.title);
                              await accessModuleWithJWT(card.title, moduleId);
                              return;
                            } else {
                              console.error('❌ Erreur génération token premium');
                            }
                          } catch (error) {
                            console.error('❌ Erreur lors de la génération du token:', error);
                          }
                        }

                        await accessModuleWithJWT(card.title, moduleId);
                      }}
                    >
                      <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Accéder à l'application {card.title}</span>
                      <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">Accès gratuit</span>
                    </button>
                  </>
                ) : (card.price === 0 || card.price === '0') && (!isAuthenticated || !user) && !isLibrespeed ? (
                  // Message pour les modules gratuits quand l'utilisateur n'est pas connecté (sauf LibreSpeed)
                  <Link 
                    href={loginHref}
                    className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                  >
                    <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Connectez-vous pour accéder</span>
                    <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">{card?.title || 'Module'}</span>
                  </Link>
                ) : (
                  // Boutons pour les modules payants
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
                            className="inline-flex flex-col items-center gap-1 px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl transition-colors font-semibold shadow-lg"
                          >
                            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                              <polyline points="10 17 15 12 10 7" />
                              <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <span>Voir mes applications</span>
                          </button>
                        </div>
                      </div>
                    )}

                    
                    {/* Bouton "Accéder à la sélection" pour les modules payants */}
                    {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && !alreadyActivatedModules.includes(card.id) && !isPhotobooth && (
                      <button 
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
                            window.location.href = loginHrefFromWindow();
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
                            console.error('Erreur lors de l\'accès:', error);
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Accéder à {card.title}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">Activer l'accès</span>
                      </button>
                    )}

                    {/* Bouton d'accès spécial pour Photobooth */}
                    {isPhotobooth && !alreadyActivatedModules.includes(card.id) && (
                      <button
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                            return;
                          }

                          try {
                            const response = await fetch('/api/activate-photobooth', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: user.id,
                                email: user.email,
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              setAlreadyActivatedModules(prev => [...prev, card.id]);
                              alert('Photobooth accessible avec succès ! Ouverture en cours...');
                              await accessModuleWithJWT(card.title, 'photobooth');
                            } else {
                              alert(`Erreur lors de l'accès: ${result.error}`);
                            }
                          } catch (error) {
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à Photobooth' : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">100 crédits par accès</span>
                      </button>
                    )}


                    {/* Bouton d'accès spécial pour Apprendre le Code aux enfants */}
                    {isCodeLearning && !alreadyActivatedModules.includes(card.id) && (
                      <button
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
                            console.log('❌ Accès Apprendre le Code aux enfants - Utilisateur non connecté');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                            return;
                          }

                          try {
                            console.log('🔄 accès Apprendre le Code aux enfants pour:', user.email);
                            
                            const response = await fetch('/api/activate-code-learning', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: user.id,
                                email: user.email
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              console.log('✅ Apprendre le Code aux enfants accessible avec succès');
                              setAlreadyActivatedModules(prev => [...prev, card.id]);
                              alert('Apprendre le Code aux enfants accessible avec succès ! Ouverture en cours...');
                              await accessModuleWithJWT(card.title, 'code-learning');
                            } else {
                              console.error('❌ Erreur accès Apprendre le Code aux enfants:', result.error);
                              alert(`Erreur lors de l'accès: ${result.error}`);
                            }
                          } catch (error) {
                            console.error('❌ Erreur accès Apprendre le Code aux enfants:', error);
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à Apprendre le Code aux enfants' : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">10 crédits par accès</span>
                      </button>
                    )}

                    {/* Bouton d'accès spécial pour Apprendre Autrement */}
                    {isApprendreAutrement && !alreadyActivatedModules.includes(card.id) && (
                      <button
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
                            console.log('❌ Accès Apprendre Autrement - Utilisateur non connecté');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                            return;
                          }

                          try {
                            console.log('🔄 accès Apprendre Autrement pour:', user.email);
                            
                            const response = await fetch('/api/activate-apprendre-autrement', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: user.id,
                                email: user.email
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              console.log('✅ Apprendre Autrement accessible avec succès');
                              setAlreadyActivatedModules(prev => [...prev, card.id]);
                              alert('Apprendre Autrement accessible avec succès ! Ouverture en cours...');
                              await accessModuleWithJWT(card.title, 'apprendre-autrement');
                            } else {
                              console.error('❌ Erreur accès Apprendre Autrement:', result.error);
                              alert(`Erreur lors de l'accès: ${result.error}`);
                            }
                          } catch (error) {
                            console.error('❌ Erreur accès Apprendre Autrement:', error);
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à Apprendre Autrement' : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">10 crédits par accès</span>
                      </button>
                    )}

                    {/* Bouton d'accès spécial pour LibreSpeed */}
                    {isLibrespeed && !alreadyActivatedModules.includes(card.id) && (
                      <button
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
                            console.log('❌ Accès LibreSpeed - Utilisateur non connecté');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                            return;
                          }

                          try {
                            console.log('🔄 accès LibreSpeed pour:', user.email);
                            
                            const response = await fetch('/api/activate-librespeed-test', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: user.id,
                                email: user.email
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              console.log('✅ LibreSpeed accessible avec succès');
                              setAlreadyActivatedModules(prev => [...prev, card.id]);
                              alert('LibreSpeed accessible avec succès ! Ouverture en cours...');
                              await accessModuleWithJWT(card.title, 'librespeed');
                            } else {
                              console.error('❌ Erreur accès LibreSpeed:', result.error);
                              alert(`Erreur lors de l'accès: ${result.error}`);
                            }
                          } catch (error) {
                            console.error('❌ Erreur accès LibreSpeed:', error);
                            alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à LibreSpeed' : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">10 crédits par accès</span>
                      </button>
                    )}

                    {/* Bouton d'accès pour LibreSpeed déjà accessible - SUPPRIMÉ */}

                    {/* Bouton d'accès spécial pour MeTube */}
                    {isMetube && (
                      <button
                        onClick={async () => {
                          if (isAuthenticated && user) {
                            // Utilisateur connecté : ouverture directe de MeTube
                            console.log('✅ Accès MeTube - Utilisateur connecté');
                            await accessModuleWithJWT(card?.title || 'MeTube', 'metube');
                          } else {
                            // Utilisateur non connecté : aller à la page de connexion puis retour à MeTube
                            console.log('🔒 Accès MeTube - Redirection vers connexion');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? `Accéder à ${card?.title || 'Module'}` : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">{card?.title || 'Module'}</span>
                      </button>
                    )}

                    {/* Bouton d'accès - visible seulement si l'utilisateur a accès au module (autres modules) */}
                    {/* Bouton d'accès pour les modules avec abonnement - SUPPRIMÉ */}

                    {/* Boutons d'accès pour les modules gratuits */}
                    {isFreeModule && !alreadyActivatedModules.includes(card.id) && !isLibrespeed && !isMetube && (
                      <div className="space-y-4">
                        {isAuthenticated && user ? (
                          <button 
                            onClick={async () => {
                              if (user?.id) {
                                try {
                                  // Générer le token premium automatiquement
                                  const response = await fetch('/api/generate-premium-token', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                  body: JSON.stringify({
                                    moduleName: card.title,
                                    userId: user.id
                                  })
                                  });
                                  
                                  if (response.ok) {
                                    console.log(`✅ Token premium généré pour ${card.title}`);
                                    await accessModuleWithJWT(card.title, card.id);
                                  } else {
                                    console.error('❌ Erreur génération token premium');
                                    await accessModuleWithJWT(card.title, card.id);
                                  }
                                } catch (error) {
                                  console.error('❌ Erreur lors de la génération du token:', error);
                                  await accessModuleWithJWT(card.title, card.id);
                                }
                              } else {
                                // Si pas connecté, rediriger vers la connexion
                                router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                              }
                            }}
                            className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                              <polyline points="10 17 15 12 10 7" />
                              <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Accéder à l'application {card.title}</span>
                            <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">Accès gratuit</span>
                          </button>
                        ) : (
                          <Link 
                            href={loginHref}
                            className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                          >
                            <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                              <polyline points="10 17 15 12 10 7" />
                              <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">Connectez-vous pour accéder</span>
                            <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">{card?.title || 'Module'}</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vidéo MeTube - Zone séparée après la bannière */}
      {isMetube && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Vidéo */}
            <YouTubeEmbed
              videoId="IZoAzwgQ8YY"
              title="Démonstration MeTube"
              origin="https://iahome.fr"
            />
            
            {/* Colonne 2 - Système de boutons */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="space-y-6">
                {/* Boutons d'action */}
                <button
                  onClick={async () => {
                    if (isAuthenticated && user) {
                      // Utilisateur connecté : ouverture directe de MeTube
                      console.log('✅ Accès MeTube - Utilisateur connecté');
                      await accessModuleWithJWT(card?.title || 'MeTube', 'metube');
                    } else {
                      // Utilisateur non connecté : redirection vers connexion
                      console.log('🔒 Accès MeTube - Redirection vers connexion');
                      router.push(`/login?redirect=${encodeURIComponent('/card/metube?openApp=1')}`);
                    }
                  }}
                  className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Mes applis' : 'Connectez-vous pour accéder'}</span>
                  <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">Accès à MeTube</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section PsiTransfer - Transfert de fichiers sécurisé */}
      {isPsitransfer && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Vidéo PsiTransfer */}
            <YouTubeEmbed
              videoId="FlzQqgHFUOM"
              title="Démonstration PsiTransfer"
              origin="https://iahome.fr"
            />
            
            {/* Colonne 2 - Système de boutons */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="space-y-6">
                {/* Boutons d'action pour PsiTransfer */}
                {!alreadyActivatedModules.includes(card.id) && (
                  <button
                    onClick={async () => {
                      if (!isAuthenticated || !user) {
                        console.log('❌ Accès PsiTransfer - Utilisateur non connecté');
                        router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}?openApp=1`)}`);
                        return;
                      }

                      try {
                        console.log('🔄 accès PsiTransfer pour:', user.email);
                        
                        const response = await fetch('/api/activate-psitransfer', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: user.id,
                            email: user.email
                          }),
                        });

                        const result = await response.json();

                        if (result.success) {
                          console.log('✅ PsiTransfer accessible avec succès');
                          setAlreadyActivatedModules(prev => [...prev, card.id]);
                          alert('PsiTransfer accessible avec succès ! Ouverture en cours...');
                          await accessModuleWithJWT(card.title, 'psitransfer');
                        } else {
                          console.error('❌ Erreur accès PsiTransfer:', result.error);
                          alert(`Erreur lors de l'accès: ${result.error}`);
                        }
                      } catch (error) {
                        console.error('❌ Erreur accès PsiTransfer:', error);
                        alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                      }
                    }}
                    className="w-3/4 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à PsiTransfer' : 'Connectez-vous pour accéder'}</span>
                    <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">10 crédits par accès</span>
                  </button>
                )}

                {/* Bouton d'accès pour PsiTransfer déjà accessible - SUPPRIMÉ */}

                {/* Informations sur PsiTransfer */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">ℹ️</span>
                    À propos de PsiTransfer
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Transfert de fichiers sécurisé et privé</li>
                    <li>• Aucune limite de taille de fichier</li>
                    <li>• Chiffrement end-to-end</li>
                    <li>• Partage par lien temporaire</li>
                    <li>• Interface simple et intuitive</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vidéo Hunyuan 3D - Zone séparée après la bannière */}
      {isHunyuan3d && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Vidéo */}
            <YouTubeEmbed
              videoId="CP2cDFgbs8s"
              title="Démonstration Hunyuan 3D"
              origin="https://iahome.fr"
            />
            
            {/* Colonne 2 - Système de boutons */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            </div>
          </div>
        </div>
      )}

      {/* Vidéo YouTube générique - pour tous les modules avec youtube_url qui n'ont pas de section vidéo spécifique */}
      {card?.youtube_url && !isLibrespeed && !isMetube && !isPsitransfer && !isHunyuan3d && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Vidéo */}
            <YouTubeEmbed
              videoId={card.youtube_url}
              title={`Démonstration ${card.title}`}
              origin="https://iahome.fr"
            />
            
            {/* Colonne 2 - Informations du module */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal - seulement pour les modules non-LibreSpeed, non-MeTube, non-PsiTransfer et non-Hunyuan3d */}
      {!isLibrespeed && !isMetube && !isPsitransfer && !isHunyuan3d && (
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-12">
            {/* Grille principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-8">
                {/* En-tête de la carte */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="mb-8">
                    <div className="flex-1">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 leading-tight">
                        {card.title}
                      </h1>
                      {card.subtitle && (
                        <p className="text-xl text-gray-500 italic mb-6 leading-relaxed max-w-2xl">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

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
                  À propos de {card.title}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    {card.description}
                    {!card.description?.toLowerCase().includes('sans téléchargement') && !card.description?.toLowerCase().includes('sans installation') && (
                      <span className="text-gray-600"> • Sans téléchargement</span>
                    )}
                  </p>
                  {card.subtitle && (
                    <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que LibreSpeed */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Qu'est-ce que LibreSpeed ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        LibreSpeed est un outil de test de débit Internet open-source et gratuit qui vous permet de mesurer 
                        précisément les performances de votre connexion. Contrairement aux services traditionnels de test de vitesse, 
                        LibreSpeed se distingue par son approche respectueuse de la vie privée et son absence totale de publicités.
                      </p>
                      <p className="text-base leading-relaxed">
                        Développé par une communauté de passionnés, cet outil offre une alternative éthique aux géants du web 
                        qui collectent vos données personnelles à des fins commerciales. LibreSpeed vous donne accès à des métriques 
                        précises sans compromettre votre confidentialité.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Pourquoi choisir LibreSpeed */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-green-900">Pourquoi choisir LibreSpeed ?</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Respect total de la vie privée :</strong> Aucune donnée personnelle n'est collectée, aucun cookie 
                        de tracking n'est installé, et aucune publicité n'est affichée. Vos tests restent strictement privés.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Précision exceptionnelle :</strong> Les algorithmes de test sont optimisés pour fournir des résultats 
                        fiables et reproductibles, vous donnant une image fidèle de vos performances réseau réelles.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Interface moderne et intuitive :</strong> Une expérience utilisateur soignée qui s'adapte à tous les 
                        appareils, des smartphones aux écrans 4K, avec des graphiques en temps réel et des animations fluides.
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
                        <strong>Tests complets :</strong> Mesurez votre débit descendant (download), montant (upload), et votre latence 
                        (ping) avec une précision au milliseconde près. Les tests sont optimisés pour différents types de connexions.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Statistiques détaillées :</strong> Analysez vos performances réseau avec précision.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Compatibilité universelle :</strong> Fonctionne sur tous les navigateurs modernes (Chrome, Firefox, 
                        Safari, Edge) et s'adapte automatiquement aux connexions lentes comme aux fibres optiques ultra-rapides.
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
                        <strong>Particuliers :</strong> Vérifiez que votre fournisseur d'accès respecte ses engagements, 
                        diagnostiquez les problèmes de connexion, et optimisez votre configuration réseau pour de meilleures performances.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Professionnels :</strong> Testez la qualité de votre connexion professionnelle, validez les performances 
                        avant des réunions importantes, et documentez les problèmes pour vos fournisseurs de services.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Développeurs :</strong> Intégrez LibreSpeed dans vos applications pour offrir des tests de vitesse 
                        intégrés, ou utilisez l'API pour créer des outils de monitoring personnalisés.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-red-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Données locales :</strong> Tous les calculs sont effectués localement dans votre navigateur. 
                        Aucune information n'est envoyée à des serveurs tiers ou stockée sans votre consentement explicite.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Code open-source :</strong> Le code source est entièrement transparent et auditable par la communauté. 
                        Vous pouvez vérifier par vous-même qu'aucune fonction de tracking n'est présente.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Conformité RGPD :</strong> LibreSpeed respecte strictement les réglementations européennes sur la 
                        protection des données, garantissant que vos informations restent sous votre contrôle total.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Optimisé pour des performances exceptionnelles et une expérience utilisateur fluide.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="font-bold text-green-900 mb-3 text-lg">Sécurité</h4>
                      <p className="text-gray-700 text-sm">Protection des données et respect de la vie privée garantis.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Accessibilité</h4>
                      <p className="text-gray-700 text-sm">Compatible avec tous les navigateurs et appareils modernes.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 sm:p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h4 className="font-bold text-orange-900 mb-3 text-lg">Analytics</h4>
                      <p className="text-gray-700 text-sm">Statistiques détaillées et métriques avancées pour optimiser vos résultats.</p>
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
                          {getPriceText(card?.id, card?.price)}
                        </p>
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
                    {getAppLinks(card.id).map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        <span className="mr-2">{link.icon || '🔗'}</span>
                        {link.label}
                      </a>
                    ))}
                    {getAppLinks(card.id).length === 0 && (
                      <p className="text-gray-500 text-sm">Aucun lien disponible pour cette application.</p>
                    )}
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
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenu de l'iframe */}
            <div className="flex-1 p-4">
              {(() => {
                const isLocalProxy = iframeModal.url.startsWith('/api/');
                const isLibreSpeedProxy = iframeModal.url.startsWith('/api/proxy-librespeed');
                const isMetubeProxy = iframeModal.url.startsWith('/api/proxy-metube');
                const sandbox = isLibreSpeedProxy
                  ? 'allow-scripts allow-forms allow-same-origin'
                  : isMetubeProxy
                    ? 'allow-scripts allow-forms allow-same-origin'
                    : isLocalProxy
                      ? 'allow-scripts allow-forms'
                      : 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin';
                return (
                  <iframe
                    src={iframeModal.url || ''}
                    className="w-full h-full border-0 rounded"
                    title={iframeModal.title || 'Module'}
                    allowFullScreen
                    sandbox={sandbox}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 




