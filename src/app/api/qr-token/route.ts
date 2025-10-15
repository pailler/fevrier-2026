import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Configuration du service QR Code Generator
const QR_CODE_CONFIG = {
  // URL locale pour accès direct
  url: process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr',
  // Clé secrète JWT pour signer les tokens
  jwtSecret: process.env.JWT_SECRET_QR_CODE || 'your-secret-jwt-key-for-qr-code'
};

// Initialiser Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fonction pour valider un utilisateur IAHome
async function validateIAHomeUser(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('❌ Erreur validation utilisateur:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role
    };
  } catch (error) {
    console.error('❌ Erreur validation utilisateur:', error);
    return null;
  }
}

// Fonction pour générer un token JWT pour le service QR Code
function generateQRCodeToken(user: any) {
  const payload = {
    user_id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    source: 'iahome.fr',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expire dans 1 heure
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, QR_CODE_CONFIG.jwtSecret, { algorithm: 'HS256' });
}

export async function GET(request: NextRequest) {
  try {
    ;
    
    // Redirection directe vers l'application locale sans authentification
    ;
    return NextResponse.redirect(QR_CODE_CONFIG.url);

} catch (error) {
    console.error('❌ Erreur GET /api/qr-token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ;
    
    // Redirection directe vers l'application locale sans authentification
    ;
    return NextResponse.redirect(QR_CODE_CONFIG.url);

} catch (error) {
    console.error('❌ Erreur POST /api/qr-token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
