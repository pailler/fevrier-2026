'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { isAdminEmail } from '@/utils/adminEmails';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>('Vérification de votre connexion...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('🔍 Callback OAuth - Vérification de la session...');
        
        if (typeof window !== 'undefined') {
          const currentHostname = window.location.hostname;
          const currentUrl = window.location.href;
          const isProduction = currentHostname === 'iahome.fr' || currentHostname === 'www.iahome.fr';
          
          console.log('🔍 URL complète:', currentUrl);
          console.log('🔍 Hostname:', currentHostname);
          console.log('🔍 Is Production:', isProduction);
          console.log('🔍 Search params:', window.location.search);
          console.log('🔍 Hash:', window.location.hash);
          
          // Si on est en production mais que l'URL contient localhost, corriger APRÈS la récupération de session
          // Ne pas corriger immédiatement car cela interrompt la récupération de session
          if (isProduction && (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1'))) {
            console.log('⚠️ URL contient localhost en production - sera corrigée après récupération de session');
          }
        }
        
        setStatus('Récupération de votre session...');
        
        // IMPORTANT: NE PAS nettoyer le localStorage Supabase ici
        // Supabase a besoin de ses données (notamment le code_verifier pour PKCE) pour traiter le callback OAuth
        // Le code_verifier est stocké dans localStorage avant la redirection et est nécessaire pour échanger le code
        try {
          // Nettoyer UNIQUEMENT les données personnalisées (pas Supabase)
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('session_start_time');
          
          // NE PAS toucher aux clés Supabase (sb-*)
          // Ces clés contiennent le code_verifier nécessaire pour PKCE
          
          // Nettoyer sessionStorage seulement (pas localStorage Supabase)
          try {
            sessionStorage.removeItem('session_expired_redirected');
            Object.keys(sessionStorage).forEach(key => {
              if (key.includes('auth') && !key.startsWith('sb-') && !key.includes('supabase')) {
                sessionStorage.removeItem(key);
              }
            });
          } catch (sessionError) {
            // Ignorer les erreurs de sessionStorage
          }
          
          console.log('✅ Nettoyage des données personnalisées effectué (Supabase préservé)');
        } catch (storageError) {
          console.warn('⚠️ Erreur lors du nettoyage préalable:', storageError);
        }
        
        // Vérifier d'abord s'il y a une erreur dans l'URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (error) {
            console.error('❌ Erreur OAuth dans l\'URL:', error, errorDescription);
            setStatus(`Erreur OAuth: ${error}`);
            setTimeout(() => {
              router.push(`/login?error=oauth_error&detail=${encodeURIComponent(errorDescription || error)}`);
            }, 2000);
            return;
          }
        }
        
        // Fonction pour récupérer la session avec retry
        const getSessionWithRetry = async (maxRetries = 10, initialDelay = 500): Promise<{ session: any; error: any }> => {
          let delay = initialDelay;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`🔄 Tentative ${attempt}/${maxRetries} de récupération de la session...`);
            setStatus(`Récupération de votre session... (${attempt}/${maxRetries})`);
            
            // Pour la première tentative, attendre un peu plus longtemps
            if (attempt === 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error(`❌ Erreur lors de la tentative ${attempt}:`, sessionError);
              if (attempt === maxRetries) {
                return { session: null, error: sessionError };
              }
            } else if (session?.user) {
              console.log(`✅ Session trouvée à la tentative ${attempt}`);
              return { session, error: null };
            }
            
            // Attendre avant la prochaine tentative
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, delay));
              // Augmenter progressivement le délai pour les tentatives suivantes
              if (attempt > 3) {
                delay = Math.min(delay * 1.2, 2000);
              }
            }
          }
          
          return { session: null, error: new Error('Aucune session trouvée après plusieurs tentatives') };
        };
        
        // Vérifier et traiter les hash fragments ou query parameters dans l'URL (pour OAuth)
        let hasOAuthParams = false;
        if (typeof window !== 'undefined') {
          const hasHash = window.location.hash && window.location.hash.length > 0;
          const hasQueryParams = window.location.search && (window.location.search.includes('code=') || window.location.search.includes('access_token='));
          
          hasOAuthParams = hasHash || hasQueryParams;
          
          if (hasHash) {
            console.log('🔍 Hash fragments détectés dans l\'URL:', window.location.hash.substring(0, 50) + '...');
          }
          if (hasQueryParams) {
            console.log('🔍 Query parameters OAuth détectés dans l\'URL (PKCE flow):', window.location.search.substring(0, 100));
          }
        }
        
        // Utiliser onAuthStateChange pour écouter les changements d'état (plus fiable)
        let sessionFound = false;
        let sessionData: any = null;
        let sessionError: any = null;
        let authStateChangeResolved = false;
        let authSubscription: any = null;
        
        // Créer une promesse pour attendre l'événement onAuthStateChange
        const authStateChangePromise = new Promise<void>((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Événement auth:', event, session?.user?.email || 'pas de session');
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
              if (!sessionFound) {
                sessionFound = true;
                sessionData = session;
                authStateChangeResolved = true;
                console.log('✅ Session trouvée via onAuthStateChange:', event);
                if (authSubscription) {
                  authSubscription.unsubscribe();
                }
                resolve();
              }
            } else if (event === 'INITIAL_SESSION' && session?.user) {
              // INITIAL_SESSION peut aussi contenir la session
              if (!sessionFound) {
                sessionFound = true;
                sessionData = session;
                authStateChangeResolved = true;
                console.log('✅ Session trouvée via INITIAL_SESSION');
                if (authSubscription) {
                  authSubscription.unsubscribe();
                }
                resolve();
              }
            }
          });
          authSubscription = subscription;
          
          // Timeout pour onAuthStateChange (5 secondes max)
          setTimeout(() => {
            if (!authStateChangeResolved) {
              if (authSubscription) {
                authSubscription.unsubscribe();
              }
              resolve();
            }
          }, 5000);
        });
        
        // Si on a des paramètres OAuth, attendre un peu avant de traiter pour s'assurer que tout est prêt
        if (hasOAuthParams && typeof window !== 'undefined') {
          console.log('🔄 Paramètres OAuth détectés - Attente initiale pour s\'assurer que tout est prêt...');
          
          // Attendre un peu plus longtemps lors de la première tentative pour laisser le temps à Supabase
          // de traiter correctement le callback OAuth
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          console.log('🔄 Forçage du traitement de l\'URL OAuth par Supabase...');
          
          // Extraire le code de l'URL si présent (pour PKCE)
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            console.log('🔍 Code OAuth détecté:', code.substring(0, 20) + '...');
            
            // Vérifier que le code_verifier PKCE est présent dans localStorage
            // Supabase stocke le code_verifier dans localStorage avec différentes clés possibles
            const storageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
            const codeVerifierKey = `${storageKey}.code_verifier`; // Clé alternative possible
            const storedData = localStorage.getItem(storageKey);
            const codeVerifierData = localStorage.getItem(codeVerifierKey);
            
            console.log('🔍 Vérification approfondie du code_verifier PKCE...');
            console.log('🔍 Données Supabase (clé principale):', storedData ? 'Présentes' : 'Absentes');
            console.log('🔍 Code verifier (clé alternative):', codeVerifierData ? 'Présent' : 'Absent');
            
            // Vérifier toutes les clés localStorage qui pourraient contenir le code_verifier
            let hasCodeVerifier = false;
            if (storedData) {
              try {
                const parsed = JSON.parse(storedData);
                console.log('🔍 Clés dans les données Supabase:', Object.keys(parsed || {}));
                if (parsed.code_verifier) {
                  console.log('✅ code_verifier trouvé dans les données Supabase');
                  hasCodeVerifier = true;
                }
                // Vérifier aussi dans les sous-objets
                Object.keys(parsed || {}).forEach(key => {
                  if (typeof parsed[key] === 'object' && parsed[key]?.code_verifier) {
                    console.log(`✅ code_verifier trouvé dans la clé: ${key}`);
                    hasCodeVerifier = true;
                  }
                });
              } catch (e) {
                console.warn('⚠️ Impossible de parser les données Supabase:', e);
              }
            }
            
            if (codeVerifierData) {
              console.log('✅ code_verifier trouvé dans la clé alternative');
              hasCodeVerifier = true;
            }
            
            // Vérifier toutes les clés localStorage qui commencent par 'sb-'
            console.log('🔍 Recherche de toutes les clés Supabase dans localStorage...');
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                const value = localStorage.getItem(key);
                if (value && (value.includes('code_verifier') || value.includes('codeVerifier'))) {
                  console.log(`✅ code_verifier potentiel trouvé dans: ${key}`);
                  hasCodeVerifier = true;
                }
              }
            });
            
            console.log('🔍 Code verifier présent (résultat final):', hasCodeVerifier ? 'Oui' : 'Non');
            
            // Essayer d'échanger le code manuellement - TOUJOURS essayer même sans code_verifier détecté
            // Supabase peut avoir le code_verifier côté serveur ou dans une structure différente
            try {
              console.log('🔄 Tentative d\'échange manuel du code OAuth (toujours tenté)...');
              console.log('🔄 Code à échanger:', code.substring(0, 30) + '...');
              
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('❌ Erreur lors de l\'échange manuel:', exchangeError);
                console.error('❌ Message:', exchangeError.message);
                console.error('❌ Status:', exchangeError.status);
                if (exchangeError.message?.includes('code_verifier') || exchangeError.message?.includes('verifier')) {
                  console.error('🚨 ERREUR: code_verifier manquant ou invalide');
                  console.error('🚨 Cela signifie que Supabase ne peut pas échanger le code sans code_verifier');
                }
                console.error('❌ Erreur complète:', JSON.stringify(exchangeError, null, 2));
              } else {
                const session = exchangeData?.session || exchangeData;
                if (session?.user) {
                  console.log('✅ Session obtenue via échange manuel du code');
                  console.log('✅ User ID:', session.user.id);
                  console.log('✅ Email:', session.user.email);
                  sessionData = session;
                  sessionFound = true;
                } else {
                  console.warn('⚠️ Échange réussi mais pas de session dans la réponse');
                  console.warn('⚠️ Données reçues:', JSON.stringify(exchangeData, null, 2));
                }
              }
            } catch (exchangeError) {
              console.error('❌ Exception lors de l\'échange manuel:', exchangeError);
              console.error('❌ Stack:', exchangeError instanceof Error ? exchangeError.stack : 'N/A');
            }
            
            if (!hasCodeVerifier) {
              console.warn('⚠️ Code verifier manquant dans localStorage');
              console.warn('⚠️ Cela peut arriver si le localStorage a été nettoyé ou si c\'est une nouvelle session');
              console.warn('⚠️ L\'échange manuel a été tenté - vérifiez les erreurs ci-dessus');
            }
            
            // Si l'échange manuel n'a pas fonctionné, laisser Supabase traiter automatiquement
            if (!sessionFound) {
              console.log('🔄 Déclenchement du traitement automatique du code par Supabase...');
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const { data: { session: codeSession }, error: codeError } = await supabase.auth.getSession();
              
              if (codeError) {
                console.warn('⚠️ Erreur lors de la récupération de session:', codeError);
              }
              
              if (codeSession?.user) {
                console.log('✅ Session trouvée après traitement automatique');
                sessionData = codeSession;
                sessionFound = true;
              } else {
                // Attendre plus longtemps
                console.log('⏳ Attente du traitement du code par Supabase...');
        await new Promise(resolve => setTimeout(resolve, 1500));
                
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                if (retrySession?.user) {
                  console.log('✅ Session trouvée après attente');
                  sessionData = retrySession;
                  sessionFound = true;
                }
              }
            }
          }
          
          // Pour PKCE, Supabase utilise des query parameters avec 'code='
          // On peut forcer le traitement en appelant getSession plusieurs fois
          if (!sessionFound) {
            for (let i = 0; i < 3; i++) {
              const { data: { session: checkSession }, error: checkError } = await supabase.auth.getSession();
              if (checkSession?.user) {
                console.log(`✅ Session trouvée au check ${i + 1}`);
                sessionData = checkSession;
                sessionFound = true;
                break;
              }
              if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }
          
          // Si on n'a pas encore de session, attendre un peu plus
          if (!sessionFound) {
            console.log('⏳ Attente supplémentaire pour le traitement OAuth...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Attendre que Supabase traite le callback OAuth
        // Si on a déjà une session, ne pas attendre
        if (!sessionFound) {
          console.log('⏳ Attente du traitement OAuth par Supabase...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Attendre l'événement onAuthStateChange en parallèle avec un timeout
          await Promise.race([
            authStateChangePromise,
            new Promise(resolve => setTimeout(resolve, 5000)) // Timeout plus long
          ]);
          
          // Nettoyer la subscription si elle existe encore
          if (authSubscription && !authStateChangeResolved) {
            authSubscription.unsubscribe();
          }
          
          // Vérifier si onAuthStateChange a trouvé la session
          if (sessionFound && sessionData) {
            console.log('✅ Session trouvée via onAuthStateChange');
          } else {
            // Sinon, utiliser le système de retry avec plus de tentatives
            console.log('🔄 Utilisation du système de retry amélioré...');
            const retryResult = await getSessionWithRetry(20, 500); // Plus de tentatives avec délai plus long
            
            // Utiliser la session trouvée
            if (!sessionData && retryResult.session) {
              sessionData = retryResult.session;
              sessionError = retryResult.error;
              sessionFound = true;
              console.log('✅ Session trouvée via retry');
            }
          }
        }
        
        // Utiliser la session trouvée (soit depuis onAuthStateChange, soit depuis retry)
        const finalSession = sessionData;
        const finalError = sessionError;
        
        if (finalError) {
          console.error('❌ Erreur lors de la récupération de la session:', finalError);
          setStatus('Erreur lors de la récupération de la session');
          setTimeout(() => {
            router.push('/login?error=session_error');
          }, 2000);
          return;
        }
        
        if (!finalSession?.user) {
          console.log('❌ Aucune session trouvée après toutes les tentatives');
          setStatus('Session non trouvée. Redirection...');
          setTimeout(() => {
            router.push('/login?error=no_session');
          }, 2000);
          return;
        }
        
        const user = finalSession.user;
        console.log('✅ Session trouvée pour:', user.email);
        console.log('✅ Session user ID:', user.id);
        setStatus('Synchronisation de votre compte...');
        // Synchroniser le compte OAuth avec le profil existant (si nécessaire)
        try {
          console.log('🔄 Appel de l\'API de synchronisation...');
          const syncResponse = await fetch('/api/auth/sync-oauth-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authUserId: user.id,
              email: user.email,
              name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url
            })
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log('📋 Données de synchronisation:', syncData);
            if (syncData.migrated) {
              console.log('✅ Compte synchronisé avec succès (migration effectuée)');
            } else if (syncData.tokens_created) {
              console.log('✅ Compte synchronisé avec succès - 400 tokens créés');
            } else {
              console.log('✅ Compte synchronisé avec succès');
            }
            if (syncData.token_error) {
              console.error('⚠️ Erreur lors de la création des tokens:', syncData.token_error);
            }
          } else {
            const errorText = await syncResponse.text().catch(() => 'Erreur inconnue');
            console.error('❌ Erreur lors de la synchronisation:', errorText);
            console.error('❌ Status:', syncResponse.status);
            // Ne pas bloquer la connexion même si la synchronisation échoue
          }
        } catch (syncError: any) {
          console.error('❌ Erreur lors de l\'appel de synchronisation:', syncError?.message || syncError);
          // Ne pas bloquer la connexion même si la synchronisation échoue
        }
          
        setStatus('Finalisation de votre connexion...');
        
        // Récupérer le profil complet depuis la base de données pour avoir toutes les données
        console.log('🔄 Récupération du profil complet depuis la base de données...');
        const profileResponse = await fetch('/api/auth/get-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email
          })
        });

        let profileData = null;
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('✅ Profil récupéré:', profileData);
        } else {
          console.warn('⚠️ Impossible de récupérer le profil, utilisation des données Supabase');
          // Utiliser les données Supabase en fallback
          profileData = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: 'user',
            is_active: true,
            email_verified: true
          };
        }

        // Générer un JWT token comme pour les connexions classiques
        console.log('🔄 Génération du token JWT...');
        console.log('🔄 Données pour génération token:', {
          userId: profileData.id || user.id,
          email: profileData.email || user.email,
          role: profileData.role || 'user'
        });
        
        let jwtToken = null;
        try {
          const tokenResponse = await fetch('/api/auth/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: profileData.id || user.id,
              email: profileData.email || user.email,
              role: profileData.role || 'user'
            })
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            jwtToken = tokenData.token;
            console.log('✅ Token JWT généré avec succès');
            console.log('✅ Token (premiers caractères):', jwtToken ? jwtToken.substring(0, 20) + '...' : 'null');
          } else {
            const errorText = await tokenResponse.text().catch(() => 'Erreur inconnue');
            console.error('❌ Erreur lors de la génération du token JWT');
            console.error('❌ Status:', tokenResponse.status);
            console.error('❌ Message:', errorText);
            // Ne pas bloquer la connexion, utiliser le token Supabase en fallback
            jwtToken = finalSession?.access_token || null;
            if (jwtToken) {
              console.log('⚠️ Utilisation du token Supabase en fallback');
            } else {
              console.warn('⚠️ Aucun token disponible (ni JWT ni Supabase)');
            }
          }
        } catch (tokenError: any) {
          console.error('❌ Exception lors de la génération du token JWT:', tokenError);
          console.error('❌ Message:', tokenError?.message || 'Erreur inconnue');
          // Ne pas bloquer la connexion, utiliser le token Supabase en fallback
          jwtToken = finalSession?.access_token || null;
          if (jwtToken) {
            console.log('⚠️ Utilisation du token Supabase en fallback après exception');
          }
        }
        
        // Initialiser la session dans user_sessions pour le suivi de durée (non bloquant)
        fetch('/api/initialize-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profileData.id || user.id,
            userEmail: profileData.email || user.email
          })
        }).catch(initError => {
          console.warn('⚠️ Erreur lors de l\'initialisation de la session (non bloquant):', initError);
        });
        
        // Créer les données utilisateur pour localStorage (format identique aux connexions classiques)
        const userEmail = profileData.email || user.email;
        const userData = {
          id: profileData.id || user.id,
          email: userEmail,
          full_name: profileData.full_name || user.user_metadata?.full_name || user.email,
          role: isAdminEmail(userEmail) ? 'admin' : (profileData.role || 'user'),
          is_active: profileData.is_active !== false,
          email_verified: profileData.email_verified !== false,
          avatar_url: user.user_metadata?.avatar_url || null
        };
        
        // Stocker dans localStorage (format identique aux connexions classiques)
        try {
          // Nettoyer d'abord pour éviter les conflits
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('session_start_time');
          
          // Stocker les nouvelles données
          console.log('💾 Stockage dans localStorage...');
          console.log('💾 User data:', { id: userData.id, email: userData.email, role: userData.role });
          console.log('💾 JWT Token présent:', jwtToken ? 'Oui' : 'Non');
          
          localStorage.setItem('user_data', JSON.stringify(userData));
          if (jwtToken) {
            localStorage.setItem('auth_token', jwtToken);
            console.log('✅ Token JWT stocké dans localStorage');
          } else {
            console.warn('⚠️ Aucun token JWT à stocker');
          }
          // Stocker la date de début de session pour vérifier l'expiration
          localStorage.setItem('session_start_time', Date.now().toString());
          
          // Vérifier que les données sont bien stockées
          const storedUserData = localStorage.getItem('user_data');
          const storedToken = localStorage.getItem('auth_token');
          console.log('🔍 Vérification du stockage:');
          console.log('🔍 user_data stocké:', storedUserData ? 'Oui' : 'Non');
          console.log('🔍 auth_token stocké:', storedToken ? 'Oui' : 'Non');
          
          if (storedUserData) {
            try {
              const parsed = JSON.parse(storedUserData);
              console.log('🔍 Données utilisateur vérifiées:', { id: parsed.id, email: parsed.email });
            } catch (e) {
              console.error('❌ Erreur lors de la vérification des données:', e);
            }
          }
          
          // Réinitialiser l'instance Supabase pour éviter les conflits avec les anciennes sessions
          if (typeof window !== 'undefined' && (window as any).__supabaseClientInstance) {
            delete (window as any).__supabaseClientInstance;
            console.log('🔄 Instance Supabase réinitialisée après reconnexion');
          }
          
          // Déclencher l'événement de connexion
          console.log('📢 Déclenchement de l\'événement userLoggedIn...');
          window.dispatchEvent(new Event('userLoggedIn'));
          console.log('✅ Événement userLoggedIn déclenché');
          console.log('✅ Utilisateur stocké dans localStorage:', userData.email);
        } catch (storageError) {
          console.error('❌ Erreur lors du stockage dans localStorage:', storageError);
          // Ne pas bloquer la connexion pour une erreur de localStorage
        }
        
        // DÉTERMINER l'URL de redirection - NE JAMAIS utiliser localhost en production
        // Vérifier TOUTES les sources possibles et forcer le domaine de production
        if (typeof window !== 'undefined') {
          const isProduction = window.location.hostname === 'iahome.fr' || 
                               window.location.hostname === 'www.iahome.fr';
          
          console.log('🔍 === ANALYSE DE LA REDIRECTION ===');
          console.log('🔍 Hostname actuel:', window.location.hostname);
          console.log('🔍 Is Production:', isProduction);
          console.log('🔍 URL complète:', window.location.href);
          console.log('🔍 Search params complets:', window.location.search);
          
          // Récupérer le paramètre redirect de l'URL (mais l'ignorer si c'est localhost en production)
          const redirectParam = searchParams.get('redirect');
          console.log('🔍 Paramètre redirect de l\'URL:', redirectParam);
          
          // Vérifier TOUS les paramètres de l'URL
          const allParams = new URLSearchParams(window.location.search);
          console.log('🔍 Tous les paramètres de l\'URL:');
          allParams.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
          });
          
          let redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/';
          console.log('🔍 redirectUrl initial:', redirectUrl);
          
          // Ne pas nettoyer les données Supabase ici - elles sont nécessaires pour PKCE
          // Le nettoyage sera fait après la redirection réussie
          
          if (isProduction) {
            // EN PRODUCTION: FORCER ABSOLUMENT l'utilisation du domaine iahome.fr
            // Ignorer COMPLÈTEMENT toute URL qui contient localhost ou 127.0.0.1
            console.log('🔒 MODE PRODUCTION - Forçage ABSOLU du domaine iahome.fr');
            console.log('🔍 Vérification de redirectUrl pour localhost...');
            console.log('🔍 redirectUrl avant nettoyage:', redirectUrl);
            
            // Si redirectUrl contient localhost ou 127.0.0.1, l'ignorer COMPLÈTEMENT
            if (redirectUrl.includes('localhost') || redirectUrl.includes('127.0.0.1')) {
              console.log('🚫 URL de redirection localhost détectée et IGNORÉE en production:', redirectUrl);
              redirectUrl = '/'; // Utiliser la page d'accueil par défaut
              console.log('🔧 redirectUrl forcé à "/"');
            }
            
            // Si redirectUrl est une URL absolue, vérifier qu'elle pointe vers iahome.fr
            if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
              try {
                const urlObj = new URL(redirectUrl);
                // Si l'URL absolue pointe vers localhost ou un autre domaine, l'ignorer
                if (urlObj.hostname.includes('localhost') || 
                    urlObj.hostname.includes('127.0.0.1') ||
                    (urlObj.hostname !== 'iahome.fr' && urlObj.hostname !== 'www.iahome.fr')) {
                  console.log('🚫 URL absolue ignorée (hostname:', urlObj.hostname, ')');
                  redirectUrl = '/'; // Utiliser la page d'accueil par défaut
                } else {
                  // URL valide pointant vers iahome.fr, utiliser le chemin seulement
                  redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
                  console.log('🔧 URL absolue convertie en chemin relatif:', redirectUrl);
                }
              } catch (e) {
                // URL invalide, utiliser '/'
                console.log('🔧 URL invalide, utilisation de "/"');
                redirectUrl = '/';
              }
            }
            
            // S'assurer que redirectUrl est un chemin relatif valide
            if (!redirectUrl.startsWith('/')) {
              redirectUrl = '/' + redirectUrl;
            }
            
            console.log('✅ Redirection finale en production (chemin relatif):', redirectUrl);
          } else {
            // En développement, utiliser redirectUrl tel quel
            if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
              // URL absolue, utiliser telle quelle
            } else if (!redirectUrl.startsWith('/')) {
              redirectUrl = '/' + redirectUrl;
            }
          }
          
          setStatus('Redirection vers l\'accueil...');
          
          // LOGS CRITIQUES AVANT REDIRECTION
          console.log('🚀 === DÉBUT DE LA REDIRECTION ===');
          console.log('🚀 isProduction:', isProduction);
          console.log('🚀 redirectUrl final:', redirectUrl);
          console.log('🚀 window.location.hostname:', window.location.hostname);
          console.log('🚀 window.location.protocol:', window.location.protocol);
          
          // REDIRECTION IMMÉDIATE EN PRODUCTION - pas de setTimeout pour éviter toute interférence
          if (isProduction) {
            // EN PRODUCTION: FORCER la redirection avec window.location.replace
            // FORCER https et FORCER le hostname à iahome.fr (pas de variable)
            const finalProtocol = 'https:';
            const forcedHostname = 'iahome.fr'; // FORCER à iahome.fr, ne pas utiliser window.location.hostname
            const fullUrl = `${finalProtocol}//${forcedHostname}${redirectUrl}`;
            
            console.log('🚀 === EXÉCUTION IMMÉDIATE DE LA REDIRECTION ===');
            console.log('🚀 Protocol (forcé https):', finalProtocol);
            console.log('🚀 Hostname actuel:', window.location.hostname);
            console.log('🚀 Hostname FORCÉ:', forcedHostname);
            console.log('🚀 redirectUrl:', redirectUrl);
            console.log('🚀 fullUrl construite:', fullUrl);
            console.log('🚀 Vérification localhost dans fullUrl:', fullUrl.includes('localhost'));
            
            // DERNIÈRE VÉRIFICATION ABSOLUE: remplacer TOUS les localhost par iahome.fr
            let finalRedirectUrl = fullUrl;
            finalRedirectUrl = finalRedirectUrl.replace(/localhost/g, 'iahome.fr');
            finalRedirectUrl = finalRedirectUrl.replace(/127\.0\.0\.1/g, 'iahome.fr');
            finalRedirectUrl = finalRedirectUrl.replace(/http:\/\//g, 'https://');
            
            if (fullUrl !== finalRedirectUrl) {
              console.log('🚨 CORRECTION APPLIQUÉE - localhost remplacé par iahome.fr');
              console.log('🚨 URL originale:', fullUrl);
              console.log('🚨 URL corrigée:', finalRedirectUrl);
            } else {
              console.log('✅ URL valide, redirection normale');
            }
            
            // REDIRECTION IMMÉDIATE - pas de setTimeout
            console.log('🚀 REDIRECTION IMMÉDIATE VERS (URL FINALE):', finalRedirectUrl);
            window.location.replace(finalRedirectUrl);
            return; // Sortir immédiatement pour éviter toute autre exécution
          }
          
          // Pour le développement, utiliser setTimeout
          setTimeout(() => {
            // En développement, utiliser window.location pour les URLs absolues
            if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
              window.location.href = redirectUrl;
            } else {
              router.push(redirectUrl);
            }
          }, 1000);
        } else {
          // Fallback si window n'est pas disponible
        const redirectParam = searchParams.get('redirect');
        const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/';
        setStatus('Redirection vers l\'accueil...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
        }
      } catch (error: any) {
        console.error('❌ Erreur callback:', error);
        console.error('❌ Détails de l\'erreur:', error?.message, error?.stack);
        console.error('❌ Type d\'erreur:', typeof error);
        console.error('❌ Erreur complète:', JSON.stringify(error, null, 2));
        setStatus('Une erreur est survenue. Redirection...');
        
        // Attendre un peu avant de rediriger pour voir les logs
        setTimeout(() => {
          router.push(`/login?error=callback_error&detail=${encodeURIComponent(error?.message || 'Erreur inconnue')}`);
        }, 3000);
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion en cours...</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
