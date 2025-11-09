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

    // Créer automatiquement 400 tokens pour le nouvel utilisateur
    const { error: tokenError } = await supabase
      .from('user_tokens')
      .insert([{
        user_id: profileData.id,
        tokens: 400, // 400 tokens par défaut pour les nouveaux utilisateurs
        package_name: 'Welcome Package',
        purchase_date: new Date().toISOString(),
        is_active: true
      }]);

    if (tokenError) {
      console.error('Erreur lors de la création des tokens:', tokenError);
      // Ne pas faire échouer la création du compte pour les tokens
    } else {
      console.log(`✅ 400 tokens créés pour le nouvel utilisateur ${email}`);
    }

    // Envoyer une notification d'inscription à l'utilisateur
    console.log('📧 Tentative d\'envoi d\'email de bienvenue à:', email);
    try {
      const { EmailService } = await import('../../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      const emailResult = await emailService.sendNotificationEmail('user_signup', email, {
        user_name: fullName,
        user_email: email,
        signup_date: new Date().toLocaleDateString('fr-FR'),
        signup_time: new Date().toLocaleTimeString('fr-FR')
      });
      console.log('📧 Résultat email utilisateur:', emailResult);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
      // Ne pas faire échouer la création du compte pour l'email
    }

    // Envoyer une notification à l'admin
    console.log('📧 Tentative d\'envoi de notification admin pour:', email);
    try {
      const { EmailService } = await import('../../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      const adminResult = await emailService.sendNotificationEmail('admin_user_signup', 'formateur_tic@hotmail.com', {
        user_name: fullName,
        user_email: email,
        signup_date: new Date().toLocaleDateString('fr-FR'),
        signup_time: new Date().toLocaleTimeString('fr-FR')
      });
      console.log('📧 Résultat email admin:', adminResult);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de la notification admin:', emailError);
      // Ne pas faire échouer la création du compte pour l'email admin
    }

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

