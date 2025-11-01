import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Vérifie le mot de passe de l'utilisateur
 * POST /api/verify-password
 * Body: { userId: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    // Validation des données
    if (!userId || !password) {
      return NextResponse.json(
        { error: 'userId et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur par ID
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, password_hash, is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Ce compte a été désactivé' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe vérifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}

