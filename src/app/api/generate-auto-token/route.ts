import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../utils/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleName } = await request.json();

    if (!userId || !moduleName) {
      return NextResponse.json(
        { error: 'Paramètres manquants: userId et moduleName requis' },
        { status: 400 }
      );
    }

    // Générer le token automatique
    const token = await SessionManager.generateAutoToken(userId, moduleName);

    return NextResponse.json({
      success: true,
      token: token,
      userId: userId,
      moduleName: moduleName,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    });

  } catch (error) {
    console.error('Erreur lors de la génération du token automatique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
