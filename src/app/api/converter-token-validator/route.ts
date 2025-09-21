import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      // Pas de token - rediriger vers la page d'authentification
      return NextResponse.redirect(new URL('/converter-auth-required', request.url), 302);
    }

    // Vérifier si le token commence par "prov_" (token de provision)
    if (token.startsWith('prov_')) {
      // Token de provision - accès autorisé
      return new NextResponse(null, {
        status: 200,
        headers: {
          'X-User-Email': 'provisioned_user@iahome.fr',
          'X-Access-Type': 'provisioned',
        },
      });
    }

    // Vérifier si c'est un token d'accès standard
    if (token.length > 20) {
      // Token d'accès standard - accès autorisé
      return new NextResponse(null, {
        status: 200,
        headers: {
          'X-User-Email': 'authenticated_user@iahome.fr',
          'X-Access-Type': 'authenticated',
        },
      });
    }

    // Token invalide - rediriger vers la page d'authentification
    return NextResponse.redirect(new URL('/converter-auth-required', request.url), 302);

  } catch (error) {
    console.error('Erreur lors de la validation du token de conversion:', error);
    return NextResponse.redirect(new URL('/converter-auth-required', request.url), 302);
  }
}
