'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Header from '../../components/Header';
import AuthorizedAccessButton from '../../components/AuthorizedAccessButton';

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
      async (event, session) => {
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
        
        // Transformer les modules user_applications
        const transformedModules: UserModule[] = (moduleAccessData || [])
          .filter(access => {
            // Vérifier que l'accès est valide
            if (!access || typeof access !== 'object') {
              console.error('Accès invalide:', access);
              return false;
            }
            if (!access.id) {
              return false;
            }
            // Filtrer les accès non expirés
            if (!access.expires_at) return true;
            try {
              return new Date(access.expires_at) > new Date();
            } catch (error) {
              return true; // Garder par défaut si erreur de date
            }
          })
          .map(access => {
            try {
              // Trouver les informations du module correspondant
              const moduleInfo = modulesData.find(module => module.id.toString() === access.module_id?.toString()) || {};
              const isFree = moduleInfo.price === 0 || moduleInfo.price === '0' || moduleInfo.price === null;
              
              return {
                id: access.id || 'unknown',
                module_id: access.module_id || 'unknown',
                module_title: access.module_title || moduleInfo.title || `Module ${access.module_id || 'unknown'}`,
                module_description: moduleInfo.description || 'Module activé via souscription',
                module_category: 'Module activé',
                module_url: moduleInfo.url || '',
                access_type: access.access_level || 'basic',
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
            } catch (error) {
              return null;
            }
          })
          .filter(Boolean) as UserModule[];

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
                access_type: `Token (${token.access_level || 'standard'})`,
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

  // Mapping des modules vers leurs URLs directes
  const getModuleUrl = (moduleId: string): string => {
    const moduleUrls: { [key: string]: string } = {
      'metube': 'https://metube.iahome.fr',
      'librespeed': 'https://librespeed.iahome.fr',
      'pdf': 'https://pdf.iahome.fr',
      'psitransfer': 'https://psitransfer.iahome.fr',
      'qrcodes': 'https://qrcodes.iahome.fr',
      'stablediffusion': 'https://stablediffusion.iahome.fr',
      'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
      'invoke': 'https://invoke.iahome.fr',
      'comfyui': 'https://comfyui.iahome.fr',
      'cogstudio': 'https://cogstudio.iahome.fr',
      'sdnext': 'https://sdnext.iahome.fr',
      'blender-3d': '/blender-3d' // URL interne pour le module Blender 3D
    };
    
    return moduleUrls[moduleId] || '';
  };

  // Fonction pour accéder à un module
  const accessModule = async (module: UserModule) => {
    console.log('🚀 Accès au module:', module.module_title);
    
    // Démarrer l'indicateur de traitement
    setProcessingModule(module.module_id);
    
    try {
      console.log('🚀 Accès au module:', module.module_title);
      console.log('👤 Utilisateur:', user?.email);
      console.log('🔍 DEBUG: Début de accessModule');
      console.log('🔍 DEBUG: Module:', module);
      console.log('🔍 DEBUG: User:', user);

      // Si c'est LibreSpeed, générer un token temporaire avant l'accès
      if (module.module_id === 'librespeed' || module.module_title.toLowerCase().includes('librespeed')) {
        console.log('🔐 Génération d\'un token temporaire pour LibreSpeed...');
        
        try {
          // Générer un token temporaire côté client (approche simplifiée)
          const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
          
          console.log('✅ Token généré côté client:', token);
          
          // Rediriger vers LibreSpeed avec le token
          const librespeedUrl = `https://librespeed.iahome.fr?token=${token}`;
          window.open(librespeedUrl, '_blank');
          return;
        } catch (tokenError) {
          console.error('❌ Erreur lors de la génération du token:', tokenError);
          alert('Erreur lors de l\'accès à LibreSpeed. Veuillez réessayer.');
          return;
        }
      }
      
      // TEST DIAGNOSTIC - Appel API simple pour vérifier que le code s'exécute
      try {
        console.log('🔍 DEBUG: Test diagnostic - appel API...');
        const testResponse = await fetch('/api/test-real-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user?.email || 'test@test.com',
            appName: 'Test Diagnostic Client',
            userName: user?.name || user?.email || 'Testeur'
          })
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          console.log('🔍 DEBUG: Test diagnostic réussi:', testResult);
        } else {
          console.log('🔍 DEBUG: Test diagnostic échoué:', testResponse.status);
        }
      } catch (testError) {
        console.log('🔍 DEBUG: Erreur test diagnostic:', testError);
      }
      
      // Envoyer une notification d'accès à l'application
      if (user?.email) {
        try {
          console.log('📧 Tentative d\'envoi de notification...');
          console.log('🔍 DEBUG: Email utilisateur trouvé:', user.email);
          
          // Import statique pour éviter les problèmes d'import dynamique
          const { NotificationService } = await import('../../utils/notificationService');
          const notificationService = NotificationService.getInstance();
          
          console.log('✅ Service de notification chargé');
          console.log('🔍 DEBUG: Service de notification initialisé');
          
          const result = await notificationService.notifyAppAccessed(
            user.email,
            module.module_title,
            user.name || user.email
          );
          
          console.log('📧 Résultat de la notification:', result);
          console.log('🔍 DEBUG: Résultat détaillé:', result);
          
          if (result) {
            console.log('✅ Notification envoyée avec succès');
            console.log('🔍 DEBUG: Notification réussie');
          } else {
            console.log('❌ Échec de l\'envoi de la notification');
            console.log('🔍 DEBUG: Notification échouée');
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi de la notification:', error);
          console.log('🔍 DEBUG: Erreur détaillée:', error);
        }
      } else {
        console.log('⚠️ Pas d\'email utilisateur disponible pour la notification');
        console.log('🔍 DEBUG: Email utilisateur manquant');
      }

      // Vérifier si c'est un token d'accès
      if (module.module_category === 'Token d\'accès') {
        // Pour les tokens, rediriger vers la page du module associé
        if (module.module_id && module.module_id !== 'unknown') {
          router.push(`/card/${module.module_id}`);
        } else {
          alert('Ce token d\'accès n\'est pas associé à un module spécifique');
        }
        return;
      }
      
      // Incrémenter le compteur d'utilisation pour les modules activés
      if (module.module_category === 'Module activé' && user?.id) {
        try {
          const response = await fetch('/api/increment-usage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              moduleId: module.module_id
            })
          });

          if (response.ok) {
            const result = await response.json();
            // Rafraîchir les données pour afficher le nouveau compteur
            await refreshData();
          } else {
            }
        } catch (error) {
          }
      }
      
      // Obtenir l'URL directe du module
      const moduleUrl = getModuleUrl(module.module_id);
      
      if (moduleUrl) {
        // Liste des modules qui doivent s'ouvrir en iframe
        const iframeModules = ['metube', 'psitransfer', 'librespeed', 'pdf'];
        
        if (iframeModules.includes(module.module_id)) {
          // Ouvrir en iframe
          setIframeModal({
            isOpen: true,
            url: moduleUrl,
            title: module.module_title
          });
        } else if (moduleUrl.startsWith('/')) {
          // URL interne - utiliser router.push
          router.push(moduleUrl);
        } else {
          // URL externe - ouvrir dans un nouvel onglet
          window.open(moduleUrl, '_blank');
        }
      } else {
        // Si pas d'URL directe, rediriger vers la page du module
        router.push(`/card/${module.module_id}`);
      }
    } catch (error) {
      alert('Erreur lors de l\'accès au module');
    } finally {
      // Arrêter l'indicateur de traitement
      setProcessingModule(null);
    }
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
            access_type: access.access_level,
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
            access_type: `Token (${token.access_level})`,
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
    return '💎';
  };

  const getModuleTypeLabel = (module: UserModule) => {
    if (module.module_category === 'Token d\'accès') {
      return 'Token d\'accès';
    }
    if (module.is_free) {
      return 'Module gratuit';
    }
    return 'Module premium';
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
                  <div className="text-sm text-gray-600">Modules premium</div>
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
                        <span>📱 {module.module_category}</span>
                        <span>🔑 {module.access_type}</span>
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
                      <AuthorizedAccessButton
                        moduleId={module.module_id}
                        moduleTitle={module.module_title}
                        moduleUrl={getModuleUrl(module.module_id)}
                        className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                        disabled={isExpired || isQuotaExceeded}
                        onAccessGranted={(url) => {
                          // Envoyer une notification d'accès à l'application
                          try {
                            const { NotificationService } = require('../../utils/notificationService');
                            const notificationService = NotificationService.getInstance();
                            notificationService.notifyAppAccessed(
                              user?.email || '',
                              module.module_title,
                              user?.name || user?.email || 'Utilisateur'
                            );
                            console.log('✅ Notification d\'accès à l\'application envoyée');
                          } catch (notificationError) {
                            console.error('❌ Erreur lors de l\'envoi de la notification:', notificationError);
                          }
                          
                          // La navigation est maintenant gérée par AuthorizedAccessButton
                          // Pas besoin de faire window.open() ou router.push() ici
                        }}
                        onAccessDenied={(reason) => {
                          console.log('❌ Accès refusé:', reason);
                          alert(`Accès refusé: ${reason}`);
                        }}
                      >
                        <span className="text-xl mr-2">
                          {isExpired ? '⏰' : 
                           isQuotaExceeded ? '⚠️' : '🚀'}
                        </span>
                        {isExpired ? 'Module expiré' :
                         isQuotaExceeded ? 'Quota épuisé' :
                         'Accéder à l\'application'}
                      </AuthorizedAccessButton>
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