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

    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;

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

  } catch (error) {
    console.error('Erreur vérification token:', error);
    return NextResponse.json(
      { valid: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}
