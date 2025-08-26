import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QR_CODE_JWT_SECRET = process.env.QR_CODE_JWT_SECRET || 'qr-code-secret-key-change-in-production';
const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'http://localhost:7005';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let user = null;

    // Vérifier via token Bearer
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error } = await supabase.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
      }
    }

    // Vérifier via cookies de session
    if (!user && cookieHeader) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      // Rediriger vers la page de connexion avec retour vers QR Code
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/qr-code');
      return NextResponse.redirect(loginUrl);
    }

    // Récupérer les informations du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Générer un token JWT pour le service QR Code
    const qrToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: profile?.role || 'user',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 heures
        iat: Math.floor(Date.now() / 1000),
        iss: 'iahome.fr',
        aud: 'qr-code-service'
      },
      QR_CODE_JWT_SECRET
    );

    // Construire l'URL de redirection vers le service QR Code
    const qrServiceUrl = new URL(QR_CODE_SERVICE_URL);
    qrServiceUrl.searchParams.set('auth_token', qrToken);
    qrServiceUrl.searchParams.set('user_id', user.id);
    qrServiceUrl.searchParams.set('user_email', user.email || '');
    qrServiceUrl.searchParams.set('user_name', profile?.full_name || user.email?.split('@')[0] || 'Utilisateur');

    return NextResponse.redirect(qrServiceUrl.toString());

  } catch (error) {
    console.error('Erreur redirection QR Code:', error);
    
    // En cas d'erreur, rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', '/qr-code');
    loginUrl.searchParams.set('error', 'Erreur d\'authentification');
    return NextResponse.redirect(loginUrl);
  }
}
