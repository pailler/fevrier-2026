import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Middleware simplifié pour éviter les boucles infinies
  // Ne fait que les redirections essentielles
  
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

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Pour l'instant, rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Réécritures simples pour Socket.IO
  if (pathname.startsWith('/socket.io')) {
    const url = new URL(request.url);
    url.pathname = '/api/proxy-metubesocketio';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'
  ],
};




