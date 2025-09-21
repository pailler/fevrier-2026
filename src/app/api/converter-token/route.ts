import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Vérifier si le token commence par "prov_" (token de provision)
    if (token.startsWith('prov_')) {
      // Token de provision - accès autorisé
      return NextResponse.json({
        valid: true,
        user_email: 'provisioned_user@iahome.fr',
        access_type: 'provisioned',
        message: 'Accès autorisé via token de provision'
      });
    }

    // Vérifier si c'est un token d'accès standard
    if (token.length > 20) {
      // Token d'accès standard - accès autorisé
      return NextResponse.json({
        valid: true,
        user_email: 'authenticated_user@iahome.fr',
        access_type: 'authenticated',
        message: 'Accès autorisé via token d\'authentification'
      });
    }

    // Token invalide
    return NextResponse.json(
      { error: 'Token invalide ou expiré' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification du token de conversion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}