import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API pour permettre à un utilisateur OAuth de définir un mot de passe
 * POST /api/auth/set-password-oauth
 * Body: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Récupérer le profil
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le compte a déjà un mot de passe
    if (user.password_hash) {
      return NextResponse.json(
        { error: 'Ce compte a déjà un mot de passe défini' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe dans Supabase Auth (compte OAuth)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError || !authUsers || !authUsers.users) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification du compte' },
        { status: 500 }
      );
    }

    const authUser = authUsers.users.find((u: any) => u.email === email);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Compte OAuth non trouvé' },
        { status: 404 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le profil avec le mot de passe hashé
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la définition du mot de passe' },
        { status: 500 }
      );
    }

    // Mettre à jour le mot de passe dans Supabase Auth
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: password }
    );

    if (authUpdateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe dans Supabase Auth:', authUpdateError);
      // Ne pas faire échouer la requête si la mise à jour dans Supabase Auth échoue
      // Le mot de passe est déjà dans profiles
    }

    console.log(`✅ Mot de passe défini pour le compte OAuth: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe défini avec succès. Vous pouvez maintenant vous connecter avec votre email et mot de passe.'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la définition du mot de passe:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la définition du mot de passe' },
      { status: 500 }
    );
  }
}









