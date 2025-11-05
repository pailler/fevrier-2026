import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '../../../utils/sessionDurationCheck';

const DEFAULT_TOKEN_DURATION_MS = 24 * 60 * 60 * 1000; // 24h pour admin
const LIMITED_TOKEN_DURATION_MS = 60 * 60 * 1000; // 60 minutes pour utilisateurs normaux

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const cleanBody = body.replace(/\\"/g, '"');
    const { userId, userEmail, moduleId } = JSON.parse(cleanBody);

    if (!userId || !userEmail || !moduleId) {
      return NextResponse.json(
        { error: 'userId, userEmail et moduleId sont requis' },
        { status: 400 }
      );
    }

    // Déterminer la durée du token selon si l'utilisateur est admin
    const tokenDuration = isAdminUser(userEmail) ? DEFAULT_TOKEN_DURATION_MS : LIMITED_TOKEN_DURATION_MS;
    const tokenDurationSeconds = Math.floor(tokenDuration / 1000);

    // Créer un token simple (Base64)
    const tokenPayload = {
      userId,
      userEmail,
      moduleId,
      moduleTitle: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
      accessLevel: 'premium',
      expiresAt: Date.now() + tokenDuration,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + tokenDurationSeconds
    };

    const token = btoa(JSON.stringify(tokenPayload));

    // Retourner l'URL du proxy sécurisé
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const secureProxyUrl = `${baseUrl}/api/secure-proxy?token=${token}&module=${moduleId}`;
    
    return NextResponse.json({
      success: true,
      token,
      moduleId,
      moduleTitle: tokenPayload.moduleTitle,
      cost: 10, // Coût fixe pour tous les modules essentiels
      url: secureProxyUrl,
      expiresAt: tokenPayload.expiresAt
    });

  } catch (error) {
    console.error('Erreur génération token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
