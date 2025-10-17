'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
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

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, token } = useCustomAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
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
  
  // Vérifier si c'est le module metube pour appliquer un style spécial
  const isMetube = Boolean(card?.title?.toLowerCase().includes('metube') || card?.id === 'metube');
  
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
    card?.title?.toLowerCase().includes('librespeed') ||
    card?.title?.toLowerCase().includes('metube') ||
    card?.title?.toLowerCase().includes('pdf') ||
    card?.title?.toLowerCase().includes('psitransfer')
  );

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
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
      console.error('Erreur lors de la vérification d\'activation:', error);
    }
    return false;
  }, [user?.id]);

  // Fonction pour accéder aux modules avec JWT
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
      // Gestion spéciale pour Metube avec lien direct
      if (moduleTitle.toLowerCase().includes('metube') || moduleTitle.toLowerCase().includes('me tube')) {
        console.log('🔑 Accès direct à Metube via iframe');
        const metubeUrl = 'https://metube.iahome.fr';
        console.log('🔗 URL d\'accès Metube directe:', metubeUrl);
        setIframeModal({
          isOpen: true,
          url: metubeUrl,
          title: moduleTitle
        });
        return;
      }

      // Gestion spéciale pour PDF avec lien direct
      if (moduleTitle.toLowerCase().includes('pdf') || moduleTitle.toLowerCase().includes('pdf+')) {
        console.log('🔑 Accès direct à PDF via iframe');
        const pdfUrl = 'https://pdf.iahome.fr';
        console.log('🔗 URL d\'accès PDF directe:', pdfUrl);
        setIframeModal({
          isOpen: true,
          url: pdfUrl,
          title: moduleTitle
        });
        return;
      }

      // Gestion spéciale pour LibreSpeed avec lien direct
      if (moduleTitle.toLowerCase().includes('librespeed') || moduleTitle.toLowerCase().includes('speed')) {
        console.log('🔑 Accès direct à LibreSpeed via iframe');
        const librespeedUrl = 'https://librespeed.iahome.fr';
        console.log('🔗 URL d\'accès LibreSpeed directe:', librespeedUrl);
        setIframeModal({
          isOpen: true,
          url: librespeedUrl,
          title: moduleTitle
        });
        return;
      }

      // Pour les autres modules, utiliser le système JWT existant
      console.log('🔍 Génération du token JWT pour:', moduleTitle);
      
      const expirationHours = moduleTitle.toLowerCase() === 'ruinedfooocus' ? 12 : undefined;
      
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          moduleId: moduleId,
          moduleName: moduleTitle.toLowerCase().replace(/\s+/g, ''),
          expirationHours: expirationHours
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
      console.log('✅ Token JWT généré avec succès');
      
      const moduleUrls: { [key: string]: string } = {
        'stablediffusion': 'https://stablediffusion.iahome.fr',
        'iaphoto': 'https://iaphoto.iahome.fr', 
        'metube': 'https://metube.iahome.fr',
        'ia metube': 'https://metube.iahome.fr',
        'chatgpt': 'https://chatgpt.iahome.fr',
        'librespeed': 'https://librespeed.iahome.fr',
        'psitransfer': 'https://psitransfer.iahome.fr',
        'pdf+': 'https://pdf.iahome.fr',
        'pdf': 'https://pdf.iahome.fr',
        'aiassistant': 'https://aiassistant.iahome.fr',
        'cogstudio': 'https://cogstudio.iahome.fr',
        'ruinedfooocus': '/api/gradio-secure'
      };

      const normalizedName = (moduleName || '').toLowerCase().replace(/\s+/g, '');
      let baseUrl = moduleUrls[normalizedName];
      
      if (!baseUrl) {
        const titleKey = (moduleTitle || '').toLowerCase().replace(/\s+/g, '');
        baseUrl = moduleUrls[titleKey];
      }
      
      if (!baseUrl && ((moduleName || '').toLowerCase().includes('librespeed') || (moduleTitle || '').toLowerCase().includes('librespeed'))) {
        baseUrl = 'https://librespeed.iahome.fr';
      }
      
      if (!baseUrl) {
        baseUrl = 'https://metube.iahome.fr';
      }
      
      const isProxyModule = baseUrl.startsWith('/api/');
      const accessUrl = isProxyModule ? baseUrl : `${baseUrl}?token=${accessToken}`;
      console.log('🔗 URL d\'accès:', accessUrl);
      
      setIframeModal({
        isOpen: true,
        url: accessUrl,
        title: moduleTitle
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [user, token, setIframeModal]);

  // L'authentification est maintenant gérée par useCustomAuth

  // Récupérer les abonnements de l'utilisateur et vérifier l'activation du module
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
                expires_at: access.expires_at,
                is_active: access.is_active
              }
            };
          } catch (error) {
            console.error(`❌ Exception traitement module ${access.module_id}:`, error);
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
      
      // Ne pas attendre l'authentification pour charger les détails de la carte
      console.log('🔧 Chargement carte pour:', params.id);

      // Liste des modules qui ont des pages spécifiques
      const specificPages = ['qrcodes', 'stablediffusion', 'comfyui', 'sdnext', 'cogstudio', 'ruinedfooocus', 'whisper', 'meeting-reports'];
      
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
            description: 'Test de vitesse internet rapide et précis. Mesurez votre débit de téléchargement et d\'upload avec précision.',
            subtitle: 'Test de vitesse internet',
            category: 'WEB TOOLS',
            price: 0,
            image_url: '/images/librespeed.jpg',
            features: [
              'Test de vitesse précis',
              'Interface moderne et intuitive',
              'Résultats détaillés',
              'Compatible tous navigateurs'
            ],
            requirements: [
              'Connexion internet stable',
              'Navigateur web moderne'
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

        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de la carte:', error);
          // Au lieu de rediriger, afficher une carte par défaut
          const defaultCard = {
            id: params.id as string,
            title: params.id as string,
            description: 'Module en cours de configuration',
            category: 'AUTRE',
            price: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCard(defaultCard);
          setLoading(false);
          return;
        }

        if (data) {
          setCard(data);
          console.log('🔍 Debug card:', data.title, 'price:', data.price, 'price type:', typeof data.price, 'user:', !!user);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement du module');
        // Au lieu de rediriger, afficher une carte par défaut
        const defaultCard = {
          id: params.id as string,
          title: params.id as string,
          description: 'Module en cours de configuration',
          category: 'AUTRE',
          price: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCard(defaultCard);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [params.id, router]);

  // Gérer l'accès rapide
  useEffect(() => {
    const handleQuickAccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const quickAccess = urlParams.get('quick_access');
      
      if (quickAccess === 'true' && card && isAuthenticated && user && !quickAccessAttempted) {
        setQuickAccessAttempted(true);
        
        if (card.price === 0 || card.price === '0') {
          console.log('🚀 Accès rapide demandé pour:', card.title);
          
          setTimeout(async () => {
            try {
              await accessModuleWithJWT(card.title, card.id);
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error('Erreur lors de l\'accès rapide:', error);
            }
          }, 1000);
        }
      }
    };

    if (card && isAuthenticated && user) {
      handleQuickAccess();
    }
  }, [card, isAuthenticated, user, quickAccessAttempted, accessModuleWithJWT]);

  const handleSubscribe = (card: Card) => {
    if (!card?.id) {
      console.error('❌ Carte invalide:', card);
      return;
    }

    const isSelected = selectedCards.some(c => c.id === card.id);
    let newSelectedCards;
    
    if (isSelected) {
      newSelectedCards = selectedCards.filter(c => c.id !== card.id);
      console.log('Désabonnement de:', card.title);
    } else {
      newSelectedCards = [...selectedCards, card];
      console.log('Abonnement à:', card.title);
    }
    
    console.log('Nouveaux modules sélectionnés:', newSelectedCards);
    setSelectedCards(newSelectedCards);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
      console.log('localStorage mis à jour');
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
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
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
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
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
            <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
              <iframe
                className="w-full h-full rounded-2xl"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
                title="Démonstration LibreSpeed"
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
                    {card.price === 0 || card.price === '0' ? 
                      (isFreeModule ? '10 tokens' : 'Free') : 
                      '100 tokens'
                    }
                  </div>
                  <div className="text-sm opacity-90">
                    {card.price === 0 || card.price === '0' ? 
                      (isFreeModule ? 'par utilisation' : 'Gratuit') : 
                      'par utilisation'
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Boutons d'action */}
                {(card.price === 0 || card.price === '0') && isAuthenticated && user && !isLibrespeed ? (
                  // Bouton d'accès gratuit pour les modules gratuits (uniquement si connecté, sauf LibreSpeed)
                  <>
                    <button 
                      className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={async () => {
                        if (!isAuthenticated || !user) {
                          alert(`Connectez-vous pour activer ${card?.title || 'ce module'}`);
                          return;
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
                              // Rediriger vers la page de transition
                              router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                              return;
                            } else {
                              console.error('❌ Erreur génération token premium');
                            }
                          } catch (error) {
                            console.error('❌ Erreur lors de la génération du token:', error);
                          }
                        }

                        // En cas d'erreur, rediriger quand même vers la page de transition
                        router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                      }}
                    >
                      <span className="text-xl">🆓</span>
                      <span>Activer l'application {card.title}</span>
                    </button>
                  </>
                ) : (card.price === 0 || card.price === '0') && (!isAuthenticated || !user) && !isLibrespeed ? (
                  // Message pour les modules gratuits quand l'utilisateur n'est pas connecté (sauf LibreSpeed)
                  <a 
                    href="/login"
                    className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                  >
                    <span className="text-xl">🔒</span>
                    <span>Connectez-vous pour activer {card?.title || 'Module'}</span>
                  </a>
                ) : (
                  // Boutons pour les modules payants
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

                    
                    {/* Bouton "Activer la sélection" pour les modules payants */}
                    {isCardSelected(card.id) && card.price !== 0 && card.price !== '0' && !alreadyActivatedModules.includes(card.id) && (
                      <button 
                        className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        onClick={async () => {
                          if (!isAuthenticated || !user) {
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
                            console.error('Erreur lors de l\'activation:', error);
                            alert(`Erreur lors de l'activation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                          }
                        }}
                      >
                        <span className="text-xl">⚡</span>
                        <span>Activer {card.title}</span>
                      </button>
                    )}


                    {/* Bouton d'accès spécial pour LibreSpeed */}
                    {isLibrespeed && (
                      <button
                        onClick={() => {
                          if (isAuthenticated && user) {
                            // Utilisateur connecté : aller à la page de transition puis /encours
                            console.log('✅ Accès LibreSpeed - Utilisateur connecté');
                            router.push(`/token-generated?module=${encodeURIComponent(card.title)}&redirect=/encours`);
                          } else {
                            // Utilisateur non connecté : aller à la page de connexion puis retour à LibreSpeed
                            console.log('🔒 Accès LibreSpeed - Redirection vers connexion');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}`)}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span className="text-xl">⚡</span>
                        <span>
                          {isAuthenticated && user ? `Activer ${card?.title || 'Module'}` : `Connectez-vous pour activer ${card?.title || 'Module'}`}
                        </span>
                      </button>
                    )}

                    {/* Bouton d'accès spécial pour MeTube */}
                    {isMetube && (
                      <button
                        onClick={() => {
                          if (isAuthenticated && user) {
                            // Utilisateur connecté : aller à la page de transition puis /encours
                            console.log('✅ Accès MeTube - Utilisateur connecté');
                            router.push(`/token-generated?module=${encodeURIComponent(card.title)}&redirect=/encours`);
                          } else {
                            // Utilisateur non connecté : aller à la page de connexion puis retour à MeTube
                            console.log('🔒 Accès MeTube - Redirection vers connexion');
                            router.push(`/login?redirect=${encodeURIComponent(`/card/${card.id}`)}`);
                          }
                        }}
                        className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span className="text-xl">🎥</span>
                        <span>
                          {isAuthenticated && user ? `Activer ${card?.title || 'Module'}` : `Connectez-vous pour activer ${card?.title || 'Module'}`}
                        </span>
                      </button>
                    )}

                    {/* Bouton d'accès - visible seulement si l'utilisateur a accès au module (autres modules) */}
                    {!isLibrespeed && !isMetube && isAuthenticated && user && userSubscriptions[`module_${card.id}`] && (
                      <button
                        onClick={() => {
                          console.log('✅ Accès à l\'application accordé');
                          // Redirection simple vers l'application
                          window.open(`https://${card.id}.iahome.fr`, '_blank');
                        }}
                        className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span className="text-xl">🔑</span>
                        <span>Accéder à {card.title}</span>
                      </button>
                    )}

                    {/* Boutons d'activation pour les modules gratuits */}
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
                                    // Rediriger vers la page de transition
                                    router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                                  } else {
                                    console.error('❌ Erreur génération token premium');
                                    // En cas d'erreur, rediriger quand même vers la page de transition
                                    router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                                  }
                                } catch (error) {
                                  console.error('❌ Erreur lors de la génération du token:', error);
                                  // En cas d'erreur, rediriger quand même vers la page de transition
                                  router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                                }
                              } else {
                                // Si pas connecté, rediriger vers la page de transition
                                router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                              }
                            }}
                            className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            <span className="text-xl">🆓</span>
                            <span>Activer l'application {card.title}</span>
                          </button>
                        ) : (
                          <a 
                            href="/login"
                            className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                          >
                            <span className="text-xl">🔒</span>
                            <span>Connectez-vous pour activer {card?.title || 'Module'}</span>
                          </a>
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
            <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
              <iframe
                className="w-full h-full rounded-2xl"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
                title="Démonstration MeTube"
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
                    {card.price === 0 || card.price === '0' ? 
                      (isFreeModule ? '10 tokens' : 'Free') : 
                      '100 tokens'
                    }
                  </div>
                  <div className="text-sm opacity-90">
                    {card.price === 0 || card.price === '0' ? 
                      (isFreeModule ? 'par utilisation' : 'Gratuit') : 
                      'par utilisation'
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Boutons d'action */}
                <button
                  onClick={() => {
                    if (isAuthenticated && user) {
                      // Utilisateur connecté : aller à la page de transition puis /encours
                      console.log('✅ Accès MeTube - Utilisateur connecté');
                      router.push(`/token-generated?module=${encodeURIComponent(card.title)}&redirect=/encours`);
                    } else {
                      // Utilisateur non connecté : aller à la page de transition (comme LibreSpeed)
                      console.log('🔒 Accès MeTube - Redirection vers page de transition');
                      router.push(`/token-generated?module=${encodeURIComponent(card.title)}`);
                    }
                  }}
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="text-xl">🎥</span>
                  <span>
                    {isAuthenticated && user ? 'Mes applis' : 'Connectez-vous pour accéder'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal - seulement pour les modules non-LibreSpeed et non-MeTube */}
      {!isLibrespeed && !isMetube && (
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
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 leading-tight">
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
                        <strong>Statistiques détaillées :</strong> Visualisez vos résultats avec des graphiques interactifs, 
                        suivez l'évolution de vos performances dans le temps, et exportez vos données pour analyse approfondie.
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
                          {card.price === 0 || card.price === '0' ? 'Gratuit' : `€${card.price} par mois`}
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
                
                {/* Call to action */}
                <div className="text-center pt-8">
                  <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-4xl mx-auto">
                    Prêt à découvrir {card.title} ? Commencez dès maintenant et profitez de toutes ses fonctionnalités !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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