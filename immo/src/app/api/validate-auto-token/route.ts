import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../utils/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const { token, moduleName, userId } = await request.json();
    
    if (!token || !moduleName || !userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    // Valider le token automatique
    const sessionToken = await SessionManager.validateAutoToken(token, moduleName);
    
    if (!sessionToken || sessionToken.userId !== userId) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Token invalide ou expiré'
        },
        { status: 401 }
      );
    }
    
    // Token valide
    return NextResponse.json({
      valid: true,
      userId: sessionToken.userId,
      moduleName: sessionToken.moduleName,
      expiresAt: sessionToken.expiresAt,
      remainingTime: sessionToken.expiresAt.getTime() - Date.now()
    });
    
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    
    return NextResponse.json(
      { 
        valid: false,
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
}
