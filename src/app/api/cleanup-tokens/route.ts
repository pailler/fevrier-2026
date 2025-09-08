import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../utils/sessionManager';

export async function POST(request: NextRequest) {
  try {
    // Nettoyer les tokens expirés
    await SessionManager.cleanupExpiredTokens();
    
    return NextResponse.json({
      success: true,
      message: 'Tokens expirés nettoyés avec succès'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    );
  }
}
