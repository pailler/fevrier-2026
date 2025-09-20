import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log('🔍 MeTube Redirect: Token reçu:', token ? token.substring(0, 10) + '...' : 'aucun');
    
    // Si un token est fourni, vérifier s'il est valide
    if (token) {
      // Vérifier si c'est un token provisoire valide
      if (token.startsWith('prov_')) {
        const tokenParts = token.split('_');
        if (tokenParts.length === 3) {
          const timestamp = parseInt(tokenParts[2], 36);
          const now = Date.now();
          const tokenAge = now - timestamp;
          
          // Token provisoire valide pendant 1 heure
          if (tokenAge < 3600000) {
            console.log('✅ MeTube Redirect: Token provisoire valide - autoriser accès direct');
            // Rediriger vers MeTube directement (sans token dans l'URL)
            return NextResponse.redirect('http://metube-secure:80', 302);
          }
        }
      }
      
      // Vérifier si c'est un token d'accès valide
      if (!token.startsWith('prov_')) {
        console.log('✅ MeTube Redirect: Token d\'accès détecté - autoriser accès direct');
        return NextResponse.redirect('http://metube-secure:80', 302);
      }
    }
    
    // Aucun token ou token invalide - rediriger vers la page de connexion
    console.log('❌ MeTube Redirect: Aucun token valide - redirection vers login');
    return NextResponse.redirect('https://iahome.fr/login', 302);

  } catch (error) {
    console.error('❌ MeTube Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/login', 302);
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

