import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
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

    // Récupérer l'utilisateur par email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Ce compte a été désactivé' },
        { status: 401 }
      );
    }

    // Si le profil n'a pas de password_hash (compte créé via OAuth), vérifier dans Supabase Auth
    if (!user.password_hash) {
      console.log('📋 Compte OAuth détecté (pas de password_hash), vérification dans Supabase Auth...');
      
      // Vérifier si l'utilisateur existe dans Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers && authUsers.users) {
        const authUser = authUsers.users.find((u: any) => u.email === email);
        
        if (authUser) {
          // L'utilisateur existe dans Supabase Auth (compte OAuth)
          // Essayer de se connecter via Supabase Auth avec le mot de passe
          // Si ça échoue, c'est que le compte n'a pas de mot de passe défini
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            // Le compte OAuth n'a pas de mot de passe défini
            return NextResponse.json(
              { 
                error: 'Ce compte a été créé avec Google. Veuillez vous connecter avec Google.',
                oauth_account: true,
                needs_password: true,
                set_password_url: '/api/auth/set-password-oauth'
              },
              { status: 401 }
            );
          }
          
          // Connexion réussie via Supabase Auth
          console.log('✅ Connexion réussie via Supabase Auth pour compte OAuth');
          // Continuer avec le flux normal (générer le token JWT)
        }
      }
      
      // Si on arrive ici, le compte OAuth n'a pas de mot de passe
      return NextResponse.json(
        { 
          error: 'Ce compte a été créé avec Google. Veuillez vous connecter avec Google.',
          oauth_account: true,
          needs_password: true
        },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe pour les comptes classiques
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Mettre à jour la dernière connexion
    await supabase
      .from('profiles')
      .update({ 
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Envoyer la notification de login
    try {
      const { NotificationService } = await import('../../../../utils/notificationService');
      const notificationService = NotificationService.getInstance();
      
      await notificationService.sendUserLoginNotification(
        user.email,
        user.full_name || user.email
      );
      console.log('✅ Notification de login envoyée à', user.email);
    } catch (notificationError) {
      console.error('❌ Erreur lors de l\'envoi de la notification de login:', notificationError);
      // Ne pas faire échouer la connexion si la notification échoue
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified
      },
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}


