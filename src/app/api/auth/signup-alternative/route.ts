import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

    // Générer un ID unique et hasher le mot de passe
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerificationToken = uuidv4();

    // Créer le profil dans la table profiles avec mot de passe hashé
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        password_hash: hashedPassword,
        role: 'user',
        is_active: true,
        email_verified: false,
        email_verification_token: emailVerificationToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil utilisateur' },
        { status: 500 }
      );
    }

    // TODO: Envoyer un email de vérification
    // await sendVerificationEmail(email, emailVerificationToken);

    return NextResponse.json({
      success: true,
      user: {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role,
        is_active: profileData.is_active,
        email_verified: profileData.email_verified
      },
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

