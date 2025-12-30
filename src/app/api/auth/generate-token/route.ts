import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, role } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId et email sont requis' },
        { status: 400 }
      );
    }

    // Générer un token JWT identique à celui généré par signin-alternative
    const token = jwt.sign(
      { 
        userId, 
        email, 
        role: role || 'user' 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      message: 'Token généré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}



































