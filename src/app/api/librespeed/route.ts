import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('LibreSpeed Direct: Début de la vérification');
    
    // Vérifier que la requête vient bien de iahome.fr
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('LibreSpeed Direct: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('LibreSpeed Direct: Accès direct bloqué - redirection vers iahome.fr');
      return NextResponse.redirect('https://iahome.fr/encours', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('LibreSpeed Direct: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Créer un client Supabase avec les cookies
    const supabaseWithCookies = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            cookie: cookieHeader,
          },
        },
      }
    );

    // Vérifier la session
    const { data: { session }, error } = await supabaseWithCookies.auth.getSession();
    
    if (error) {
      console.error('LibreSpeed Direct: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('LibreSpeed Direct: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si l'utilisateur a accès au module LibreSpeed
    const hasLibreSpeedAccess = await checkLibreSpeedAccess(session.user.id);
    
    if (!hasLibreSpeedAccess) {
      console.log('LibreSpeed Direct: Accès au module LibreSpeed refusé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/encours', 302);
    }

    // Vérifier si le module apparaît dans /encours
    const isModuleActive = await checkModuleInEncours(session.user.id);
    
    if (!isModuleActive) {
      console.log('LibreSpeed Direct: Module LibreSpeed non actif dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/encours', 302);
    }
    
    console.log('LibreSpeed Direct: Accès autorisé pour utilisateur:', session.user.email);
    
    // Construire l'URL de LibreSpeed
    const librespeedUrl = `http://172.24.0.6:80/`;
    
    console.log('LibreSpeed Direct: Proxying vers:', librespeedUrl);
    
    // Faire la requête vers LibreSpeed
    const response = await fetch(librespeedUrl, {
      method: request.method,
      headers: {
        'Host': 'librespeed.iahome.fr',
        'User-Agent': request.headers.get('user-agent') || 'LibreSpeed-Proxy',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error('LibreSpeed Direct: Erreur de réponse de LibreSpeed:', response.status, response.statusText);
      return new NextResponse('LibreSpeed Service Error', { status: response.status });
    }

    // Récupérer le contenu de la réponse
    const content = await response.text();
    
    // Créer une nouvelle réponse avec le contenu de LibreSpeed
    const newResponse = new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-User-Id': session.user.id,
        'X-User-Email': session.user.email || 'unknown@example.com',
        'X-User-Name': session.user.user_metadata?.full_name || 'Utilisateur',
      }
    });

    return newResponse;

  } catch (error) {
    console.error('LibreSpeed Direct Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Gérer les autres méthodes HTTP
export async function POST(request: NextRequest) {
  return GET(request);
}

export async function PUT(request: NextRequest) {
  return GET(request);
}

export async function DELETE(request: NextRequest) {
  return GET(request);
}

export async function PATCH(request: NextRequest) {
  return GET(request);
}

// Fonction pour vérifier l'accès au module LibreSpeed
async function checkLibreSpeedAccess(userId: string): Promise<boolean> {
  try {
    // TODO: Implémenter la vérification réelle de l'accès au module
    // Cela pourrait être une vérification en base de données Supabase
    // Pour l'instant, on simule un accès autorisé
    console.log('LibreSpeed Direct: Vérification accès module pour utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('LibreSpeed Direct: Erreur vérification accès module:', error);
    return false;
  }
}

// Fonction pour vérifier si le module apparaît dans /encours
async function checkModuleInEncours(userId: string): Promise<boolean> {
  try {
    // TODO: Implémenter la vérification réelle du module dans /encours
    // Cela pourrait être une vérification de l'état du module en base de données
    // Pour l'instant, on simule un module actif
    console.log('LibreSpeed Direct: Vérification module dans /encours pour utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('LibreSpeed Direct: Erreur vérification module /encours:', error);
    return false;
  }
}
