import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const QR_CODE_JWT_SECRET = process.env.QR_CODE_JWT_SECRET || 'qr-code-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    // Valider le token JWT
    try {
      const decoded = jwt.verify(token, QR_CODE_JWT_SECRET) as any;
      
      // Vérifier l'émetteur et l'audience
      if (decoded.iss !== 'iahome.fr' || decoded.aud !== 'qr-code-generator') {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }

      // Vérifier l'expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        valid: true
      });

    } catch (jwtError) {
      console.error('Erreur validation JWT:', jwtError);
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Erreur validation token QR:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    // Valider le token JWT
    try {
      const decoded = jwt.verify(token, QR_CODE_JWT_SECRET) as any;
      
      // Vérifier l'émetteur et l'audience
      if (decoded.iss !== 'iahome.fr' || decoded.aud !== 'qr-code-generator') {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }

      // Vérifier l'expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        valid: true
      });

    } catch (jwtError) {
      console.error('Erreur validation JWT:', jwtError);
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Erreur validation token QR:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


