import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de redirection pour LibreSpeed avec Redirect Rules Cloudflare
 * Cette route est appelée par Redirect Rules Cloudflare quand l'URL n'a pas de token
 * Si un token est présent, on laisse passer la requête vers LibreSpeed
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const hostname = request.headers.get('host') || '';
    
    console.log('🔍 LibreSpeed Redirect - Hostname:', hostname, 'Token:', token ? 'présent' : 'absent');
    
    // Si un token est fourni, laisser passer vers LibreSpeed (via Cloudflare Tunnel)
    if (token) {
      console.log('✅ LibreSpeed: Token présent, laisser passer vers librespeed.iahome.fr');
      // Rediriger vers librespeed.iahome.fr avec le token
      // Cloudflare Tunnel redirigera ensuite vers le service local
      return NextResponse.redirect(`https://librespeed.iahome.fr/?token=${token}`, 302);
    }
    
    // Aucun token - rediriger vers la page d'accueil (protection)
    console.log('🛡️ LibreSpeed: Accès direct bloqué, redirection vers iahome.fr');
    return NextResponse.redirect('https://iahome.fr/account?error=direct_access_denied', 302);

  } catch (error) {
    console.error('❌ LibreSpeed Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/account?error=internal_error', 302);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

