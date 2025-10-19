'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useCustomAuth } from '../../hooks/useCustomAuth';
import LibreSpeedAccessButton from '../../components/LibreSpeedAccessButton';
import MeTubeAccessButton from '../../components/MeTubeAccessButton';
import AIAccessButton from '../../components/AIAccessButton';
import EssentialAccessButton from '../../components/EssentialAccessButton';
import ModuleAccessButton from '../../components/ModuleAccessButton';
import QRCodeAccessButton from '../../components/QRCodeAccessButton';
import PDFAccessButton from '../../components/PDFAccessButton';
import PsiTransferAccessButton from '../../components/PsiTransferAccessButton';
import MeetingReportsAccessButton from '../../components/MeetingReportsAccessButton';
import { TokenActionServiceClient } from '../../utils/tokenActionServiceClient';

interface UserModule {
  id: string;
  module_id: string;
  module_title: string;
  module_description: string;
  module_category: string;
  module_url: string;
  access_type: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  current_usage?: number;
  max_usage?: number;
  user_id?: string;
  created_by?: string;
  price?: number | string;
  is_free?: boolean;
}

export default function EncoursPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingModule, setProcessingModule] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [cacheBuster] = useState(() => Date.now() + Math.random() * 1000);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Vérification de l'authentification
  useEffect(() => {
    if (authLoading) return; // Attendre que l'authentification soit vérifiée
    
    // Ajouter un petit délai pour s'assurer que l'authentification est bien chargée
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        ;
        router.push('/login');
        return;
      }
      
      console.log('Utilisateur authentifié:', user.email);
    }, 100); // 100ms de délai
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, authLoading, router]);

  // Vérifier s'il y a des erreurs de token dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const balanceParam = urlParams.get('balance');
    const moduleParam = urlParams.get('module');
    
    if (errorParam) {
      switch (errorParam) {
        case 'invalid_token':
          setTokenError('Token d\'accès invalide. Veuillez cliquer à nouveau sur "Accéder à l\'application".');
          break;
        case 'token_expired':
          setTokenError('Token d\'accès expiré. Veuillez cliquer à nouveau sur "Accéder à l\'application".');
          break;
        case 'token_verification_failed':
          setTokenError('Erreur de vérification du token. Veuillez réessayer.');
          break;
        case 'insufficient_tokens':
          const moduleName = moduleParam || 'cette application';
          const balance = balanceParam || '0';
          setTokenError(`🪙 Tokens insuffisants pour accéder à ${moduleName}. Solde actuel: ${balance} token(s). Veuillez acheter des tokens pour continuer.`);
          break;
        case 'token_check_failed':
          setTokenError('Erreur lors de la vérification des tokens. Veuillez réessayer ou contacter le support.');
          break;
        default:
          setTokenError('Erreur d\'accès à l\'application. Veuillez réessayer.');
      }
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    if (!user) return;
    
    // Le rôle est déjà disponible dans l'objet user de notre système d'authentification
    setRole(user.role || 'user');
  }, [user]);

  // Charger les données de tokens
  const fetchTokenData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingTokens(true);
      
      // Charger le solde de tokens
      const tokenService = TokenActionServiceClient.getInstance();
      const balance = await tokenService.getUserTokenBalance(user.id);
      setTokenBalance(balance);
      
      // Charger l'historique d'utilisation
      const history = await tokenService.getUserTokenHistory(user.id, 20);
      setTokenHistory(history);
      
    } catch (error) {
      console.error('Erreur chargement tokens:', error);
    } finally {
      setLoadingTokens(false);
    }
  };

  // Charger les modules souscrits par l'utilisateur et les tokens d'accès
  useEffect(() => {
    const fetchUserModules = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔍 Chargement des modules pour utilisateur:', user.id);
        
        // Récupérer les modules souscrits via user_applications avec jointure vers modules
        let moduleAccessData: any[] | null = null;
        let moduleAccessError: any = null;
        
        try {
          const result = await supabase
            .from('user_applications')
            .select(`
              id,
              user_id,
              module_id,
              module_title,
              access_level,
              expires_at,
              is_active,
              created_at,
              usage_count,
              max_usage
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          moduleAccessData = result.data;
          moduleAccessError = result.error;
          console.log('📊 Modules user_applications récupérés:', moduleAccessData?.length || 0);
        } catch (error) {
          moduleAccessError = error;
        }

        if (moduleAccessError) {
          const errorMessage = moduleAccessError.message || moduleAccessError.details || moduleAccessError.hint || JSON.stringify(moduleAccessError) || 'Erreur inconnue';
          throw new Error(`Erreur lors du chargement des modules: ${errorMessage}`);
        }

        // Récupérer les informations des modules séparément
        let modulesData: any[] = [];
        let modulesError: any = null;
        
        if (moduleAccessData && moduleAccessData.length > 0) {
          const moduleIds = moduleAccessData.map(access => access.module_id).filter(Boolean);
          if (moduleIds.length > 0) {
            try {
              const result = await supabase
                .from('modules')
                .select(`
                  id,
                  title,
                  description,
                  category,
                  url,
                  price
                `)
                .in('id', moduleIds);

              modulesData = result.data || [];
              modulesError = result.error;
            } catch (error) {
              modulesError = error;
            }
          }
        }

        if (modulesError) {
          }

// Vérifier que les données sont valides
        if (!moduleAccessData) {
          moduleAccessData = []; // Initialiser avec un tableau vide
        }
        
        // S'assurer que les données sont des tableaux
        if (!Array.isArray(moduleAccessData)) {
          moduleAccessData = [];
        }
        
        // Transformer les modules user_applications avec vérification de sécurité
        const transformedModules: UserModule[] = [];
        
        for (const access of (moduleAccessData || [])) {
          // Vérifier que l'accès est valide
          if (!access || typeof access !== 'object' || !access.id) {
            console.error('Accès invalide:', access);
            continue;
          }
          
          // Filtrer les accès non expirés
          if (access.expires_at) {
            try {
              if (new Date(access.expires_at) <= new Date()) {
                console.log('⏰ Module expiré ignoré:', access.module_title);
                continue;
              }
            } catch (error) {
              console.error('Erreur vérification date expiration:', error);
              continue;
            }
          }
          
          // Vérifier que le module est visible dans /encours via l'API de sécurité
          try {
            const securityResponse = await fetch(`/api/check-module-security?module=${access.module_id}&userId=${user.id}`);
            const securityResult = await securityResponse.json();
            
            if (!securityResult.success || !securityResult.isVisible || !securityResult.hasAccess) {
              console.log('🔒 Module non visible dans /encours:', access.module_title, securityResult.reason);
              continue;
            }
            
            console.log('✅ Module visible dans /encours:', access.module_title);
          } catch (securityError) {
            console.error('Erreur vérification sécurité module:', securityError);
            // En cas d'erreur, on garde le module par sécurité
          }
          
          // Créer l'objet module
          try {
            // Trouver les informations du module correspondant
            const moduleInfo = modulesData.find(module => module.id.toString() === access.module_id?.toString()) || {};
            const isFree = moduleInfo.price === 0 || moduleInfo.price === '0' || moduleInfo.price === null;
            
            const module: UserModule = {
              id: access.id || 'unknown',
              module_id: access.module_id || 'unknown',
              module_title: access.module_title || moduleInfo.title || `Module ${access.module_id || 'unknown'}`,
              module_description: moduleInfo.description || 'Module activé via souscription',
              module_category: 'Module activé',
              module_url: moduleInfo.url || '',
              access_type: (access.access_level || 'basic').replace(/premium\d+/, 'premium'),
              expires_at: access.expires_at || null,
              is_active: access.is_active !== undefined ? access.is_active : true,
              created_at: access.created_at || new Date().toISOString(),
              current_usage: access.usage_count || 0,
              max_usage: access.max_usage || undefined,
              user_id: access.user_id,
              created_by: access.user_id,
              price: moduleInfo.price || 0,
              is_free: isFree
            };
            
            transformedModules.push(module);
          } catch (error) {
            console.error('Erreur création module:', error);
          }
        }

        // Utiliser seulement les modules transformés
        const allModules = transformedModules;
        
        setUserModules(allModules);
        setError(null);
        
      } catch (error) {
        setError(`Erreur lors du chargement des modules: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        setUserModules([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserModules();
      fetchTokenData(); // Charger aussi les données de tokens
    }
  }, [user]);

  // Mapping des modules vers leurs URLs directes (sécurisées via tokens)
  const getModuleUrl = (moduleId: string): string => {
    // Mapping des module_id (numériques) vers les slugs
    const moduleIdMapping: { [key: string]: string } = {
      '1': 'pdf',      // PDF+ -> pdf
      '2': 'metube',   // MeTube -> metube
      '3': 'librespeed', // LibreSpeed -> librespeed
      '4': 'psitransfer', // PsiTransfer -> psitransfer
      '5': 'qrcodes',  // QR Codes -> qrcodes
      '7': 'stablediffusion', // Stable Diffusion -> stablediffusion
      '8': 'ruinedfooocus', // Ruined Fooocus -> ruinedfooocus
      '10': 'comfyui', // ComfyUI -> comfyui
      '11': 'cogstudio', // Cog Studio -> cogstudio
      'meeting-reports': 'meeting-reports', // Meeting Reports -> meeting-reports
      'qrcodes-statiques': 'qrcodes-statiques', // QR Codes Statiques
    };

    // Mapping des slugs vers les URLs directes des applications
    const directUrls: { [key: string]: string } = {
      'metube': 'http://localhost:8081',  // MeTube accès direct
      'librespeed': 'http://localhost:8085',  // LibreSpeed accès direct
      'pdf': 'http://localhost:8080',  // PDF accès direct
      'psitransfer': 'http://localhost:8082',  // PsiTransfer accès direct
      'qrcodes': 'http://localhost:8083',  // QR Codes accès direct
      'qrcodes-statiques': 'http://localhost:7005',  // QR Codes Statiques local
      'whisper': 'http://localhost:8084',  // Whisper accès direct
      'stablediffusion': 'http://localhost:7860',  // StableDiffusion accès direct
      'ruinedfooocus': 'http://localhost:7861',  // RuinedFooocus accès direct
      'comfyui': 'http://localhost:8188',  // ComfyUI accès direct
      'cogstudio': 'http://localhost:8086',  // CogStudio accès direct
      'meeting-reports': 'https://meeting-reports.iahome.fr',  // Meeting Reports direct avec token
    };
    
    // Convertir module_id numérique en slug si nécessaire
    const slug = moduleIdMapping[moduleId] || moduleId;
    const url = directUrls[slug] || '';
    
    console.log(`🔗 getModuleUrl: ${moduleId} -> ${slug} -> ${url}`);
    return url;
  };

  // Mapping des modules vers leurs coûts en tokens
  const getModuleCost = (moduleId: string): number => {
    const moduleCosts: { [key: string]: number } = {
      // Applications IA (100 tokens)
      'whisper': 100,
      'stablediffusion': 100,
      'ruinedfooocus': 100,
      'comfyui': 100,
      
      // Applications essentielles (10 tokens)
      'librespeed': 10,
      'metube': 10,
      'psitransfer': 10,
      'qrcodes': 10,
      'pdf': 10,
      'meeting-reports': 10,
      'cogstudio': 10,
      
      // Anciens IDs numériques (pour compatibilité)
      '1': 10,      // PDF+ -> 10 tokens
      '2': 10,      // MeTube -> 10 tokens
      '3': 10,      // LibreSpeed -> 10 tokens
      '4': 10,      // PsiTransfer -> 10 tokens
      '5': 10,      // QR Codes -> 10 tokens (changé de 100 à 10)
      '7': 100,     // Stable Diffusion -> 100 tokens
      '8': 100,     // Ruined Fooocus -> 100 tokens
      '10': 100,    // ComfyUI -> 100 tokens
      '11': 10,     // Cog Studio -> 10 tokens (changé de 100 à 10)
    };
    
    return moduleCosts[moduleId] || 10; // Par défaut 10 tokens
  };

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setRefreshing(true);
    
    // Recharger les modules depuis user_applications sans jointure
    const { data: userModulesData, error: modulesError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        access_level,
        expires_at,
        is_active,
        created_at,
        usage_count,
        max_usage
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Récupérer les informations des modules séparément pour le refresh
    let refreshModulesData: any[] = [];
    if (userModulesData && userModulesData.length > 0) {
      const moduleIds = userModulesData.map(access => access.module_id).filter(Boolean);
      if (moduleIds.length > 0) {
        const { data: refreshModules } = await supabase
          .from('modules')
          .select(`
            id,
            title,
            description,
            category,
            url,
            price
          `)
          .in('id', moduleIds);
        
        refreshModulesData = refreshModules || [];
      }
    }

    if (!modulesError) {
      // Transformer les modules user_applications
      const transformedModules: UserModule[] = (userModulesData || [])
        .filter(access => {
          if (!access.expires_at) return true;
          return new Date(access.expires_at) > new Date();
        })
        .map(access => {
          const moduleInfo = refreshModulesData.find(module => module.id.toString() === access.module_id?.toString()) || {};
          const isFree = moduleInfo.price === 0 || moduleInfo.price === '0' || moduleInfo.price === null;
          
          return {
            id: access.id,
            module_id: access.module_id,
            module_title: access.module_title || moduleInfo.title || `Module ${access.module_id}`,
            module_description: moduleInfo.description || 'Module activé via souscription',
            module_category: 'Module activé',
            module_url: moduleInfo.url || '',
            access_type: (access.access_level || 'basic').replace(/premium\d+/, 'premium'),
            expires_at: access.expires_at,
            is_active: access.is_active,
            created_at: access.created_at,
            current_usage: access.usage_count || 0,
            max_usage: access.max_usage || undefined,
            user_id: access.user_id,
            created_by: access.user_id,
            price: moduleInfo.price || 0,
            is_free: isFree
          };
        });

      // Utiliser seulement les modules transformés
      const allModules = transformedModules;
      setUserModules(allModules);
    }
    setRefreshing(false);
  };

  // Fonctions utilitaires
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatTimeRemaining = (endDate: string) => {
    const days = getDaysRemaining(endDate);
    if (days < 0) return 'Expiré';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    if (days < 7) return `Expire dans ${days} jours`;
    if (days < 30) return `Expire dans ${Math.floor(days / 7)} semaines`;
    return `Expire dans ${Math.floor(days / 30)} mois`;
  };

  const getTimeRemainingColor = (endDate: string) => {
    const days = getDaysRemaining(endDate);
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageColor = (current: number, max: number) => {
    const percentage = max ? (current / max) * 100 : 0;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getModuleTypeColor = (module: UserModule) => {
    // QR Codes Statiques - couleur verte spéciale
    if (module.module_id === 'qrcodes-statiques' || module.module_title.toLowerCase().includes('qrcodes-statiques')) {
      return 'from-green-500 to-green-600';
    }
    if (module.is_free) {
      return 'from-green-600 to-emerald-600';
    }
    return 'from-blue-600 to-indigo-600';
  };

  const getModuleTypeIcon = (module: UserModule) => {
    if (module.is_free) {
      return '🆓';
    }
    return '🤖';
  };

  const getModuleTypeLabel = (module: UserModule) => {
    // QR Codes Statiques - appli essentielle spéciale
    if (module.module_id === 'qrcodes-statiques' || module.module_title.toLowerCase().includes('qrcodes-statiques')) {
      return 'Appli essentielle 🆓';
    }
    
    // Pour les modules essentiels, afficher "Module essentiel"
    const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes', 'qrcodes-statiques'];
    const isEssential = essentialModules.some(essentialId => 
      module.module_id === essentialId || 
      module.module_title.toLowerCase().includes(essentialId.toLowerCase()) ||
      module.module_title.toLowerCase().includes(essentialId.replace('-', ' '))
    );
    
    if (isEssential) {
      return 'Module essentiel ✅';
    }
    
    // Pour les autres modules, afficher "Module IA"
    return 'Module IA 🤖';
  };

  // Contrôles d'accès
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à vos applications.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Mes Applications</h1>
              <p className="text-gray-600">Gérez vos modules souscrits et accédez à vos applications</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualisation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </>
              )}
            </button>
          </div>
        </div>

        {/* Affichage des erreurs de token */}
        {tokenError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur d'accès à LibreSpeed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{tokenError}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setTokenError(null)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={refreshData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : userModules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">📱</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Aucune application activée</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Vous n'avez pas encore souscrit à des applications. Découvrez notre collection de nos modules essentiels et applis IA et commencez à explorer !
            </p>
            <Link 
              href="/modules" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Découvrir nos modules
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques améliorées */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Résumé de vos applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userModules.length}</div>
                  <div className="text-sm text-gray-600">Total actifs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userModules.filter(m => m.is_free).length}
                  </div>
                  <div className="text-sm text-gray-600">Mes applis essentielles</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userModules.filter(m => !m.is_free).length}
                  </div>
                  <div className="text-sm text-gray-600">Modules IA</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userModules.filter(m => m.expires_at && new Date(m.expires_at) > new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès temporaires</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {userModules.filter(m => m.expires_at && new Date(m.expires_at) <= new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès expirés</div>
                </div>
              </div>
            </div>

            {/* Section Tokens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🪙 Mes Tokens</h2>
                <button
                  onClick={fetchTokenData}
                  disabled={loadingTokens}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {loadingTokens ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solde de tokens */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Solde disponible</h3>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{tokenBalance}</p>
                      <p className="text-xs text-gray-500 mt-1">tokens restants</p>
                    </div>
                    <div className="text-4xl">🪙</div>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href="/pricing" 
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Acheter des tokens
                    </Link>
                  </div>
                </div>

              </div>

              {/* Historique d'utilisation */}
              {tokenHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">📊 Dernières utilisations</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {tokenHistory.slice(0, 10).map((usage, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">
                              {new Date(usage.usage_date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="text-gray-700">
                              {usage.module_name} - {usage.action_type || 'action'}
                            </span>
                          </div>
                          <span className="font-semibold text-red-600">
                            -{usage.tokens_consumed} token{usage.tokens_consumed > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grille des modules améliorée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModules.map((module) => {
                const isExpired = !!(module.expires_at && new Date(module.expires_at) <= new Date());
                const isExpiringSoon = module.expires_at && getDaysRemaining(module.expires_at) <= 7;
                                 const maxUsage = module.max_usage || 20;
                const isQuotaExceeded = (module.current_usage || 0) >= maxUsage;
                
                return (
                  <div key={module.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                    isExpired 
                      ? 'border-red-300 bg-red-50' 
                      : isExpiringSoon
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    
                    {/* En-tête de la carte avec titre en haut */}
                    <div className={`p-6 text-white bg-gradient-to-r ${getModuleTypeColor(module)}`}>
                      {/* Titre du module en haut, entièrement visible */}
                      <h3 className="text-xl font-bold mb-4 break-words leading-tight">
                        {module.module_title}
                      </h3>
                      
                      {/* Badges et informations */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {/* Badge pour le type de module */}
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                            {getModuleTypeIcon(module)} {getModuleTypeLabel(module)}
                          </span>
                          {module.expires_at && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isExpired 
                                ? 'bg-red-500 text-white' 
                                : isExpiringSoon
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-white/20 text-white'
                            }`}>
                              {formatTimeRemaining(module.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm opacity-90">
                        {/* Ne pas afficher "Appli essentielle" pour les modules IA et QR codes */}
                        {module.price && Number(module.price) > 0 && (
                          <span>🪙 {module.price} tokens</span>
                        )}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6">
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {module.module_description}
                      </p>

                      {/* Informations d'utilisation pour tous les modules (affichage uniquement) */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Utilisations : {module.current_usage || 0}</span>
                        </div>
                      </div>

                      {/* Informations de date */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Créé le :</span>
                          <span className="text-gray-700">{formatDate(module.created_at)}</span>
                        </div>
                        {module.expires_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Expire le :</span>
                            <span className={`font-medium ${getTimeRemainingColor(module.expires_at)}`}>
                              {formatDate(module.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bouton d'accès */}
                      {(() => {
                        const moduleId = module.module_id;
                        const moduleTitle = module.module_title;
                        
                        // Applications IA (100 tokens)
                        if (['whisper', 'stablediffusion', 'ruinedfooocus', 'comfyui'].includes(moduleId)) {
                          return (
                            <AIAccessButton
                              user={user}
                              moduleId={moduleId}
                              moduleTitle={moduleTitle}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // L'ouverture de l'onglet est gérée par le composant lui-même
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // Applications essentielles (10 tokens)
                        if (['librespeed', 'metube', 'psitransfer', 'qrcodes', 'pdf', 'meeting-reports', 'cogstudio'].includes(moduleId)) {
                          return (
                            <EssentialAccessButton
                              user={user}
                              moduleId={moduleId}
                              moduleTitle={moduleTitle}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // L'ouverture de l'onglet est gérée par le composant lui-même
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // Fallback pour les autres modules
                        return (
                          <ModuleAccessButton
                            user={user}
                            moduleId={module.module_id}
                            moduleName={module.module_title}
                            moduleUrl={getModuleUrl(module.module_id) || ''}
                            moduleCost={getModuleCost(module.module_id)}
                            onAccessGranted={(url) => {
                              console.log(`🔗 ${module.module_title}: Accès autorisé:`, url);
                              // L'ouverture de l'onglet est gérée par le composant lui-même
                            }}
                            onAccessDenied={(reason) => {
                              console.log(`❌ ${module.module_title}: Accès refusé:`, reason);
                              alert(`Accès refusé: ${reason}`);
                            }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
                className="w-full h-full border-0 rounded"
                title={iframeModal.title}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 