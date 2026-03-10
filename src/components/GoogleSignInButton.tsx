'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
  redirectUrl?: string;
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  className = "",
  redirectUrl
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Déterminer l'URL de base correcte
      // EN PRODUCTION: TOUJOURS utiliser https://iahome.fr/auth/callback (PRIORITÉ ABSOLUE)
      // Ne JAMAIS utiliser localhost en production, même si redirectUrl le contient
      let baseRedirectUrl: string;
      
      if (typeof window !== 'undefined') {
        // Vérifier le hostname pour détecter la production (priorité absolue)
        const hostname = window.location.hostname;
        const isProductionDomain = hostname === 'iahome.fr' || hostname === 'www.iahome.fr';
        
        if (isProductionDomain) {
          // Domaine canonique forcé par le middleware (www → iahome.fr), donc l'utilisateur est toujours sur iahome.fr.
          // Callback fixe = même origine que la page = code_verifier disponible.
          baseRedirectUrl = 'https://iahome.fr/auth/callback';
          console.log('🔒 PRODUCTION - Redirect canonique (PKCE):', baseRedirectUrl);
        } else {
          // En développement, utiliser redirectUrl ou l'origin actuel
          if (redirectUrl && !redirectUrl.includes('localhost')) {
            baseRedirectUrl = redirectUrl.includes('/auth/callback') ? redirectUrl : `${redirectUrl}/auth/callback`;
          } else {
            baseRedirectUrl = `${window.location.origin}/auth/callback`;
          }
        }
      } else if (process.env.NEXT_PUBLIC_BASE_URL) {
        // Vérifier si NEXT_PUBLIC_BASE_URL contient localhost
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
          // Si NEXT_PUBLIC_BASE_URL est localhost, forcer iahome.fr (probablement en production)
          baseRedirectUrl = 'https://iahome.fr/auth/callback';
          console.log('🔒 NEXT_PUBLIC_BASE_URL contient localhost - URL forcée à iahome.fr');
        } else {
          baseRedirectUrl = `${baseUrl}/auth/callback`;
        }
      } else {
        // Fallback par défaut (production)
        baseRedirectUrl = 'https://iahome.fr/auth/callback';
      }
      
      console.log('🔍 Connexion Google - Redirect URL:', baseRedirectUrl);
      console.log('🔍 Hostname actuel:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
      console.log('🔍 NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
      console.log('🔍 redirectUrl prop:', redirectUrl);
      
      // Vérifier que le client Supabase est bien initialisé
      if (!supabase) {
        console.error('❌ Client Supabase non initialisé');
        throw new Error('Client Supabase non initialisé');
      }
      
      // Stocker l'URL de redirection pour la récupérer dans le callback OAuth
      // (le paramètre redirect de l'URL login n'est pas préservé lors du flux OAuth)
      if (redirectUrl) {
        sessionStorage.setItem('auth_redirect', redirectUrl);
        console.log('ℹ️ URL de redirection sauvegardée:', redirectUrl);
      }

      // IMPORTANT: NE PAS faire signOut() avant OAuth car cela supprime le code_verifier PKCE
      // Le code_verifier est nécessaire pour échanger le code OAuth
      // Si une session existe, Supabase la remplacera automatiquement lors de la nouvelle connexion
      console.log('ℹ️ Préservation de toute session existante pour éviter la suppression du code_verifier');
      
      // Nettoyer UNIQUEMENT les données personnalisées (pas Supabase)
      // NE JAMAIS toucher aux données Supabase (sb-*) car elles contiennent le code_verifier
      try {
        // Nettoyer seulement les clés personnalisées
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('session_start_time');
        
        // IMPORTANT: NE JAMAIS nettoyer les données Supabase (sb-*) avant OAuth
        // Le code_verifier PKCE est stocké dans localStorage par Supabase et est CRITIQUE
        // Il est stocké AVANT la redirection OAuth et est nécessaire pour échanger le code
        console.log('ℹ️ Préservation des données Supabase pour PKCE (code_verifier nécessaire)');
        
        // Vérifier que les données Supabase sont présentes
        const supabaseStorageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
        const supabaseData = localStorage.getItem(supabaseStorageKey);
        if (supabaseData) {
          console.log('✅ Données Supabase présentes dans localStorage');
        } else {
          console.log('ℹ️ Pas de données Supabase dans localStorage (normal pour première connexion)');
        }
        
        // Nettoyer sessionStorage seulement
        try {
          sessionStorage.removeItem('session_expired_redirected');
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('auth') && !key.includes('supabase')) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (sessionError) {
          // Ignorer les erreurs de sessionStorage
        }
        
        // NE PAS supprimer l'instance Supabase - elle est nécessaire pour OAuth
        // L'instance sera réutilisée pour le callback
      } catch (e) {
        console.warn('⚠️ Impossible de nettoyer le localStorage:', e);
      }
      
      // Appel à signInWithOAuth avec gestion améliorée
      console.log('🔄 Appel à signInWithOAuth...');
      console.log('🔄 URL de redirection:', baseRedirectUrl);
      
      // IMPORTANT: Vérifier que le code_verifier sera stocké AVANT la redirection
      // Supabase stocke le code_verifier dans localStorage AVANT de rediriger vers Google
      // Il est stocké avec la clé: sb-{project-ref}-auth-token
      // Le code_verifier est lié à l'URL de redirection, donc elle doit être cohérente
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: baseRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false, // S'assurer que la redirection n'est pas ignorée
        }
      });
      
      // Vérifier que le code_verifier a été stocké après l'appel (avant la redirection)
      if (data?.url) {
        const storageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
        const storedData = localStorage.getItem(storageKey);
        const hasCodeVerifier = storedData && (storedData.includes('code_verifier') || storedData.includes('codeVerifier'));
        console.log('🔍 Code verifier stocké après signInWithOAuth:', hasCodeVerifier ? 'Oui' : 'Non');
        if (!hasCodeVerifier) {
          console.warn('⚠️ Code verifier non stocké - cela peut causer des problèmes au callback');
          console.warn('⚠️ Vérifiez que l\'URL de redirection est correcte:', baseRedirectUrl);
        }
      }

      if (error) {
        console.error('❌ Erreur de connexion Google:', error);
        onError?.(error);
        setLoading(false);
        return;
      }
      
      // Vérifier que data.url existe et forcer la redirection si nécessaire
      if (data?.url) {
        console.log('✅ URL OAuth générée par Supabase');
        console.log('🔍 URL complète (premiers 200 caractères):', data.url.substring(0, 200) + '...');
        
        // Analyser l'URL pour vérifier si elle contient des références à localhost
        try {
          const urlObj = new URL(data.url);
          console.log('🔍 Analyse de l\'URL OAuth:');
          console.log('   - Hostname:', urlObj.hostname);
          console.log('   - Search params:', urlObj.search);
          console.log('   - Hash:', urlObj.hash);
          
          // Vérifier les paramètres de l'URL
          const urlParams = new URLSearchParams(urlObj.search);
          urlParams.forEach((value, key) => {
            console.log(`   - Paramètre ${key}: ${value}`);
            // Si un paramètre contient localhost, le corriger
            if (value.includes('localhost') || value.includes('127.0.0.1')) {
              console.log(`   ⚠️ Paramètre ${key} contient localhost: ${value}`);
            }
          });
          
          // Si on est en production et que l'URL contient localhost, la corriger
          if (typeof window !== 'undefined') {
            const isProduction = window.location.hostname === 'iahome.fr' || 
                                 window.location.hostname === 'www.iahome.fr';
            
            if (isProduction && (data.url.includes('localhost') || data.url.includes('127.0.0.1'))) {
              console.log('🔧 Correction de l\'URL OAuth contenant localhost...');
              // Remplacer localhost par iahome.fr dans l'URL
              let correctedUrl = data.url.replace(/http:\/\/localhost:\d+/g, 'https://iahome.fr');
              correctedUrl = correctedUrl.replace(/https:\/\/localhost:\d+/g, 'https://iahome.fr');
              correctedUrl = correctedUrl.replace(/localhost/g, 'iahome.fr');
              correctedUrl = correctedUrl.replace(/127\.0\.0\.1/g, 'iahome.fr');
              console.log('🔧 URL corrigée:', correctedUrl.substring(0, 200) + '...');
              data.url = correctedUrl;
            }
          }
        } catch (urlError) {
          console.warn('⚠️ Erreur lors de l\'analyse de l\'URL:', urlError);
        }
        
        // Vérifier que l'URL est valide
        if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
          console.error('❌ URL de redirection invalide:', data.url);
          onError?.(new Error('URL de redirection invalide'));
          setLoading(false);
          return;
        }
        
        // Attendre un court délai pour s'assurer que tout est prêt
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Forcer la redirection manuellement pour s'assurer qu'elle se fait
        // Utiliser window.location.replace pour éviter que l'utilisateur puisse revenir en arrière
        console.log('🔄 Redirection vers l\'URL OAuth...');
        window.location.replace(data.url);
      } else {
        console.error('❌ Aucune URL de redirection retournée par Supabase');
        console.error('❌ Data reçue:', data);
        console.error('❌ Error:', error);
        
        // Si pas d'URL mais pas d'erreur non plus, réessayer une fois
        if (!error) {
          console.log('🔄 Pas d\'URL mais pas d\'erreur, réessai...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const retryResult = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: baseRedirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
          });
          
          if (retryResult.data?.url) {
            console.log('✅ URL OAuth générée au deuxième essai');
            window.location.replace(retryResult.data.url);
            return;
          }
        }
        
        onError?.(new Error('Aucune URL de redirection retournée'));
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      onError?.(error);
      setLoading(false);
    }
  };20

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`
        w-full flex items-center justify-center px-4 py-3 border border-gray-300 
        rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 hover:shadow-md
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
          Connexion en cours...
        </div>
      ) : (
        <div className="flex items-center">
          {/* Logo Google */}
          <svg 
            className="w-5 h-5 mr-3" 
            viewBox="0 0 24 24"
          >
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA433445" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Se connecter avec Google
        </div>
      )}
    </button>
  );
}