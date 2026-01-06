import { NextRequest, NextResponse } from 'next/server';
import { validateMagicLink, hasMagicLinkPermission } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    console.log('Token reçu:', token ? token.substring(0, 10) + '...' : 'null');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token magic link manquant' },
        { status: 400 }
      );
    }

    const magicLinkData = validateMagicLink(token);
    
    if (!magicLinkData) {
      return NextResponse.json(
        { error: 'Magic link invalide ou expiré' },
        { status: 403 }
      );
    }

    console.log('Timestamp:', new Date().toISOString());

    if (!hasMagicLinkPermission(magicLinkData, 'access')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      magicLinkData: {
        userId: magicLinkData.userId,
        moduleName: magicLinkData.moduleName,
        permissions: magicLinkData.permissions,
        expiresAt: magicLinkData.expiresAt
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne lors de la validation' },
      { status: 500 }
    );
  }
} 