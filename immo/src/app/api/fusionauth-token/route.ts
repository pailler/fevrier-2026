import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// Configuration FusionAuth
const FUSIONAUTH_CONFIG = {
  baseUrl: process.env.FUSIONAUTH_BASE_URL || 'https://fusionauth.iahome.fr',
  apiKey: process.env.FUSIONAUTH_API_KEY || 'H6DZYq4RFdFh87J9DkhNdvo0U7Lqb1yUmK6YmwOU',
  applicationId: process.env.FUSIONAUTH_APPLICATION_ID || 'a3bd1666-71cd-4037-8037-322126502010',
  clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET || '7KT8f8LCBXHwOYCOr1zDKrpodB5EgSaTunpRkN5rgro',
  tenantId: process.env.FUSIONAUTH_TENANT_ID || 'b1df6d92-e242-10ab-874d-6fe852a7a7fe'
};

// Clé secrète pour signer les JWT (à configurer dans .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, module } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId et userEmail requis' },
        { status: 400 }
      );
    }

    // Créer un JWT simple côté serveur
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      iss: 'iahome.fr',
      aud: 'stablediffusion.iahome.fr',
      sub: userId,
      email: userEmail,
      module: module,
      source: 'iahome',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 heure
      fusionauth: {
        applicationId: FUSIONAUTH_CONFIG.applicationId,
        tenantId: FUSIONAUTH_CONFIG.tenantId
      }
    };

    // Encoder header et payload en base64url
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Créer la signature
    const signature = createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    // Assembler le JWT
    const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

    // 3. Retourner le token JWT
    return NextResponse.json({
      success: true,
      jwt: jwt,
      expiresIn: 3600,
      userId: userId,
      module: module,
      payload: payload
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 