import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log('🔍 LibreSpeed Redirect: Token complet:', token);
    
    // Si un token est fourni, autoriser l'accès
    if (token) {
      return NextResponse.redirect('http://192.168.1.150:8083', 302);
    }
    
    // Aucun token ou token invalide - rediriger vers la page de connexion
    return NextResponse.redirect('https://iahome.fr/login', 302);

  } catch (error) {
    console.error('❌ LibreSpeed Redirect Error:', error);
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
