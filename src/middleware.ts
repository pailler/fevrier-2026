import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/stablediffusion-proxy',
  '/stablediffusion-direct',
  '/stablediffusion-iframe',
  '/stablediffusion-iframe-secure',
  '/stablediffusion-simple',
  '/stablediffusion-redirect',
  '/simple-stablediffusion',
  '/module',
  '/modules-access',
  '/secure-access',
  '/admin/dashboard'
];

// Routes API protégées
const protectedApiRoutes = [
  '/api/stablediffusion-proxy',
  '/api/direct-stablediffusion',
  '/api/proxy-stablediffusion',
  '/api/module-access',
  '/api/secure-proxy',
  '/api/admin/statistics'
];

// IPs autorisées pour l'accès direct
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost pour le développement
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

// Routes à protéger
const PROTECTED_ROUTES = [
  '/api/proxy-ruinedfooocus',
  '/ruinedfooocus',
  '/gradio-access'
];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const url = new URL(request.url);
    const hostname = request.headers.get('host') || '';

    // Exceptions pour les APIs qui ne doivent pas être interceptées
    if (pathname === '/api/librespeed-token' || 
        pathname === '/api/check-librespeed-access' || 
        pathname === '/api/increment-librespeed-access' ||
        pathname === '/api/user-tokens' ||
        pathname === '/api/test-tokens' ||
        pathname === '/api/test-simple' ||
        pathname.startsWith('/api/user-tokens') ||
        pathname.startsWith('/api/test-tokens') ||
        pathname.startsWith('/api/test-simple')) {
      return NextResponse.next();
    }

    // Gestion spéciale pour librespeed.iahome.fr
    console.log('🔍 Middleware: hostname=', hostname, 'pathname=', pathname);
    if (hostname === 'librespeed.iahome.fr' && pathname === '/') {
      console.log('🎯 Middleware: Interception librespeed.iahome.fr');
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      console.log('🔑 Middleware: Token trouvé =', token ? 'OUI' : 'NON');
      
      // Si un token est présent, valider le token et autoriser l'accès
      if (token) {
        try {
          // Valider le token d'accès LibreSpeed
          const response = await fetch(`${request.nextUrl.origin}/api/validate-librespeed-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Rediriger vers la page de redirection directe LibreSpeed
            const libreSpeedDirectUrl = new URL('/librespeed-direct', request.url);
            libreSpeedDirectUrl.searchParams.set('token', token);
            return NextResponse.redirect(libreSpeedDirectUrl);
          }
        } catch (error) {
          console.error('Erreur validation token LibreSpeed:', error);
        }
      }
      
      // Si pas de token ou token invalide, rediriger vers la page de login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/librespeed');
      return NextResponse.redirect(loginUrl);
    }

    // Intercepter les réponses HTML pour nettoyer les preloads
    if (request.headers.get('accept')?.includes('text/html')) {
      try {
        const originalResponse = await fetch(request);
        if (originalResponse.ok) {
          const html = await originalResponse.text();
          
          // Supprimer les preloads de polices Geist
          const cleanedHtml = html
            .replace(/<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*geist[^"]*"[^>]*>/gi, '')
            .replace(/<link[^>]*rel="preload"[^>]*as="image"[^>]*href="[^"]*og-image[^"]*"[^>]*>/gi, '')
            .replace(/<link[^>]*rel="preload"[^>]*as="font"[^>]*href="[^"]*\.woff2[^"]*"[^>]*>/gi, '');
          
          const response = new NextResponse(cleanedHtml, {
            status: originalResponse.status,
            statusText: originalResponse.statusText,
            headers: originalResponse.headers,
          });
          
          // Ajouter des headers pour corriger les types MIME
          response.headers.set('X-Preload-Cleaner', 'enabled');
          response.headers.set('X-Content-Type-Options', 'nosniff');
          response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
          
          return response;
        }
      } catch (error) {
        console.error('Erreur lors du nettoyage des preloads:', error);
      }
    }

  // Ne jamais interférer avec la racine
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Réécritures rapides pour Socket.IO (alias sans point)
  if (pathname.startsWith('/api/proxy-metubesocket.io')) {
    url.pathname = pathname.replace('/api/proxy-metubesocket.io', '/api/proxy-metubesocketio');
    return NextResponse.rewrite(url);
  }
  if (pathname.startsWith('/socket.io')) {
    // Rediriger les appels Engine.IO par défaut vers notre proxy alias
    url.pathname = '/api/proxy-metubesocketio';
    return NextResponse.rewrite(url);
  }

  // Réécriture des appels API absolus émis par l'UI Metube intégrée
  // Exemple: /api/add, /api/jobs, etc. vers notre proxy /api/proxy-metube/api/...
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/proxy-') &&
    !pathname.startsWith('/api/assets/') &&
    !pathname.startsWith('/api/version')
  ) {
    const referer = request.headers.get('referer') || '';
    if (referer.includes('/api/proxy-metube')) {
      url.pathname = `/api/proxy-metube${pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  // Récupérer le token d'authentification
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  let session = null;
  let user = null;

  // Essayer de récupérer la session depuis les cookies
  if (cookieHeader) {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session = currentSession;
      user = currentSession?.user || null;
    } catch (error) {
      }
  }

  // Si pas de session, vérifier le token d'accès dans l'URL
  if (!session && !user) {
    const url = new URL(request.url);
    const accessToken = url.searchParams.get('token');
    
    if (accessToken) {
      try {
        // Valider le token d'accès (magic link)
        const response = await fetch(`${request.nextUrl.origin}/api/validate-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken }),
        });

        if (response.ok) {
          const data = await response.json();
          // Ajouter les informations d'authentification aux headers
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', data.magicLinkData.userId);
          requestHeaders.set('x-module-name', data.magicLinkData.moduleName);
          requestHeaders.set('x-access-token', accessToken);
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        } else {
          }
      } catch (error) {
        }
    }
  }

  // Si pas d'authentification valide, rediriger vers la page de connexion
  if (!session && !user) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier les abonnements pour les modules payants
  if (user && isProtectedRoute) {
    const moduleName = getModuleNameFromPath(pathname);
    if (moduleName) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/check-subscription?module=${moduleName}&userId=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (!data.hasActiveSubscription) {
            if (isProtectedApiRoute) {
              return NextResponse.json(
                { error: 'Abonnement requis pour accéder à ce module' },
                { status: 403 }
              );
            }

            const subscriptionUrl = new URL('/abonnements', request.url);
            subscriptionUrl.searchParams.set('module', moduleName);
            return NextResponse.redirect(subscriptionUrl);
          }
        }
      } catch (error) {
        }
    }
  }

  // Vérifier si la route est protégée
  const isProtectedRouteIP = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRouteIP) {
        // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    // Vérifier si l'IP est autorisée
    const isAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isAllowed) {
      // Rediriger vers une page d'erreur ou d'authentification
      const errorUrl = new URL('/access-denied', request.url);
      errorUrl.searchParams.set('reason', 'ip_restricted');
      errorUrl.searchParams.set('requested_path', pathname);
      
      return NextResponse.redirect(errorUrl);
    }
    
    }

  return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // En cas d'erreur, rediriger vers une page d'erreur ou continuer
    return NextResponse.next();
  }
}

function getModuleNameFromPath(pathname: string): string | null {
  if (pathname.includes('module')) return 'module';
  return null;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'
  ],
}; 