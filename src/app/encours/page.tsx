'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Header from '../../components/Header';
import LibreSpeedAccessButton from '../../components/LibreSpeedAccessButton';
import MeTubeAccessButton from '../../components/MeTubeAccessButton';
import ModuleAccessButton from '../../components/ModuleAccessButton';

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
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
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

  // Vérification de la session et des erreurs de token
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setSessionChecked(true);
        } catch (error) {
        setSessionChecked(true);
      }
    };

    // Vérifier s'il y a des erreurs de token dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
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
        default:
          setTokenError('Erreur d\'accès à LibreSpeed. Veuillez réessayer.');
      }
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
        setSessionChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole('user');
        }
        } catch (error) {
        setRole('user');
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

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

        // Récupérer les tokens d'accès créés manuellement pour cet utilisateur
        let accessTokensData: any[] | null = null;
        let tokensError: any = null;
        
        try {
          const result = await supabase
            .from('access_tokens')
            .select(`
              id,
              name,
              description,
              module_id,
              module_name,
              access_level,
              permissions,
              max_usage,
              current_usage,
              is_active,
              created_by,
              created_at,
              expires_at
            `)
            .eq('created_by', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          accessTokensData = result.data;
          tokensError = result.error;
        } catch (error) {
          tokensError = error;
        }

        if (tokensError) {
          const errorMessage = tokensError.message || tokensError.details || tokensError.hint || JSON.stringify(tokensError) || 'Erreur inconnue';
          }

        // Vérifier que les données sont valides
        if (!moduleAccessData) {
          moduleAccessData = []; // Initialiser avec un tableau vide
        }
        if (!accessTokensData) {
          accessTokensData = []; // Initialiser avec un tableau vide
        }
        
        // S'assurer que les données sont des tableaux
        if (!Array.isArray(moduleAccessData)) {
          moduleAccessData = [];
        }
        if (!Array.isArray(accessTokensData)) {
          accessTokensData = [];
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

        // Transformer les tokens d'accès en modules
        const transformedTokens: UserModule[] = (accessTokensData || [])
          .filter(token => {
            // Vérifier que le token est valide
            if (!token || typeof token !== 'object') {
              console.error('Token invalide:', token);
              return false;
            }
            if (!token.id) {
              return false;
            }
            // Filtrer les tokens non expirés
            if (!token.expires_at) return true;
            try {
              return new Date(token.expires_at) > new Date();
            } catch (error) {
              return true; // Garder par défaut si erreur de date
            }
          })
          .map(token => {
            try {
              // Essayer de trouver le module correspondant par nom
              let moduleInfo: any = {};
              let moduleId = 'unknown';
              
              if (token.module_name) {
                // Chercher le module par nom dans les modules récupérés
                const matchingModule = modulesData.find(module => 
                  module.title.toLowerCase().includes(token.module_name.toLowerCase()) ||
                  token.module_name.toLowerCase().includes(module.title.toLowerCase())
                );
                
                if (matchingModule) {
                  moduleInfo = matchingModule;
                  moduleId = matchingModule.id;
                }
              }
              
              return {
                id: `token-${token.id || 'unknown'}`,
                module_id: moduleId,
                module_title: token.name || token.module_name || `Token ${token.id || 'unknown'}`,
                module_description: token.description || 'Accès via token créé par l\'admin',
                module_category: 'Token d\'accès',
                module_url: moduleInfo.url || '', // Utiliser l'URL du module si trouvé
                access_type: `Token (${(token.access_level || 'standard').replace(/premium\d+/, 'premium')})`,
                expires_at: token.expires_at || null,
                is_active: token.is_active !== undefined ? token.is_active : true,
                created_at: token.created_at || new Date().toISOString(),
                current_usage: token.current_usage || 0,
                max_usage: token.max_usage || null,
                user_id: token.created_by, // Utiliser created_by comme user_id
                created_by: token.created_by,
                price: moduleInfo.price || 0, // Utiliser le prix du module si trouvé
                is_free: moduleInfo.price === 0 || moduleInfo.price === '0' || !moduleInfo.price
              };
            } catch (error) {
              return null;
            }
          })
          .filter(Boolean) as UserModule[];

        // Combiner les deux listes
        const allModules = [...transformedModules, ...transformedTokens];
        
        setUserModules(allModules);
        setError(null);
        
      } catch (error) {
        setError(`Erreur lors du chargement des modules: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        setUserModules([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && sessionChecked) {
      fetchUserModules();
    }
  }, [user, sessionChecked]);

  // Mapping des modules vers leurs URLs directes (sécurisées via tokens)
  const getModuleUrl = (moduleId: string): string => {
    // Mapping des module_id (numériques) vers les slugs
    const moduleIdMapping: { [key: string]: string } = {
      '1': 'pdf',      // PDF+ -> pdf
      '2': 'metube',   // MeTube -> metube
      '3': 'librespeed', // LibreSpeed -> librespeed
      '4': 'psitransfer', // PsiTransfer -> psitransfer
      '5': 'qrcodes',  // QR Codes -> qrcodes
      '6': 'converter', // Universal Converter -> converter
      '7': 'stablediffusion', // Stable Diffusion -> stablediffusion
      '8': 'ruinedfooocus', // Ruined Fooocus -> ruinedfooocus
      '9': 'invoke',   // Invoke AI -> invoke
      '10': 'comfyui', // ComfyUI -> comfyui
      '11': 'cogstudio', // Cog Studio -> cogstudio
      '12': 'sdnext',  // SD.Next -> sdnext
    };

    // Mapping des slugs vers les URLs directes (sécurisées via tokens)
    const directUrls: { [key: string]: string } = {
      'metube': 'https://metube.iahome.fr',  // MeTube direct avec token
      'librespeed': 'https://librespeed.iahome.fr',  // LibreSpeed direct avec token
      'pdf': 'https://pdf.iahome.fr',  // PDF direct avec token
      'psitransfer': 'https://psitransfer.iahome.fr',  // PsiTransfer direct avec token
      'qrcodes': 'https://qrcodes.iahome.fr',  // QR Codes direct avec token
      'converter': 'https://convert.iahome.fr',  // Converter direct avec token
      'whisper': 'https://whisper.iahome.fr',  // Whisper direct avec token
      'stablediffusion': 'https://stablediffusion.iahome.fr',  // StableDiffusion direct avec token
      'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',  // RuinedFooocus direct avec token
      'invoke': 'https://invoke.iahome.fr',  // Invoke direct avec token
      'comfyui': 'https://comfyui.iahome.fr',  // ComfyUI direct avec token
      'cogstudio': 'https://cogstudio.iahome.fr',  // CogStudio direct avec token
      'sdnext': 'https://sdnext.iahome.fr',  // SDNext direct avec token
    };
    
    // Convertir module_id numérique en slug si nécessaire
    const slug = moduleIdMapping[moduleId] || moduleId;
    const url = directUrls[slug] || '';
    
    console.log(`🔗 getModuleUrl: ${moduleId} -> ${slug} -> ${url}`);
    return url;
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

    // Recharger les tokens d'accès
    const { data: accessTokensData, error: tokensError } = await supabase
      .from('access_tokens')
      .select(`
        id,
        name,
        description,
        module_id,
        module_name,
        access_level,
        permissions,
        max_usage,
        current_usage,
        is_active,
        created_by,
        created_at,
        expires_at
      `)
      .eq('created_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!modulesError && !tokensError) {
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

      // Transformer les tokens d'accès
      const transformedTokens: UserModule[] = (accessTokensData || [])
        .filter(token => {
          if (!token.expires_at) return true;
          return new Date(token.expires_at) > new Date();
        })
        .map(token => {
          // Essayer de trouver le module correspondant par nom
          let moduleInfo: any = {};
          let moduleId = 'unknown';
          
          if (token.module_name) {
            // Chercher le module par nom dans les modules récupérés
            const matchingModule = refreshModulesData.find(module => 
              module.title.toLowerCase().includes(token.module_name.toLowerCase()) ||
              token.module_name.toLowerCase().includes(module.title.toLowerCase())
            );
            
            if (matchingModule) {
              moduleInfo = matchingModule;
              moduleId = matchingModule.id;
            }
          }
          
          return {
            id: `token-${token.id}`,
            module_id: moduleId,
            module_title: token.name || token.module_name || `Token ${token.id}`,
            module_description: token.description || 'Accès via token créé par l\'admin',
            module_category: 'Token d\'accès',
            module_url: moduleInfo.url || '',
            access_type: `Token (${(token.access_level || 'standard').replace(/premium\d+/, 'premium')})`,
            expires_at: token.expires_at,
            is_active: token.is_active,
            created_at: token.created_at,
            current_usage: token.current_usage || 0,
            max_usage: token.max_usage || null,
            user_id: token.created_by, // Utiliser created_by comme user_id
            created_by: token.created_by,
            price: moduleInfo.price || 0,
            is_free: moduleInfo.price === 0 || moduleInfo.price === '0' || !moduleInfo.price
          };
        });

      // Combiner les deux listes
      const allModules = [...transformedModules, ...transformedTokens];
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
    if (module.module_category === 'Token d\'accès') {
      return 'from-purple-600 to-pink-600';
    }
    if (module.is_free) {
      return 'from-green-600 to-emerald-600';
    }
    return 'from-blue-600 to-indigo-600';
  };

  const getModuleTypeIcon = (module: UserModule) => {
    if (module.module_category === 'Token d\'accès') {
      return '🔑';
    }
    if (module.is_free) {
      return '🆓';
    }
    return '🤖';
  };

  const getModuleTypeLabel = (module: UserModule) => {
    if (module.module_category === 'Token d\'accès') {
      return 'Token d\'accès';
    }
    
    // Pour les modules essentiels, afficher "Module essentiel"
    const essentialModules = ['metube', 'psitransfer', 'universal-converter', 'pdf', 'librespeed', 'qrcodes'];
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
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification de la session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      {/* Cache buster: {cacheBuster} */}
            <div className="bg-red-500 text-white p-4 text-center font-bold">
              🔄 VERSION MISE À JOUR - {new Date().toLocaleString()} - Cache buster: {cacheBuster} - URLs CORRIGÉES
              <br />
              <a href="/force-refresh" className="underline text-yellow-200 hover:text-white">
                🚨 PROBLÈME DE CACHE ? Cliquez ici pour forcer le refresh
              </a>
            </div>
      <Header />
      
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
              Vous n'avez pas encore souscrit à des modules. Découvrez notre collection d'applications IA et commencez à explorer !
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
                  <div className="text-sm text-gray-600">Modules gratuits</div>
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
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {userModules.filter(m => m.module_category === 'Token d\'accès').length}
                  </div>
                  <div className="text-sm text-gray-600">Tokens d'accès</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {userModules.filter(m => m.expires_at && new Date(m.expires_at) <= new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès expirés</div>
                </div>
              </div>
            </div>

            {/* Section Tokens Premium avec statistiques détaillées */}
            {userModules.filter(m => m.module_category === 'Token d\'accès' && m.access_type.includes('premium')).length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔑</span>
                  Tokens Premium - Statistiques détaillées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userModules
                    .filter(m => m.module_category === 'Token d\'accès' && m.access_type.includes('premium'))
                    .map((token) => {
                      const usagePercentage = token.max_usage ? ((token.current_usage || 0) / token.max_usage) * 100 : 0;
                      const remainingUsage = token.max_usage ? token.max_usage - (token.current_usage || 0) : 0;
                      const isQuotaExceeded = token.max_usage ? (token.current_usage || 0) >= token.max_usage : false;
                      
                      return (
                        <div key={token.id} className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-purple-900 text-sm truncate">
                              {token.module_title.replace('Premium ', '').replace(` - ${user?.email}`, '')}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                              PREMIUM
                            </span>
                          </div>
                          
                          {/* Barre de progression des utilisations */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Utilisations</span>
                              <span>{token.current_usage}/{token.max_usage}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isQuotaExceeded ? 'bg-red-500' :
                                  usagePercentage > 80 ? 'bg-red-500' : 
                                  usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Statistiques */}
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Restantes:</span>
                              <span className={`font-semibold ${isQuotaExceeded ? 'text-red-600' : 'text-purple-700'}`}>
                                {isQuotaExceeded ? 'Quota épuisé' : remainingUsage}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expire:</span>
                              <span className="font-semibold text-purple-700">
                                {token.expires_at ? formatTimeRemaining(token.expires_at) : 'Permanent'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Créé:</span>
                              <span className="font-semibold text-purple-700">
                                {formatDate(token.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

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
                        <span>🔑 Module gratuit</span>
                        {module.price && Number(module.price) > 0 && (
                          <span>💎 €{module.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6">
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {module.module_description}
                      </p>

                      {/* Informations d'utilisation pour tous les modules */}
                      {(module.max_usage || module.is_free) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                     <div className="flex justify-between text-sm text-gray-600 mb-2">
                             <span>Utilisations : {module.current_usage || 0} / {maxUsage}</span>
                             <span>{Math.round(((module.current_usage || 0) / maxUsage) * 100)}%</span>
                           </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                                                         <div 
                               className={`h-2 rounded-full transition-all duration-500 ${
                                 isQuotaExceeded ? 'bg-red-500' :
                                 getUsageColor(module.current_usage || 0, maxUsage).includes('red') ? 'bg-red-500' :
                                 getUsageColor(module.current_usage || 0, maxUsage).includes('orange') ? 'bg-orange-500' :
                                 getUsageColor(module.current_usage || 0, maxUsage).includes('yellow') ? 'bg-yellow-500' :
                                 'bg-green-500'
                               }`}
                               style={{ width: `${Math.min(((module.current_usage || 0) / maxUsage) * 100, 100)}%` }}
                             ></div>
                          </div>
                          {isQuotaExceeded && (
                            <p className="text-red-600 text-xs mt-2 font-semibold">
                              ⚠️ Quota épuisé
                            </p>
                          )}
                                                     {!isQuotaExceeded && (
                             <p className="text-blue-600 text-xs mt-2 font-semibold">
                               📊 Quota : {maxUsage} utilisations maximum
                             </p>
                           )}
                        </div>
                      )}

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
                      {module.module_title === 'LibreSpeed' ? (
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={async () => {
                              console.log('🚀 LibreSpeed: Clic sur le bouton d\'accès');
                              
                              if (!user) {
                                console.log('❌ LibreSpeed: Utilisateur non connecté - redirection vers login');
                                window.location.href = 'https://iahome.fr/login';
                                return;
                              }
                              
                              try {
                                // ÉTAPE 1: Vérifier l'autorisation d'accès
                                console.log('🔐 LibreSpeed: ÉTAPE 1 - Vérification de l\'autorisation...');
                                const accessResponse = await fetch('/api/check-librespeed-access', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: user.id
                                  })
                                });
                                
                                if (!accessResponse.ok) {
                                  console.log('❌ LibreSpeed: ÉTAPE 1 ÉCHEC - Pas d\'autorisation');
                                  window.location.href = 'https://iahome.fr/login';
                                  return;
                                }
                                
                                const accessData = await accessResponse.json();
                                if (!accessData.hasAccess) {
                                  console.log('❌ LibreSpeed: ÉTAPE 1 ÉCHEC - Accès refusé');
                                  window.location.href = 'https://iahome.fr/login';
                                  return;
                                }
                                
                                console.log('✅ LibreSpeed: ÉTAPE 1 RÉUSSIE - Autorisation confirmée');
                                
                                // ÉTAPE 2: Incrémenter le compteur d'usage
                                console.log('📊 LibreSpeed: ÉTAPE 2 - Incrémentation du compteur...');
                                const incrementResponse = await fetch('/api/increment-librespeed-access', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: user.id,
                                    userEmail: user.email
                                  })
                                });
                                
                                if (incrementResponse.ok) {
                                  const incrementData = await incrementResponse.json();
                                  console.log('✅ LibreSpeed: ÉTAPE 2 RÉUSSIE - Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
                                } else {
                                  const errorData = await incrementResponse.json().catch(() => ({}));
                                  if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
                                    console.log('❌ LibreSpeed: ÉTAPE 2 ÉCHEC - Quota dépassé');
                                    alert('Quota d\'utilisation dépassé. Contactez l\'administrateur.');
                                    return;
                                  }
                                  console.log('⚠️ LibreSpeed: ÉTAPE 2 WARNING - Erreur compteur, continuons...');
                                }
                                
                                // ÉTAPE 3: Générer un token d'accès
                                console.log('🔑 LibreSpeed: ÉTAPE 3 - Génération du token d\'accès...');
                                const tokenResponse = await fetch('/api/librespeed-token', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: user.id,
                                    userEmail: user.email
                                  })
                                });
                                
                                if (!tokenResponse.ok) {
                                  console.log('❌ LibreSpeed: ÉTAPE 3 ÉCHEC - Erreur génération token');
                                  window.location.href = 'https://iahome.fr/login';
                                  return;
                                }
                                
                                const tokenData = await tokenResponse.json();
                                console.log('✅ LibreSpeed: ÉTAPE 3 RÉUSSIE - Token généré:', tokenData.token ? tokenData.token.substring(0, 10) + '...' : 'N/A');
                                
                                // ÉTAPE 4: Ouvrir LibreSpeed avec le token
                                console.log('🔗 LibreSpeed: ÉTAPE 4 - Ouverture de LibreSpeed avec token...');
                                const librespeedUrl = `https://librespeed.iahome.fr?token=${tokenData.token}`;
                                console.log('✅ LibreSpeed: ÉTAPE 4 RÉUSSIE - URL finale:', librespeedUrl);
                                window.open(librespeedUrl, '_blank');
                                
                              } catch (error) {
                                console.error('❌ LibreSpeed: ERREUR GÉNÉRALE:', error);
                                alert('Erreur lors de l\'accès à LibreSpeed. Veuillez réessayer.');
                              }
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                          >
                            🚀 Accéder à LibreSpeed
                          </button>
                        </div>
                      ) : module.module_title === 'MeTube' ? (
                        <MeTubeAccessButton
                          user={user}
                          onAccessGranted={(url) => {
                            console.log('🔗 MeTube: Accès autorisé:', url);
                            window.open(url, '_blank');
                          }}
                          onAccessDenied={(reason) => {
                            console.log('❌ MeTube: Accès refusé:', reason);
                            alert(`Accès refusé: ${reason}`);
                          }}
                        />
                      ) : (
                        <ModuleAccessButton
                          user={user}
                          moduleId={module.module_id}
                          moduleTitle={module.module_title}
                          moduleUrl={getModuleUrl(module.module_id) || ''}
                          onAccessGranted={(url) => {
                            console.log(`🔗 ${module.module_title}: Accès autorisé (NOUVEAU CODE):`, url);
                            window.open(url, '_blank');
                          }}
                          onAccessDenied={(reason) => {
                            console.log(`❌ ${module.module_title}: Accès refusé:`, reason);
                            alert(`Accès refusé: ${reason}`);
                          }}
                        />
                      )}
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