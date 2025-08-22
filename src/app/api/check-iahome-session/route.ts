import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const originalArgs = request.headers.get('x-original-args');
    const originalUri = request.headers.get('x-original-uri');

    let session = null;

    // Méthode 1: Vérifier via token Bearer
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        session = { user };
        }
    }
    
    // Méthode 2: Vérifier via cookies de session
    if (!session && cookieHeader) {
      // Extraire les cookies de session Supabase
      const sessionCookie = cookieHeader
        .split(';')
        .find(cookie => cookie.trim().startsWith('sb-'));
      
      if (sessionCookie) {
        const { data: { session: cookieSession }, error } = await supabase.auth.getSession();
        
        if (!error && cookieSession?.user) {
          session = cookieSession;
          }
      }
    }

    // Méthode 3: Vérifier via paramètre de session (pour les iframes)
    if (!session) {
      const url = new URL(request.url);
      const sessionToken = url.searchParams.get('session_token') || url.searchParams.get('token');
      
      if (sessionToken) {
        const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
        
        if (!error && user) {
          session = { user };
          }
      }
    }

    // Méthode 4: Vérifier via paramètres de l'URL originale (transmis par Nginx)
    if (!session) {
      const originalArgs = request.headers.get('x-original-args');
      const originalQuery = request.headers.get('x-original-query');
      const originalUri = request.headers.get('x-original-uri');
      
      if (originalArgs || originalQuery || originalUri) {
        let queryString = originalArgs || originalQuery || '';
        
        // Si pas de query string, essayer d'extraire depuis l'URI
        if (!queryString && originalUri && originalUri.includes('?')) {
          queryString = originalUri.split('?')[1];
        }
        
        if (queryString) {
          const urlParams = new URLSearchParams(queryString);
          const sessionToken = urlParams.get('session_token') || urlParams.get('token');
          
          if (sessionToken) {
            const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
            
            if (!error && user) {
              session = { user };
              }
          }
        }
      }
    }

    if (session?.user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user'
        },
        message: 'Accès autorisé'
      });
    } else {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Session non valide'
      }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Support pour les requêtes POST (compatibilité)
export async function POST(request: NextRequest) {
  return GET(request);
} 