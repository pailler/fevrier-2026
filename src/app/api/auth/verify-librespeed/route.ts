import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est connecté
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');
    
    if (!sessionToken) {
      console.log('LibreSpeed Auth: Aucune session trouvée');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Vérifier la session côté serveur (vous devrez adapter selon votre système d'auth)
    // Pour l'instant, on simule une vérification basique
    const isValidSession = await verifySession(sessionToken.value);
    
    if (!isValidSession) {
      console.log('LibreSpeed Auth: Session invalide');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Vérifier si l'utilisateur a accès au module LibreSpeed
    const hasLibreSpeedAccess = await checkLibreSpeedAccess(sessionToken.value);
    
    if (!hasLibreSpeedAccess) {
      ;
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Vérifier si le module apparaît dans /encours
    const isModuleActive = await checkModuleInEncours(sessionToken.value);
    
    if (!isModuleActive) {
      ;
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Vérifier que la requête vient bien de iahome.fr
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr')) {
      console.log('LibreSpeed Auth: Accès direct bloqué - referer:', referer, 'origin:', origin);
      return new NextResponse('Forbidden', { status: 403 });
    }

    console.log('LibreSpeed Auth: Accès autorisé');
    
    // Retourner les headers utilisateur pour LibreSpeed
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'X-User-Id': 'user123', // À remplacer par l'ID réel
        'X-User-Email': 'user@example.com', // À remplacer par l'email réel
        'X-User-Name': 'Utilisateur', // À remplacer par le nom réel
      }
    });

  } catch (error) {
    console.error('LibreSpeed Auth Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier la session (à adapter selon votre système)
async function verifySession(sessionToken: string): Promise<boolean> {
  // TODO: Implémenter la vérification réelle de la session
  // Pour l'instant, on accepte toutes les sessions
  return true;
}

// Fonction pour vérifier l'accès au module LibreSpeed
async function checkLibreSpeedAccess(sessionToken: string): Promise<boolean> {
  // TODO: Vérifier si l'utilisateur a souscrit au module LibreSpeed
  // Cela pourrait être une vérification en base de données
  return true;
}

// Fonction pour vérifier si le module apparaît dans /encours
async function checkModuleInEncours(sessionToken: string): Promise<boolean> {
  // TODO: Vérifier si le module LibreSpeed est actif et apparaît dans /encours
  // Cela pourrait être une vérification de l'état du module
  return true;
}
