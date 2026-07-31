'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAdminEmail } from '@/utils/adminEmails';
import {
  completeOAuthFromUrl,
  consumePostLoginRedirect,
} from '@/utils/oauthCallback';
import { sanitizeReturnPath } from '@/utils/loginRedirect';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Vérification de votre connexion...');

  useEffect(() => {
    let cancelled = false;

    const finishWithError = (message: string, errorCode: string) => {
      if (cancelled) return;
      setStatus(message);
      setTimeout(() => {
        router.push(
          `/login?error=${encodeURIComponent(errorCode)}&detail=${encodeURIComponent(message)}`
        );
      }, 1500);
    };

    const handleAuth = async () => {
      try {
        setStatus('Récupération de votre session...');

        const oauthResult = await completeOAuthFromUrl();
        if (cancelled) return;

        if (oauthResult.ok === false) {
          console.error('❌ OAuth callback:', oauthResult.error);
          finishWithError(oauthResult.error, oauthResult.code || 'oauth_error');
          return;
        }

        const session = oauthResult.session;
        const user = session.user;
        console.log('✅ Session OAuth:', user.email);

        setStatus('Synchronisation de votre compte...');
        try {
          const syncResponse = await fetch('/api/auth/sync-oauth-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              authUserId: user.id,
              email: user.email,
              name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
            }),
          });
          if (!syncResponse.ok) {
            console.warn('⚠️ sync-oauth-profile:', await syncResponse.text().catch(() => ''));
          }
        } catch (syncErr) {
          console.warn('⚠️ sync-oauth-profile:', syncErr);
        }

        setStatus('Finalisation de votre connexion...');

        let profileData: Record<string, unknown> | null = null;
        try {
          const profileResponse = await fetch('/api/auth/get-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email }),
          });
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
          }
        } catch {
          // fallback Supabase ci-dessous
        }

        const userEmail = String(profileData?.email || user.email || '');
        const userData = {
          id: String(profileData?.id || user.id),
          email: userEmail,
          full_name: String(
            profileData?.full_name || user.user_metadata?.full_name || userEmail
          ),
          role: isAdminEmail(userEmail) ? 'admin' : String(profileData?.role || 'user'),
          is_active: profileData?.is_active !== false,
          email_verified: profileData?.email_verified !== false,
          avatar_url: user.user_metadata?.avatar_url || null,
        };

        let jwtToken: string | null = session.access_token;
        try {
          const tokenResponse = await fetch('/api/auth/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              email: userData.email,
              role: userData.role,
            }),
          });
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            jwtToken = tokenData.token || jwtToken;
          }
        } catch {
          // token Supabase en fallback
        }

        fetch('/api/initialize-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id, userEmail: userData.email }),
        }).catch(() => {});

        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('session_start_time');
          localStorage.setItem('user_data', JSON.stringify(userData));
          if (jwtToken) localStorage.setItem('auth_token', jwtToken);
          localStorage.setItem('session_start_time', Date.now().toString());
          window.dispatchEvent(new Event('userLoggedIn'));
        } catch (storageErr) {
          console.error('❌ localStorage:', storageErr);
        }

        const rawRedirect = consumePostLoginRedirect(searchParams);
        let redirectUrl = sanitizeReturnPath(rawRedirect);

        if (typeof window !== 'undefined') {
          const isProduction =
            window.location.hostname === 'iahome.fr' ||
            window.location.hostname === 'www.iahome.fr';

          if (isProduction) {
            if (
              redirectUrl.includes('localhost') ||
              redirectUrl.includes('127.0.0.1')
            ) {
              redirectUrl = '/';
            }
            if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
              try {
                const urlObj = new URL(redirectUrl);
                if (
                  urlObj.hostname.includes('localhost') ||
                  urlObj.hostname.includes('127.0.0.1') ||
                  (urlObj.hostname !== 'iahome.fr' && urlObj.hostname !== 'www.iahome.fr')
                ) {
                  redirectUrl = '/';
                } else {
                  redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
                }
              } catch {
                redirectUrl = '/';
              }
            }
            if (!redirectUrl.startsWith('/')) redirectUrl = `/${redirectUrl}`;

            setStatus('Redirection...');
            window.location.replace(`https://iahome.fr${redirectUrl}`);
            return;
          }

          setStatus('Redirection...');
          if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
            window.location.href = redirectUrl;
          } else {
            router.replace(redirectUrl);
          }
          return;
        }

        router.replace(redirectUrl);
      } catch (error) {
        console.error('❌ Erreur callback OAuth:', error);
        finishWithError(
          error instanceof Error ? error.message : 'Erreur inconnue',
          'callback_error'
        );
      }
    };

    void handleAuth();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion en cours...</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
