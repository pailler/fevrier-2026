import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

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

// Créer le middleware i18n
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Appliquer le middleware i18n en premier
  const response = intlMiddleware(request);
  
  // Continuer avec la logique existante
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  
  // Log pour debug
  console.log('🔍 Middleware appelé - Hostname:', hostname, 'X-Forwarded-Host:', xForwardedHost, 'Pathname:', pathname);

  // Protection LibreSpeed : Si accès via librespeed.iahome.fr
  // Avec Redirect Rules Cloudflare, cette protection est déjà gérée par Redirect Rules
  // Le middleware ne fait que vérifier le token et laisser passer si valide
  const isLibreSpeed = hostname === 'librespeed.iahome.fr' || 
                       hostname.includes('librespeed.iahome.fr') ||
                       xForwardedHost === 'librespeed.iahome.fr' ||
                       xForwardedHost.includes('librespeed.iahome.fr');
  
  if (isLibreSpeed) {
    const token = request.nextUrl.searchParams.get('token');
    
    console.log('🔒 LibreSpeed détecté - Token:', token ? 'présent' : 'absent');
    
    if (token) {
      // Token présent - laisser passer vers LibreSpeed
      // Rewrite vers le service LibreSpeed local via Cloudflare Tunnel
      console.log('✅ LibreSpeed: Token présent, laisser passer vers LibreSpeed');
      // Ne pas rediriger, laisser Cloudflare Tunnel gérer le routage
      // Le service localhost:8085 sera accessible via Cloudflare Tunnel
      return response || NextResponse.next();
    } else {
      // Aucun token - Redirect Rules devrait avoir déjà intercepté
      // Si on arrive ici, c'est que Redirect Rules n'a pas fonctionné
      // Rediriger vers la route de protection
      console.log('🛡️ LibreSpeed: Accès direct bloqué (pas de token), redirection vers iahome.fr');
      return NextResponse.redirect('https://iahome.fr/api/librespeed-redirect', 302);
    }
  }

  // Middleware simplifié pour éviter les boucles infinies
  // Ne fait que les redirections essentielles
  
  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Pour l'instant, rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Bloquer complètement /token-generated AVANT toute autre chose
  if (pathname === '/token-generated') {
    // Retourner une 404 immédiatement, sans passer par le reste du middleware
    return new NextResponse('Page non trouvée', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Réécritures simples pour Socket.IO
  if (pathname.startsWith('/socket.io')) {
    const url = new URL(request.url);
    url.pathname = '/api/proxy-metubesocketio';
    return NextResponse.rewrite(url);
  }

  // Réécriture pour MeTube : router les requêtes vers /add vers le proxy MeTube
  const isMetube = hostname === 'metube.iahome.fr' || 
                   hostname.includes('metube.iahome.fr') ||
                   xForwardedHost === 'metube.iahome.fr' ||
                   xForwardedHost.includes('metube.iahome.fr');
  
  if (isMetube) {
    // Router les requêtes API MeTube vers le proxy
    if (pathname.startsWith('/api/') || pathname === '/add') {
      const url = new URL(request.url);
      // Si c'est /add (POST), router vers /api/proxy-metube/add (pas /api/add car MeTube utilise /add directement)
      if (pathname === '/add') {
        url.pathname = '/api/proxy-metube/add';
      } else if (pathname.startsWith('/api/')) {
        // Router /api/* vers /api/proxy-metube/api/*
        url.pathname = `/api/proxy-metube${pathname}`;
      }
      console.log(`🔄 [MeTube Middleware] Rewrite ${pathname} -> ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    // Router la page principale vers le proxy MeTube
    if (pathname === '/' || pathname === '') {
      const url = new URL(request.url);
      url.pathname = '/api/proxy-metube/';
      console.log(`🔄 [MeTube Middleware] Rewrite / -> /api/proxy-metube/`);
      return NextResponse.rewrite(url);
    }
  }

  return response || NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Also match root path
    '/'
  ],
}; 