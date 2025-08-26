import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Clé secrète pour signer les tokens QR Code (à ajouter dans les variables d'environnement)
const QR_CODE_JWT_SECRET = process.env.QR_CODE_JWT_SECRET || 'qr-code-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName } = await request.json();

    // Vérification simple des paramètres requis
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId et userEmail requis' },
        { status: 400 }
      );
    }

    // Créer un objet utilisateur simple
    const user = {
      id: userId,
      email: userEmail,
      name: userName || userEmail.split('@')[0] || 'Utilisateur'
    };

    // Récupérer les informations du profil utilisateur (optionnel)
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileError) {
        profile = profileData;
      }
    } catch (error) {
      console.log('Profil non trouvé, utilisation des valeurs par défaut');
    }

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

    // Retourner les informations d'authentification
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
        name: profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'
      },
      qrToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Erreur validation session QR:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer les informations du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
        name: profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'
      }
    });

  } catch (error) {
    console.error('Erreur vérification session QR:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
