import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Fonction pour obtenir l'origine autorisée
function getAllowedOrigin(origin: string | null): string {
  const allowedOrigins = [
    'https://qrcodes.iahome.fr',
    'https://www.qrcodes.iahome.fr',
    'https://iahome.fr',
    'https://www.iahome.fr',
    'http://localhost:7006',
    'http://localhost:3000',
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // Par défaut, autoriser qrcodes.iahome.fr
  return 'https://qrcodes.iahome.fr';
}

// Gérer les requêtes OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(origin);
  
  const response = new NextResponse(null, {
    status: 200,
  });
  
  // Définir les en-têtes CORS explicitement
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const allowedOrigin = getAllowedOrigin(origin);
    
    const body = await request.json();
    
    console.log(`🔍 QR Dynamic: Redirection vers service Python`);
    
    // Récupérer l'utilisateur depuis les cookies pour enregistrer l'utilisation
    const supabase = createRouteHandlerClient({ cookies });
    let userId: string | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
        console.log('✅ QR Dynamic: Utilisateur authentifié:', userId);
      }
    } catch (authError) {
      console.warn('⚠️ QR Dynamic: Impossible de récupérer l\'utilisateur (génération possible sans auth):', authError);
      // Continuer même sans authentification pour permettre la génération
    }
    
    // Rediriger vers le service Python
    const pythonServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://qrcodes.iahome.fr' 
      : 'http://localhost:7006';
    
    const pythonResponse = await fetch(`${pythonServiceUrl}/api/dynamic/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error('❌ Erreur service Python:', errorText);
      throw new Error(`Service Python error: ${pythonResponse.status}`);
    }
    
    const result = await pythonResponse.json();
    
    // Adapter l'URL de redirection pour utiliser le domaine correct
    if (result.redirect_url) {
      result.redirect_url = result.redirect_url.replace('http://localhost:7006', 'https://qrcodes.iahome.fr');
      result.redirect_url = result.redirect_url.replace('/redirect/', '/r/');
    }
    
    // Incrémenter l'utilisation si l'utilisateur est authentifié
    let shouldResetWorkflow = false;
    if (userId && result.success) {
      try {
        const incrementResponse = await fetch(`${request.nextUrl.origin}/api/increment-qrcodes-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });
        
        if (incrementResponse.ok) {
          const incrementResult = await incrementResponse.json();
          if (incrementResult.shouldResetWorkflow) {
            shouldResetWorkflow = true;
            console.log('⚠️ QR Dynamic: Quota atteint, workflow doit être réinitialisé');
          }
        }
      } catch (incrementError) {
        console.warn('⚠️ QR Dynamic: Erreur lors de l\'incrémentation (non bloquant):', incrementError);
      }
    }
    
    // Ajouter le flag de réinitialisation du workflow
    result.shouldResetWorkflow = shouldResetWorkflow;
    
    // Retourner avec les en-têtes CORS
    const nextResponse = NextResponse.json(result);
    
    // Définir les en-têtes CORS explicitement pour éviter qu'ils soient écrasés
    nextResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    nextResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    nextResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return nextResponse;
    
  } catch (error) {
    console.error('❌ Erreur QR Dynamic:', error);
    const origin = request.headers.get('origin');
    const allowedOrigin = getAllowedOrigin(origin);
    
    const errorResponse = NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
    
    // Définir les en-têtes CORS explicitement pour éviter qu'ils soient écrasés
    errorResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return errorResponse;
  }
}
