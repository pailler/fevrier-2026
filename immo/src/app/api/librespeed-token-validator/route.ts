import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    // Si aucun token n'est fourni, renvoyer une erreur 401
    return new NextResponse('Unauthorized: Token manquant', { status: 401 });
  }

  // Logique de validation du token
  // Pour LibreSpeed, nous acceptons les tokens qui commencent par "prov_"
  // ou qui ont une longueur supérieure à 20 caractères (simulant un JWT ou un token complexe)
  if (token.startsWith('prov_') || token.length > 20) {
    // Token valide, autoriser l'accès
    // Vous pouvez ajouter des en-têtes pour passer des informations à l'application backend
    const headers = new Headers();
    headers.set('X-User-Email', 'authenticated_librespeed_user@iahome.fr');
    headers.set('X-Access-Type', 'token_validated');
    return new NextResponse('OK', { status: 200, headers });
  } else {
    // Token invalide
    return new NextResponse('Unauthorized: Token invalide', { status: 401 });
  }
}