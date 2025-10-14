import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    // Validation des données
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom complet sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
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

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'utilisateur' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse email existe déjà' },
        { status: 409 }
      );
    }

    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error('Erreur lors de la création du compte auth:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Créer le profil dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email,
        full_name: fullName,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      // Nettoyer l'utilisateur auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil utilisateur' },
        { status: 500 }
      );
    }

    // Créer automatiquement 100 tokens pour le nouvel utilisateur
    const { error: tokenError } = await supabase
      .from('user_tokens')
      .insert([{
        user_id: profileData.id,
        tokens: 100, // 100 tokens par défaut
        package_name: 'Welcome Package',
        purchase_date: new Date().toISOString(),
        is_active: true
      }]);

    if (tokenError) {
      console.error('Erreur lors de la création des tokens:', tokenError);
      // Ne pas faire échouer la création du compte pour les tokens
    } else {
      console.log(`✅ 100 tokens créés pour le nouvel utilisateur ${email}`);
    }

    return NextResponse.json({
      success: true,
      user: profileData,
      message: 'Compte créé avec succès. Vérifiez votre email pour confirmer votre compte.'
    });

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}









