import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

// Configuration des applications avec leurs coûts en tokens
const APPLICATION_CONFIG = {
  // Applications IA (100 tokens)
  'whisper': { cost: 100, url: 'https://whisper.iahome.fr' },
  'stablediffusion': { cost: 100, url: 'https://stablediffusion.iahome.fr' },
  'ruinedfooocus': { cost: 100, url: 'https://ruinedfooocus.iahome.fr' },
  'comfyui': { cost: 100, url: 'https://comfyui.iahome.fr' },
  
  // Applications essentielles (10 tokens)
  'metube': { cost: 10, url: 'https://metube.iahome.fr' },
  'librespeed': { cost: 10, url: 'https://librespeed.iahome.fr' },
  'psitransfer': { cost: 10, url: 'https://psitransfer.iahome.fr' },
  'qrcodes': { cost: 10, url: 'https://qrcodes.iahome.fr' },
  'pdf': { cost: 10, url: 'https://pdf.iahome.fr' },
  'meeting-reports': { cost: 10, url: 'https://meeting-reports.iahome.fr' },
  'cogstudio': { cost: 10, url: 'https://cogstudio.iahome.fr' }
};

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, moduleId } = await request.json();

    if (!userId || !userEmail || !moduleId) {
      return NextResponse.json(
        { error: 'userId, userEmail et moduleId sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'application existe
    const appConfig = APPLICATION_CONFIG[moduleId as keyof typeof APPLICATION_CONFIG];
    if (!appConfig) {
      return NextResponse.json(
        { error: `Application ${moduleId} non trouvée` },
        { status: 404 }
      );
    }

    // Créer le token JWT
    const tokenPayload = {
      userId,
      userEmail,
      moduleId,
      moduleTitle: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
      accessLevel: 'premium',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 heures
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures en secondes
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    return NextResponse.json({
      success: true,
      token,
      moduleId,
      moduleTitle: tokenPayload.moduleTitle,
      cost: appConfig.cost,
      url: appConfig.url,
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

