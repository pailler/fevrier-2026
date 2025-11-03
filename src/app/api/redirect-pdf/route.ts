import { NextRequest, NextResponse } from 'next/server';

/**
 * Route proxy pour PDF - Identique à LibreSpeed
 * Vérifie le token et proxifie vers le service PDF si valide
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log('🔍 PDF Redirect - Token:', token ? 'présent' : 'absent');
    
    // Si un token est fourni, proxifier vers PDF
    if (token) {
      console.log('✅ PDF: Token présent, proxification vers service PDF');
      
      // URL du service PDF (accessible depuis le container)
      const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://host.docker.internal:8086';
      const targetUrl = `${pdfServiceUrl}${url.pathname}${url.search}`;
      
      console.log('🔗 PDF Proxy vers:', targetUrl);
      
      // Proxifier la requête vers le service PDF
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'Host': 'pdf.iahome.fr',
          'User-Agent': request.headers.get('user-agent') || 'IAHome-PDF-Proxy',
          'Accept': request.headers.get('accept') || '*/*',
        },
        redirect: 'follow',
      });
      
      // Récupérer le contenu
      const contentType = response.headers.get('content-type') || 'text/html';
      const content = await response.text();
      
      // Retourner le contenu avec les headers appropriés
      return new NextResponse(content, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'X-Proxy-By': 'IAHome-PDF-Proxy',
        },
      });
    }
    
    // Aucun token - rediriger vers la page d'accueil (protection)
    console.log('🛡️ PDF: Accès direct bloqué, redirection vers iahome.fr');
    return NextResponse.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);

  } catch (error) {
    console.error('❌ PDF Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/encours?error=internal_error', 302);
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
