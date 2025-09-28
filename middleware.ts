import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Configuration CORS pour les APIs Whisper
  if (request.nextUrl.pathname.startsWith('/api/whisper-upload')) {
    const response = NextResponse.next();
    
    // Headers CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Gestion des requêtes OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Vérifier la taille du contenu pour les requêtes POST
    if (request.method === 'POST') {
      const contentLength = request.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        const maxSize = 100 * 1024 * 1024; // 100MB
        
        if (size > maxSize) {
          return new Response(
            JSON.stringify({ 
              error: 'Fichier trop volumineux', 
              maxSize: '100MB',
              receivedSize: `${(size / 1024 / 1024).toFixed(1)}MB`
            }),
            {
              status: 413,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }
      }
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/whisper-upload/:path*',
  ],
};
