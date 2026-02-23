import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de redirection pour PDF avec Redirect Rules Cloudflare
 * Cette route est appelée par Redirect Rules Cloudflare quand l'URL n'a pas de token
 * Si un token est présent, on laisse passer la requête vers PDF
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const hostname = request.headers.get('host') || '';
    const xForwardedHost = request.headers.get('x-forwarded-host') || '';
    const referer = request.headers.get('referer') || '';
    const xOriginalUri = request.headers.get('x-original-uri') || '';
    const xForwardedUri = request.headers.get('x-forwarded-uri') || '';
    
    // Logs détaillés pour debug
    console.log('🔍 PDF Redirect - URL complète:', url.toString());
    console.log('🔍 PDF Redirect - Hostname:', hostname);
    console.log('🔍 PDF Redirect - X-Forwarded-Host:', xForwardedHost);
    console.log('🔍 PDF Redirect - Referer:', referer);
    console.log('🔍 PDF Redirect - X-Original-Uri:', xOriginalUri);
    console.log('🔍 PDF Redirect - X-Forwarded-Uri:', xForwardedUri);
    console.log('🔍 PDF Redirect - Token dans URL:', token ? `présent (${token.substring(0, 20)}...)` : 'absent');
    console.log('🔍 PDF Redirect - Tous les headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
    
    // Si un token est fourni directement dans l'URL, laisser passer vers PDF
    if (token) {
      console.log('✅ PDF: Token présent dans URL, redirection vers pdf.iahome.fr');
      return NextResponse.redirect(`https://pdf.iahome.fr/?token=${token}`, 302);
    }
    
    // Essayer d'extraire le token de l'URL originale si Traefik l'a passée dans un header
    const originalUrl = xOriginalUri || xForwardedUri || referer;
    if (originalUrl) {
      try {
        const originalUrlObj = originalUrl.startsWith('http') 
          ? new URL(originalUrl) 
          : new URL(`https://${xForwardedHost || hostname}${originalUrl}`);
        const originalToken = originalUrlObj.searchParams.get('token');
        
        if (originalToken) {
          console.log('✅ PDF: Token trouvé dans URL originale, redirection vers pdf.iahome.fr');
          return NextResponse.redirect(`https://pdf.iahome.fr/?token=${originalToken}`, 302);
        }
      } catch (e) {
        console.log('⚠️ PDF: Erreur parsing URL originale:', e);
      }
    }
    
    // Aucun token trouvé - rediriger vers la page d'accueil (protection)
    console.log('🛡️ PDF: Accès direct bloqué, aucun token trouvé, redirection vers iahome.fr');
    return NextResponse.redirect('https://iahome.fr/account?error=direct_access_denied', 302);

  } catch (error) {
    console.error('❌ PDF Redirect Error:', error);
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


