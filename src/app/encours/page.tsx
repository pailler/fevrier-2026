'use client';
import { useEffect, useState, useCallback } from "react";
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
  // Extraire les valeurs de useCustomAuth de manière stable - TOUJOURS appeler ce hook en premier
  const authHookResult = useCustomAuth();
  // Extraire les valeurs immédiatement pour éviter les problèmes de référence
  const user = authHookResult?.user ?? null;
  const isAuthenticated = authHookResult?.isAuthenticated ?? false;
  const authLoading = authHookResult?.loading ?? true;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Vérification de l'authentification avec timeout de sécurité
  useEffect(() => {
    // JAMAIS de return conditionnel - toujours exécuter et retourner à la fin
    let timeout: NodeJS.Timeout | null = null;
    let timer: NodeJS.Timeout | null = null;
    
    // Vérifier que nous sommes côté client avant d'exécuter
    if (typeof window !== 'undefined') {
      if (authLoading) {
        // Timeout de sécurité pour éviter un chargement infini
        timeout = setTimeout(() => {
          console.warn('⚠️ Authentification prend trop de temps, arrêt du chargement');
          setLoading(false);
        }, 10000); // 10 secondes max
      } else if (!authLoading) {
        // Ajouter un délai pour s'assurer que l'authentification est bien chargée
        timer = setTimeout(() => {
          if (!isAuthenticated || !user) {
            console.log('❌ Utilisateur non authentifié, redirection vers /login');
            try {
              if (router && typeof router.push === 'function') {
                try {
                  router.push('/login?redirect=' + encodeURIComponent('/encours'));
                } catch (err) {
                  console.error('❌ Erreur router.push:', err);
                  if (typeof window !== 'undefined') {
                    window.location.href = '/login?redirect=' + encodeURIComponent('/encours');
                  }
                }
              } else {
                if (typeof window !== 'undefined') {
                  window.location.href = '/login?redirect=' + encodeURIComponent('/encours');
                }
              }
            } catch (routerError) {
              console.error('❌ Erreur lors de la redirection:', routerError);
              if (typeof window !== 'undefined') {
                window.location.href = '/login?redirect=' + encodeURIComponent('/encours');
              }
            }
          } else {
            console.log('✅ Utilisateur authentifié:', user?.email || 'email non disponible');
          }
        }, 500);
      }
    }
    
    // TOUJOURS retourner une fonction de nettoyage à la fin
    return () => {
      if (timeout) clearTimeout(timeout);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, authLoading]);

  // Marquer que nous sommes côté client pour éviter les problèmes d'hydratation
  useEffect(() => {
    setIsClient(true);
    return () => {};
  }, []);

  // Vérifier s'il y a des erreurs de token ou des messages de succès dans l'URL
  useEffect(() => {
    // JAMAIS de return conditionnel - toujours exécuter et retourner à la fin
    let messageTimeout: NodeJS.Timeout | null = null;
    
    // Vérifier que nous sommes côté client avant d'exécuter
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const messageParam = urlParams.get('message');
        const balanceParam = urlParams.get('balance');
        const moduleParam = urlParams.get('module');
        
        // Gérer les messages de succès
        if (messageParam) {
          setSuccessMessage(decodeURIComponent(messageParam));
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (e) {
            console.warn('Erreur lors du nettoyage de l\'URL:', e);
          }
          // Effacer le message après 5 secondes
          messageTimeout = setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        }
        
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
          
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (e) {
            console.warn('Erreur lors du nettoyage de l\'URL:', e);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des paramètres URL:', error);
      }
    }
    
    // TOUJOURS retourner une fonction de nettoyage à la fin
    return () => {
      if (messageTimeout) clearTimeout(messageTimeout);
    };
  }, []);

  // Récupérer le rôle de l'utilisateur et vérifier si c'est un admin
  useEffect(() => {
    // Ne jamais retourner conditionnellement - toujours exécuter le code et retourner à la fin
    if (!user) {
      setRole(null);
      setIsAdmin(false);
    } else {
      try {
        // Le rôle est déjà disponible dans l'objet user de notre système d'authentification
        const userRole = user.role || 'user';
        setRole(userRole);
        
        // Vérifier si c'est un admin (par rôle ou par email)
        const isAdminByRole = userRole === 'admin';
        const isAdminByEmail = user.email === 'formateur_tic@hotmail.com';
        setIsAdmin(isAdminByRole || isAdminByEmail);
        
        if (isAdminByRole || isAdminByEmail) {
          console.log('✅ Utilisateur admin détecté:', user.email);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du rôle:', error);
        setRole('user');
        setIsAdmin(false);
      }
    }
    
    // TOUJOURS retourner une fonction de nettoyage à la fin, jamais de return conditionnel
    return () => {};
  }, [user?.id, user?.email, user?.role]); // Utiliser des valeurs primitives pour éviter les changements de référence

  // Charger les données de tokens
  const fetchTokenData = useCallback(async () => {
    if (!user?.id) {
      // ✅ Mettre à jour les valeurs par défaut même si pas d'utilisateur
      setTokenBalance(0);
      setTokenHistory([]);
      return;
    }
    
    try {
      setLoadingTokens(true);
      
      // Charger le solde de tokens
      const tokenService = TokenActionServiceClient.getInstance();
      const balance = await tokenService.getUserTokenBalance(user.id);
      setTokenBalance(balance || 0); // ✅ Valeur par défaut si null
      
      // Charger l'historique d'utilisation
      const history = await tokenService.getUserTokenHistory(user.id, 20);
      setTokenHistory(history || []); // ✅ Tableau vide par défaut si null
      
    } catch (error) {
      // Ne logger l'erreur que si ce n'est pas une erreur réseau normale ou un utilisateur sans tokens
      if (error instanceof Error && !error.message.includes('fetch') && !error.message.includes('network')) {
        console.error('❌ fetchTokenData: Erreur chargement tokens:', error);
      }
      // ✅ Mettre à jour avec des valeurs par défaut en cas d'erreur
      setTokenBalance(0);
      setTokenHistory([]);
    } finally {
      setLoadingTokens(false); // ✅ Toujours arrêter le chargement
    }
  }, [user?.id]);

  // Mise à jour en temps réel de l'historique des utilisations
  useEffect(() => {
    // Ne jamais retourner conditionnellement - toujours exécuter le code et retourner à la fin
    let channel: any = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    if (user?.id) {
      // Vérifier si WebSocket est disponible
      const isWebSocketAvailable = typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
      
      // WebSocket check silencieux pour améliorer les performances

      // Essayer de créer l'abonnement Realtime seulement si WebSocket est disponible
      if (isWebSocketAvailable) {
        try {
          // S'abonner aux changements de la table user_applications (nouveau système)
          channel = supabase
            .channel(`user_applications:${user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_applications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                // Rafraîchir immédiatement l'historique (sans dépendance pour éviter les boucles)
                // eslint-disable-next-line react-hooks/exhaustive-deps
                fetchTokenData().catch(() => {});
              }
            )
            .subscribe(() => {
              // Abonnement silencieux pour améliorer les performances
            });
        } catch (error: any) {
          console.error('❌ Erreur lors de la configuration Realtime:', error);
          if (error?.message?.includes('WebSocket') || error?.message?.includes('websocket')) {
            console.warn('⚠️ WebSocket non disponible, utilisation du polling uniquement');
          }
          channel = null;
        }
      }

      // Polling de secours toutes les 60 secondes (réduit pour améliorer les performances)
      pollingInterval = setInterval(() => {
        // Polling silencieux pour améliorer les performances
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchTokenData().catch(() => {});
      }, 60000); // Augmenté de 30s à 60s pour réduire la charge
    }

    // TOUJOURS retourner une fonction de nettoyage à la fin, jamais de return conditionnel
    return () => {
      console.log('🔔 Nettoyage de l\'abonnement en temps réel');
      if (pollingInterval) clearInterval(pollingInterval);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('⚠️ Erreur lors du nettoyage du channel Realtime:', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // ✅ Retiré fetchTokenData pour éviter les dépendances circulaires

  // Timeout de sécurité pour authLoading (déplacé avant les returns conditionnels)
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    if (authLoading) {
      timeout = setTimeout(() => {
        console.warn('⚠️ Timeout authLoading - Arrêt après 8 secondes');
        // Le hook useCustomAuth gère son propre timeout, mais on peut forcer l'affichage
      }, 8000);
    }
    
    // Toujours retourner une fonction de nettoyage pour éviter l'erreur React #310
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [authLoading]);

  // Charger les modules souscrits par l'utilisateur et les tokens d'accès
  useEffect(() => {
    // JAMAIS de return conditionnel - toujours exécuter et retourner à la fin
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    const fetchUserModules = async () => {
      if (!user?.id || !isMounted) {
        setLoading(false);
        return;
      }
      
      // Vérifier si c'est un admin (par rôle ou par email) directement dans la fonction
      const userIsAdmin = user.role === 'admin' || user.email === 'formateur_tic@hotmail.com';
      
      try {
        setLoading(true);
        console.log('🔍 Chargement des modules pour utilisateur:', user.id, userIsAdmin ? '(ADMIN)' : '');
        
        // Désactiver automatiquement les modules expirés pour cet utilisateur
        try {
          const deactivateResponse = await fetch(`/api/deactivate-expired-modules?userId=${user.id}`, {
            method: 'GET'
          });
          if (deactivateResponse.ok) {
            const deactivateResult = await deactivateResponse.json();
            if (deactivateResult.deactivatedCount > 0) {
              console.log(`⏰ ${deactivateResult.deactivatedCount} module(s) expiré(s) désactivé(s) automatiquement`);
            }
          }
        } catch (deactivateError) {
          console.warn('⚠️ Erreur lors de la désactivation des modules expirés:', deactivateError);
          // Continuer même en cas d'erreur
        }
        
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
          
          // Log détaillé pour déboguer qrcodes
          if (moduleAccessData && moduleAccessData.length > 0) {
            const qrcodesModules = moduleAccessData.filter(m => 
              m.module_id === 'qrcodes' || m.module_title?.toLowerCase().includes('qrcode')
            );
            console.log('🔍 Modules QR Codes trouvés dans user_applications:', qrcodesModules.length);
            if (qrcodesModules.length > 0) {
              console.log('✅ QR Codes TROUVÉ dans user_applications:', JSON.stringify(qrcodesModules, null, 2));
            } else {
              console.log('❌ QR Codes NON TROUVÉ dans user_applications');
              console.log('🔍 Tous les module_ids récupérés:', moduleAccessData.map(m => m.module_id));
            }
          } else {
            console.log('⚠️ Aucun module dans user_applications');
          }
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
          
          // Log spécial pour qrcodes
          const hasQrcodes = moduleIds.includes('qrcodes');
          console.log('🔍 DEBUG: moduleIds extraits:', moduleIds);
          console.log('🔍 DEBUG: qrcodes dans moduleIds?', hasQrcodes);
          
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
              
              // Log spécial pour qrcodes
              const qrcodesInResult = result.data?.find(m => m.id === 'qrcodes');
              console.log('🔍 DEBUG: qrcodes trouvé dans modules?', !!qrcodesInResult);
              if (qrcodesInResult) {
                console.log('✅ DEBUG: qrcodes trouvé dans modules:', qrcodesInResult);
              } else if (hasQrcodes) {
                console.log('⚠️ DEBUG: qrcodes dans moduleIds mais PAS trouvé dans table modules');
              }

              modulesData = result.data || [];
              modulesError = result.error;
            } catch (error) {
              modulesError = error;
            }
          }
        }

        if (modulesError) {
          // Log l'erreur mais continuer avec les données disponibles
          console.warn('⚠️ Erreur récupération modules:', modulesError);
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
        
        console.log('🔍 DEBUG: Nombre total de modules dans moduleAccessData:', moduleAccessData?.length || 0);
        
        // Vérifier spécifiquement qrcodes AVANT la boucle
        const qrcodesBeforeLoop = moduleAccessData?.find(m => 
          m.module_id === 'qrcodes' || m.module_title?.toLowerCase().includes('qrcode')
        );
        if (qrcodesBeforeLoop) {
          console.log('✅ QR Codes TROUVÉ dans moduleAccessData AVANT la boucle:', JSON.stringify(qrcodesBeforeLoop, null, 2));
        } else {
          console.log('❌ QR Codes NON TROUVÉ dans moduleAccessData AVANT la boucle');
          console.log('🔍 Tous les module_ids:', moduleAccessData?.map(m => ({ id: m.id, module_id: m.module_id, module_title: m.module_title })) || []);
        }
        
        for (const access of (moduleAccessData || [])) {
          // Vérifier que l'accès est valide
          if (!access || typeof access !== 'object' || !access.id) {
            console.error('❌ Accès invalide ignoré:', access);
            continue;
          }
          
          // Log spécial pour qrcodes AVANT tous les filtres
          const isQrcodes = access.module_id === 'qrcodes' || access.module_title?.toLowerCase().includes('qrcode');
          if (isQrcodes) {
            console.log('🔍 QR Codes AVANT filtres:', {
              id: access.id,
              module_id: access.module_id,
              module_title: access.module_title,
              is_active: access.is_active,
              expires_at: access.expires_at,
              expires_at_date: access.expires_at ? new Date(access.expires_at).toISOString() : null,
              now: new Date().toISOString(),
              is_expired: access.expires_at ? new Date(access.expires_at) <= new Date() : false
            });
          }
          
          // Filtrer les accès non expirés
          if (access.expires_at) {
            try {
              const expirationDate = new Date(access.expires_at);
              const now = new Date();
              if (expirationDate <= now) {
                console.log('⏰ Module expiré ignoré:', access.module_title, '(expiré le:', access.expires_at + ')');
                // Log spécial pour qrcodes expiré
                if (isQrcodes) {
                  console.log('❌ QR Codes EXPIRÉ - Ne sera pas affiché');
                  console.log('   Date expiration:', expirationDate.toISOString());
                  console.log('   Date maintenant:', now.toISOString());
                  console.log('   Différence (ms):', now.getTime() - expirationDate.getTime());
                }
                continue;
              }
            } catch (error) {
              console.error('❌ Erreur vérification date expiration:', error, 'pour module:', access.module_title);
              if (isQrcodes) {
                console.log('❌ QR Codes ignoré à cause d\'une erreur de date');
              }
              continue;
            }
          }
          
          // AFFICHER TOUS LES MODULES ACTIFS SANS VÉRIFICATION DE SÉCURITÉ
          // Si un module est actif dans user_applications, il doit être affiché dans /encours
          // Pas de vérification de sécurité pour éviter de filtrer des modules légitimes
          console.log('✅ Module actif affiché dans /encours:', access.module_title, '(module_id:', access.module_id + ')');
          
          // Log spécial pour qrcodes APRÈS les filtres
          if (isQrcodes) {
            console.log('✅ QR Codes APRÈS filtres - SERA AFFICHÉ:', {
              id: access.id,
              module_id: access.module_id,
              module_title: access.module_title,
              is_active: access.is_active,
              expires_at: access.expires_at
            });
          }
          
          // Créer l'objet module
          try {
            // Trouver les informations du module correspondant
            let moduleInfo = modulesData.find(module => module.id.toString() === access.module_id?.toString()) || {};
            
            // Si le module n'est pas trouvé dans modulesData, créer les infos par défaut
            // Cela peut arriver si le module n'existe pas dans la table 'modules' de Supabase
            if (!moduleInfo.id || !moduleInfo.title) {
              const moduleId = (access.module_id || '').toString().toLowerCase();
              const moduleTitle = (access.module_title || '').toLowerCase();
              
              // Cas spécial pour qrcodes
              if (moduleId === 'qrcodes' || moduleTitle.includes('qrcode')) {
                console.log('🔍 QR Codes: Module non trouvé dans modules, utilisation des infos par défaut');
                moduleInfo = {
                  id: 'qrcodes',
                  title: 'QR Codes Dynamiques',
                  description: 'Générez des QR codes dynamiques personnalisables',
                  category: 'Essentiels',
                  url: 'https://qrcodes.iahome.fr',
                  price: 0
                };
              } else {
                // Pour les autres modules non trouvés, utiliser les infos de user_applications
                console.log(`⚠️ Module ${access.module_id} non trouvé dans table modules, utilisation des infos de user_applications`);
                moduleInfo = {
                  id: access.module_id || 'unknown',
                  title: access.module_title || `Module ${access.module_id || 'unknown'}`,
                  description: 'Application activée via souscription',
                  category: 'Application activée',
                  url: '',
                  price: 0
                };
              }
            }
            
            // Définir la liste des modules essentiels par ID
            const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes', 'qrcodes-statiques', 'code-learning', 'home-assistant', 'administration'];
            const moduleId = (access.module_id || '').toString().toLowerCase();
            const moduleTitle = (access.module_title || moduleInfo.title || '').toLowerCase();
            
            // Vérifier si c'est un module essentiel par ID ou titre
            const isEssential = essentialModules.some(essentialId => 
              moduleId === essentialId || 
              moduleId.includes(essentialId.toLowerCase()) ||
              moduleTitle.includes(essentialId.toLowerCase()) ||
              moduleTitle.includes(essentialId.replace('-', ' '))
            );
            
            // Un module est gratuit s'il est essentiel OU si son prix est 0
            const isFree = isEssential || moduleInfo.price === 0 || moduleInfo.price === '0' || moduleInfo.price === null;
            
            const module: UserModule = {
              id: access.id || 'unknown',
              module_id: access.module_id || 'unknown',
              module_title: access.module_title || moduleInfo.title || `Module ${access.module_id || 'unknown'}`,
              module_description: moduleInfo.description || 'Application activée via souscription',
              module_category: 'Application activée',
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

        // Dédupliquer les modules par module_id (garder le plus récent)
        const moduleMap = new Map<string, UserModule>();
        
        for (const module of transformedModules) {
          const moduleId = (module.module_id || '').toString().toLowerCase();
          const existingModule = moduleMap.get(moduleId);
          
          if (!existingModule) {
            // Première occurrence de ce module_id
            moduleMap.set(moduleId, module);
          } else {
            // Comparer les dates de création pour garder le plus récent
            const existingDate = new Date(existingModule.created_at);
            const currentDate = new Date(module.created_at);
            
            if (currentDate > existingDate) {
              // Le module actuel est plus récent, le remplacer
              moduleMap.set(moduleId, module);
              console.log(`🔄 Module dupliqué remplacé (plus récent): ${module.module_title} (${moduleId})`);
            } else {
              console.log(`⏭️ Module dupliqué ignoré (plus ancien): ${module.module_title} (${moduleId})`);
            }
          }
        }
        
        // Convertir le Map en tableau
        const allModules = Array.from(moduleMap.values());
        
        console.log(`✅ Modules dédupliqués: ${transformedModules.length} → ${allModules.length}`);
        
        // Log spécial pour vérifier si qrcodes est dans allModules
        const qrcodesInFinal = allModules.filter(m => 
          m.module_id === 'qrcodes' || m.module_title?.toLowerCase().includes('qrcode')
        );
        console.log('🔍 QR Codes dans allModules (après déduplication):', qrcodesInFinal.length);
        if (qrcodesInFinal.length > 0) {
          console.log('✅ QR Codes présent dans allModules:', JSON.stringify(qrcodesInFinal.map(m => ({
            id: m.id,
            module_id: m.module_id,
            module_title: m.module_title,
            is_active: m.is_active,
            expires_at: m.expires_at
          })), null, 2));
        } else {
          console.log('❌ QR Codes ABSENT de allModules après déduplication');
          // Vérifier dans transformedModules
          const qrcodesInTransformed = transformedModules.filter(m => 
            m.module_id === 'qrcodes' || m.module_title?.toLowerCase().includes('qrcode')
          );
          console.log('🔍 QR Codes dans transformedModules:', qrcodesInTransformed.length);
          if (qrcodesInTransformed.length > 0) {
            console.log('⚠️ QR Codes présent dans transformedModules mais absent de allModules - problème de déduplication');
            console.log('Détails transformedModules:', JSON.stringify(qrcodesInTransformed, null, 2));
            console.log('🔍 DEBUG: Vérification de la déduplication...');
            // Forcer l'ajout de qrcodes même s'il est dupliqué
            const qrcodesModule = qrcodesInTransformed[0];
            const existingInMap = Array.from(moduleMap.values()).find(m => 
              (m.module_id || '').toString().toLowerCase() === 'qrcodes'
            );
            if (!existingInMap) {
              console.log('⚠️ FORCAGE: Ajout de qrcodes dans allModules car absent');
              allModules.push(qrcodesModule);
              console.log('✅ QR Codes ajouté de force dans allModules');
            } else {
              console.log('⚠️ QR Codes existe déjà dans moduleMap mais pas dans allModules - bug de conversion');
            }
          } else {
            console.log('❌ QR Codes ABSENT de transformedModules aussi - problème plus tôt dans le processus');
          }
        }
        
        console.log('✅ fetchUserModules: Modules finaux à afficher:', allModules.length);
        if (allModules.length > 0) {
          console.log('✅ fetchUserModules: Premier module:', allModules[0].module_title);
        }
        if (isMounted) {
          setUserModules(allModules);
          setError(null);
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('❌ fetchUserModules: Erreur:', error);
          setError(`Erreur lors du chargement des modules: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          setUserModules([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // ✅ Toujours arrêter le chargement, même en cas d'erreur
        }
      }
    };

    if (user?.id) {
      // Ajouter un timeout de sécurité pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⏱️ Timeout de sécurité: arrêt du chargement après 15 secondes');
          setLoading(false);
        }
      }, 15000); // 15 secondes max
      
      fetchUserModules()
        .catch(err => {
          if (isMounted) {
            console.error('❌ Erreur non gérée dans fetchUserModules:', err);
            setError('Erreur lors du chargement. Veuillez réessayer.');
            setLoading(false);
          }
        })
        .finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        });
      
      // Charger les tokens séparément pour ne pas bloquer le rendu
      // Utiliser fetchTokenData directement sans l'ajouter aux dépendances pour éviter les boucles
      fetchTokenData().catch(err => {
        if (isMounted) {
          console.error('❌ Erreur non gérée dans fetchTokenData:', err);
          // Ne pas bloquer le rendu si les tokens échouent
          setTokenBalance(0);
          setTokenHistory([]);
        }
      });
    } else {
      // Si pas d'utilisateur, arrêter le chargement immédiatement
      if (isMounted) {
        setLoading(false);
      }
    }
    
    // TOUJOURS retourner une fonction de nettoyage pour éviter l'erreur React #310
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // fetchTokenData est stable grâce à useCallback avec user?.id

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
      'home-assistant': 'home-assistant', // Home Assistant -> home-assistant
      '11': 'cogstudio', // Cog Studio -> cogstudio
      'meeting-reports': 'meeting-reports', // Meeting Reports -> meeting-reports
      'qrcodes-statiques': 'qrcodes-statiques', // QR Codes Statiques
      'hunyuan3d': 'hunyuan3d', // Hunyuan 3D -> hunyuan3d
      'administration': 'administration', // Administration -> administration
      'prompt-generator': 'prompt-generator', // Générateur de prompts -> prompt-generator
      'apprendre-autrement': 'apprendre-autrement', // Apprendre Autrement -> apprendre-autrement
      'ai-detector': 'ai-detector', // Détecteur de Contenu IA -> ai-detector
    };

    // Mapping des slugs vers les URLs directes des applications
    const directUrls: { [key: string]: string } = {
      'metube': 'http://localhost:8081',  // MeTube accès direct
      'librespeed': 'http://localhost:8085',  // LibreSpeed accès direct
      'pdf': 'http://localhost:8080',  // PDF accès direct
      'psitransfer': 'http://localhost:8082',  // PsiTransfer accès direct
      'qrcodes': 'https://qrcodes.iahome.fr',  // QR Codes accès direct via Cloudflare
      'qrcodes-statiques': 'http://localhost:7006',  // QR Codes Statiques local
      'whisper': 'http://localhost:8084',  // Whisper accès direct
      'stablediffusion': 'http://localhost:7860',  // StableDiffusion accès direct
      'ruinedfooocus': 'http://localhost:7861',  // RuinedFooocus accès direct
      'comfyui': 'http://localhost:8188',  // ComfyUI accès direct
      'cogstudio': 'http://localhost:8086',  // CogStudio accès direct
      // Meeting Reports : localhost:3050 en dev, meeting-reports.iahome.fr en prod
      'meeting-reports': (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
        ? 'http://localhost:3050' 
        : 'https://meeting-reports.iahome.fr',
      // Hunyuan 3D : localhost:8888 en dev, hunyuan3d.iahome.fr en prod
      'hunyuan3d': (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
        ? 'http://localhost:8888' 
        : 'https://hunyuan3d.iahome.fr',
      // Home Assistant : localhost:8123 en dev, homeassistant.iahome.fr en prod
      'home-assistant': (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
        ? 'http://localhost:8123' 
        : 'https://homeassistant.iahome.fr',
      // Administration : page de liens vers les services administratifs
      'administration': '/administration',
      // Apprendre Autrement : redirection directe vers l'application (racine)
      'apprendre-autrement': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
        ? 'http://localhost:9001'
        : 'https://apprendre-autrement.iahome.fr',
      // Générateur de prompts : utiliser directement l'URL de production (via Traefik)
      'prompt-generator': 'https://prompt-generator.iahome.fr',
      // Détecteur de Contenu IA : sur le domaine principal
      'ai-detector': (typeof window !== 'undefined' && window.location.hostname === 'localhost')
        ? 'http://localhost:3000/ai-detector'
        : 'https://iahome.fr/ai-detector',
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
      'hunyuan3d': 100,
      'prompt-generator': 100,
      'ai-detector': 100, // Détecteur de Contenu IA -> 100 tokens
      
      // Applications essentielles (10 tokens)
      'librespeed': 10,
      'metube': 10,
      'psitransfer': 10,
      'pdf': 10,
      'meeting-reports': 10,
      'cogstudio': 10,
      'home-assistant': 100,
      'administration': 10,
      'apprendre-autrement': 10, // Apprendre Autrement -> 10 tokens
      
      // Applications premium (100 tokens)
      'qrcodes': 100,
      
      // Anciens IDs numériques (pour compatibilité)
      '1': 10,      // PDF+ -> 10 tokens
      '2': 10,      // MeTube -> 10 tokens
      '3': 10,      // LibreSpeed -> 10 tokens
      '4': 10,      // PsiTransfer -> 10 tokens
      '5': 100,     // QR Codes -> 100 tokens
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
          
          // Définir la liste des modules essentiels par ID
          const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes', 'qrcodes-statiques', 'code-learning', 'home-assistant', 'administration'];
          const moduleId = (access.module_id || '').toString().toLowerCase();
          const moduleTitle = (access.module_title || moduleInfo.title || '').toLowerCase();
          
          // Vérifier si c'est un module essentiel par ID ou titre
          const isEssential = essentialModules.some(essentialId => 
            moduleId === essentialId || 
            moduleId.includes(essentialId.toLowerCase()) ||
            moduleTitle.includes(essentialId.toLowerCase()) ||
            moduleTitle.includes(essentialId.replace('-', ' '))
          );
          
          // Un module est gratuit s'il est essentiel OU si son prix est 0
          const isFree = isEssential || moduleInfo.price === 0 || moduleInfo.price === '0' || moduleInfo.price === null;
          
          return {
            id: access.id,
            module_id: access.module_id,
            module_title: access.module_title || moduleInfo.title || `Module ${access.module_id}`,
            module_description: moduleInfo.description || 'Application activée via souscription',
            module_category: 'Application activée',
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

      // Dédupliquer les modules par module_id (garder le plus récent)
      const moduleMap = new Map<string, UserModule>();
      
      for (const module of transformedModules) {
        const moduleId = (module.module_id || '').toString().toLowerCase();
        const existingModule = moduleMap.get(moduleId);
        
        if (!existingModule) {
          // Première occurrence de ce module_id
          moduleMap.set(moduleId, module);
        } else {
          // Comparer les dates de création pour garder le plus récent
          const existingDate = new Date(existingModule.created_at);
          const currentDate = new Date(module.created_at);
          
          if (currentDate > existingDate) {
            // Le module actuel est plus récent, le remplacer
            moduleMap.set(moduleId, module);
            console.log(`🔄 Refresh: Module dupliqué remplacé (plus récent): ${module.module_title} (${moduleId})`);
          }
        }
      }
      
      // Convertir le Map en tableau
      const allModules = Array.from(moduleMap.values());
      
      console.log(`✅ Refresh: Modules dédupliqués: ${transformedModules.length} → ${allModules.length}`);
      
      setUserModules(allModules);
    }
    setRefreshing(false);
  };

  // Fonctions utilitaires
  const formatDate = (dateString: string) => {
    if (!isClient) {
      // Pendant l'hydratation, retourner une version simple
      return new Date(dateString).toISOString().split('T')[0];
    }
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

  // Calculer une date d'expiration virtuelle (1 mois après la création) si expires_at est null
  const getVirtualExpirationDate = (createdAt: string): string => {
    const created = new Date(createdAt);
    const virtualExpiration = new Date(created);
    virtualExpiration.setMonth(virtualExpiration.getMonth() + 1); // Ajouter 1 mois
    return virtualExpiration.toISOString();
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
    const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes-statiques'];
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
            <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
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

  // Protection finale : si user est null après toutes les vérifications, ne pas rendre
  if (!user) {
    console.error('❌ user is null in render, redirecting...');
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
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

        {/* Affichage des messages de succès */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-400 hover:text-green-500"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des erreurs de token */}
        {tokenError && (
          <div className="mb-6 bg-pink-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Accès à l'application non autorisé
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-2">
                    Pour accéder gratuitement aux applications IAHome, veuillez vous connecter avec votre compte.
                  </p>
                  {!user && (
                    <Link 
                      href="/login"
                      className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Se connecter
                    </Link>
                  )}
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
              href="/applications" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Activez vos applications IAHome gratuitement
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques améliorées */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Résumé de vos applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className="text-sm text-gray-600">Mes applis IA</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userModules.filter(m => {
                      if (!m.expires_at) return false;
                      const expirationDate = m.expires_at || getVirtualExpirationDate(m.created_at);
                      const days = getDaysRemaining(expirationDate);
                      // Modules qui expirent dans les 7 prochains jours (mais pas encore expirés)
                      return days >= 0 && days <= 7;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès qui expirent bientôt</div>
                </div>
              </div>
            </div>

            {/* Section Tokens - Améliorée */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
              <div className="p-8">
                {/* En-tête */}
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <span className="text-3xl">🪙</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Mes Tokens</h2>
                      <p className="text-blue-100 text-sm">Gérez votre crédit token</p>
                    </div>
                  </div>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Solde de tokens - Mis en avant */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    {/* Version mobile : en colonne */}
                    <div className="flex flex-col md:hidden">
                      <div className="flex items-center justify-between mb-4">
                    <div>
                          <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide mb-1">Solde disponible</h3>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-5xl font-bold text-white">{tokenBalance}</p>
                            <p className="text-lg text-blue-200 font-medium">tokens</p>
                    </div>
                  </div>
                        <div className="text-6xl opacity-30">🪙</div>
                      </div>
                      
                      {/* Barre de progression visuelle */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-100">Niveau d'utilisation</span>
                          <span className="text-xs text-blue-100">{tokenBalance > 0 ? 'Actif' : 'Vide'}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              tokenBalance > 100 ? 'bg-green-400' :
                              tokenBalance > 50 ? 'bg-yellow-400' :
                              tokenBalance > 10 ? 'bg-orange-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${Math.min((tokenBalance / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Bouton de recharge */}
                      <Link href="/pricing" className="group block w-full">
                        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-base">Rechargez vos tokens</span>
                          </div>
                        </div>
                    </Link>
                    </div>
                    
                    {/* Version desktop : sur la même ligne */}
                    <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
                      {/* Solde et titre à gauche */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-6xl opacity-30">🪙</div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide mb-1">Solde disponible</h3>
                          <div className="flex items-baseline space-x-2">
                            <p className="text-5xl font-bold text-white">{tokenBalance}</p>
                            <p className="text-lg text-blue-200 font-medium">tokens</p>
                          </div>
                  </div>
                </div>

                      {/* Bouton à droite */}
                      <Link href="/pricing" className="group shrink-0">
                        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="whitespace-nowrap">Rechargez vos tokens</span>
                          </div>
                        </div>
                      </Link>
              </div>

                    {/* Barre de progression (desktop seulement, en dessous) */}
                    <div className="hidden md:block mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-blue-100">Niveau d'utilisation</span>
                        <span className="text-xs text-blue-100">{tokenBalance > 0 ? 'Actif' : 'Vide'}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            tokenBalance > 100 ? 'bg-green-400' :
                            tokenBalance > 50 ? 'bg-yellow-400' :
                            tokenBalance > 10 ? 'bg-orange-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${Math.min((tokenBalance / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Grille des modules améliorée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Log pour déboguer le rendu
                const qrcodesInRender = userModules.filter(m => 
                  m.module_id === 'qrcodes' || m.module_title?.toLowerCase().includes('qrcode')
                );
                console.log('🔍 RENDU: Nombre total de modules à afficher:', userModules.length);
                console.log('🔍 RENDU: QR Codes dans userModules:', qrcodesInRender.length);
                if (qrcodesInRender.length > 0) {
                  console.log('✅ RENDU: QR Codes sera affiché:', qrcodesInRender[0].module_title);
                } else {
                  console.log('❌ RENDU: QR Codes ne sera PAS affiché');
                }
                return null;
              })()}
              {userModules.map((module) => {
                const expirationDate = module.expires_at || getVirtualExpirationDate(module.created_at);
                const isExpired = new Date(expirationDate) <= new Date();
                const isExpiringSoon = getDaysRemaining(expirationDate) <= 7;
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
                        {(module.module_id === 'qrcodes' || module.module_id === '5') ? 'QR Codes dynamiques' : module.module_title}
                      </h3>
                      
                      {/* Badges et informations */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {/* Badge pour le type de module */}
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                            {getModuleTypeIcon(module)} {getModuleTypeLabel(module)}
                          </span>
                          {(() => {
                            const expirationDate = module.expires_at || getVirtualExpirationDate(module.created_at);
                            const isVirtualExpiration = !module.expires_at;
                            const days = getDaysRemaining(expirationDate);
                            const isExpired = days < 0;
                            const isExpiringSoon = days <= 7;
                            
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isExpired 
                                  ? 'bg-red-500 text-white' 
                                  : isExpiringSoon
                                    ? 'bg-yellow-500 text-white'
                                    : isVirtualExpiration
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white/20 text-white'
                              }`}>
                                {(() => {
                                  const days = getDaysRemaining(expirationDate);
                                  if (days < 0) return 'Expiré';
                                  if (days === 0) return 'Aujourd\'hui';
                                  if (days === 1) return 'Demain';
                                  return `${days} jours`;
                                })()}
                              </span>
                            );
                          })()}
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="text-xs font-semibold text-blue-900 mb-3 uppercase tracking-wide">
                          📅 Période d'Activation
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-medium">Date de début :</span>
                            <span className="text-sm font-semibold text-blue-900">{formatDate(module.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700 font-medium">Date de fin :</span>
                          {(() => {
                            const expirationDate = module.expires_at || getVirtualExpirationDate(module.created_at);
                            return (
                              <span className={`text-sm font-semibold ${getTimeRemainingColor(expirationDate)}`}>
                                {formatDate(expirationDate)}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 font-medium">Durée restante :</span>
                            {(() => {
                              const expirationDate = module.expires_at || getVirtualExpirationDate(module.created_at);
                              const days = getDaysRemaining(expirationDate);
                              const displayText = days < 0 
                                ? 'Expiré' 
                                : days === 0 
                                  ? 'Expire aujourd\'hui'
                                  : days === 1
                                    ? 'Expire demain'
                                    : `${days} jours`;
                              return (
                                <span className={`text-xs font-bold ${getTimeRemainingColor(expirationDate)}`}>
                                  {displayText}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        </div>
                      </div>

                      {/* Bouton d'accès */}
                      {(() => {
                        const moduleId = module.module_id;
                        const moduleTitle = module.module_title;
                        
                        // Applications IA (100 tokens)
                        if (['whisper', 'stablediffusion', 'ruinedfooocus', 'comfyui', 'hunyuan3d', 'prompt-generator'].includes(moduleId)) {
                          if (!user) {
                            console.error('❌ user is null in AIAccessButton');
                            return null;
                          }
                          return (
                            <AIAccessButton
                              user={user}
                              moduleId={moduleId}
                              moduleTitle={moduleTitle}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // Rafraîchir l'historique des tokens après utilisation (une seule fois après 1s)
                                setTimeout(() => {
                                  fetchTokenData().catch(() => {});
                                }, 1000);
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // QR Codes (100 tokens) - application premium
                        if (moduleId === 'qrcodes') {
                          if (!user) {
                            console.error('❌ user is null in QRCodeAccessButton');
                            return null;
                          }
                          return (
                            <QRCodeAccessButton
                              user={user}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // Rafraîchir les tokens et modules après utilisation (une seule fois après 1s)
                                setTimeout(() => {
                                  fetchTokenData().catch(() => {});
                                  refreshData();
                                }, 1000);
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // Meeting Reports (100 tokens) - compte rendu automatique
                        if (moduleId === 'meeting-reports') {
                          if (!user) {
                            console.error('❌ user is null in MeetingReportsAccessButton');
                            return null;
                          }
                          return (
                            <MeetingReportsAccessButton
                              user={user}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // Rafraîchir les tokens et modules après utilisation (une seule fois après 1s)
                                setTimeout(() => {
                                  fetchTokenData().catch(() => {});
                                  refreshData();
                                }, 1000);
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // LibreSpeed - Utiliser le bouton spécial sans demande de mot de passe
                        if (moduleId === 'librespeed') {
                          if (!user) {
                            console.error('❌ user is null in LibreSpeedAccessButton');
                            return null;
                          }
                          return (
                            <LibreSpeedAccessButton
                              user={user}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // Rafraîchir l'historique des tokens après utilisation (une seule fois après 1s)
                                setTimeout(() => {
                                  fetchTokenData().catch(() => {});
                                }, 1000);
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // Applications essentielles (10 tokens) - sans LibreSpeed (qui a son propre bouton)
                        if (['metube', 'psitransfer', 'pdf', 'cogstudio', 'code-learning', 'administration', 'apprendre-autrement'].includes(moduleId)) {
                          if (!user) {
                            console.error('❌ user is null in EssentialAccessButton');
                            return null;
                          }
                          return (
                            <EssentialAccessButton
                              user={user}
                              moduleId={moduleId}
                              moduleTitle={moduleTitle}
                              onAccessGranted={(url) => {
                                console.log(`🔗 ${moduleTitle}: Accès autorisé:`, url);
                                // Rafraîchir l'historique des tokens après utilisation (une seule fois après 1s)
                                setTimeout(() => {
                                  fetchTokenData().catch(() => {});
                                }, 1000);
                              }}
                              onAccessDenied={(reason) => {
                                console.log(`❌ ${moduleTitle}: Accès refusé:`, reason);
                                alert(`Accès refusé: ${reason}`);
                              }}
                            />
                          );
                        }
                        
                        // Fallback pour les autres modules
                        if (!user) {
                          console.error('❌ user is null in ModuleAccessButton');
                          return null;
                        }
                        return (
                          <ModuleAccessButton
                            user={user}
                            moduleId={module.module_id}
                            moduleName={module.module_title}
                            moduleUrl={getModuleUrl(module.module_id) || ''}
                            moduleCost={getModuleCost(module.module_id)}
                            onAccessGranted={(url) => {
                              console.log(`🔗 ${module.module_title}: Accès autorisé:`, url);
                              // Rafraîchir l'historique des tokens après utilisation (une seule fois après 1s)
                              setTimeout(() => {
                                fetchTokenData().catch(() => {});
                              }, 1000);
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

            {/* Section Historique d'utilisation - Après la grille des modules */}
            <div className="mt-12">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📊 Mes dernières utilisations</h2>
                  <button
                    onClick={fetchTokenData}
                    disabled={loadingTokens}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors flex items-center space-x-2"
                  >
                    {loadingTokens ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Actualisation...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Actualiser</span>
                      </>
                    )}
                  </button>
                </div>
                
                {tokenHistory.length > 0 ? (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tokenHistory.slice(0, 12).map((usage, index) => {
                        if (!isClient) {
                          // Pendant l'hydratation, retourner une version simple sans calculs de date
                          return (
                            <div key={usage.id || index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                  <h4 className="text-sm font-bold text-gray-900 truncate">
                                    {usage.module_name || usage.module_id || 'Module inconnu'}
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-red-500 font-bold text-base">
                                    -{usage.tokens_consumed || 0}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">tokens</span>
                                </div>
                              </div>
                              <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-medium text-gray-600">
                                  {usage.action_type || 'Accès'}
                                </p>
                                <p className="text-xs font-semibold text-gray-500 mt-1">
                                  {usage.usage_date ? new Date(usage.usage_date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        const usageDate = new Date(usage.usage_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const usageDateOnly = new Date(usageDate);
                        usageDateOnly.setHours(0, 0, 0, 0);
                        const isToday = usageDateOnly.getTime() === today.getTime();
                        const isYesterday = usageDateOnly.getTime() === yesterday.getTime();
                        
                        return (
                          <div key={usage.id || index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                <h4 className="text-sm font-bold text-gray-900 truncate">
                                  {usage.module_name || usage.module_id || 'Module inconnu'}
                                </h4>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-red-500 font-bold text-base">
                                  -{usage.tokens_consumed || 0}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">tokens</span>
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium text-gray-600">
                                  {usage.action_type || 'Accès'}
                                </p>
                                <p className={`text-xs font-semibold ${
                                  isToday ? 'text-green-600' :
                                  isYesterday ? 'text-blue-600' :
                                  'text-gray-500'
                                }`}>
                                  {isToday ? 'Aujourd\'hui' :
                                   isYesterday ? 'Hier' :
                                   usageDate.toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                   })}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400">
                                à {usageDate.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                    {tokenHistory.length > 12 && (
                      <div className="text-center mt-6">
                        <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          +{tokenHistory.length - 12} autres utilisations
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 text-center text-gray-500 shadow-lg border border-gray-200">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold mb-2">Aucune utilisation récente</h3>
                    <p className="text-sm">Utilisez un module pour voir l'historique de vos utilisations</p>
                  </div>
                )}
              </div>
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