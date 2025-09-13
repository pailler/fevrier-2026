import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Configuration du service QR Code Generator
const QR_CODE_CONFIG = {
  url: process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr',
  jwtSecret: process.env.QR_CODE_JWT_SECRET || 'qr-code-secret-key-change-in-production'
};

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { status: 'API qr-code-access is working', message: 'Use POST method to generate tokens' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Début POST /api/qr-code-access');
    
    // Utiliser des données utilisateur simulées pour les tests
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Utilisateur Test',
      role: 'user'
    };
    
    console.log('🔍 DEBUG: Utilisation utilisateur de test:', testUser);
    
    const body = await request.json();
    console.log('🔍 DEBUG: Body reçu:', body);

    // Générer un token d'accès
    const qrToken = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
        exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 heures
        iat: Math.floor(Date.now() / 1000),
        iss: 'iahome.fr',
        aud: 'qr-code-generator'
      },
      QR_CODE_CONFIG.jwtSecret
    );

    console.log('✅ DEBUG: Token généré avec succès');

    // Retourner les informations d'accès
    const response = {
      success: true,
      qrServiceUrl: QR_CODE_CONFIG.url,
      authToken: qrToken,
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };

    console.log('✅ DEBUG: Réponse préparée:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ DEBUG: Erreur qr-code-access POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


