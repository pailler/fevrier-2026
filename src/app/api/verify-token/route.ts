import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Vérifier que le token n'est pas expiré
    if (decoded.exp && decoded.exp * 1000 > Date.now()) {
      return NextResponse.json({
        valid: true,
        data: {
          userId: decoded.userId,
          userEmail: decoded.userEmail,
          moduleId: decoded.moduleId,
          moduleTitle: decoded.moduleTitle,
          accessLevel: decoded.accessLevel,
          expiresAt: decoded.expiresAt,
          permissions: decoded.permissions
        }
      });
    } else {
      return NextResponse.json(
        { valid: false, error: 'Token expiré' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Erreur vérification token:', error);
    return NextResponse.json(
      { valid: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}
