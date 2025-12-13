import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { EmailService } from '@/utils/emailService';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Adresse email requise' },
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

    // Vérifier si l'utilisateur existe
    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}`);
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError);
      // Si c'est une erreur de type "not found", c'est normal
      if (userError.code === 'PGRST116') {
        console.log('ℹ️ Utilisateur non trouvé (normal pour la sécurité)');
        // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
        return NextResponse.json({
          success: true,
          message: 'Si cette adresse email existe dans notre système, vous recevrez un email de réinitialisation.'
        });
      }
      // Pour les autres erreurs, retourner une erreur générique
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la vérification de l\'email' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('ℹ️ Utilisateur non trouvé (normal pour la sécurité)');
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return NextResponse.json({
        success: true,
        message: 'Si cette adresse email existe dans notre système, vous recevrez un email de réinitialisation.'
      });
    }

    console.log(`✅ Utilisateur trouvé: ${user.id} (${user.email})`);

    // Générer un token de réinitialisation
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Sauvegarder le token dans la base de données
    console.log(`💾 Sauvegarde du token de réinitialisation pour l'utilisateur ${user.id}...`);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Erreur lors de la sauvegarde du token:', updateError);
      console.error('📧 Détails de l\'erreur:', JSON.stringify(updateError, null, 2));
      
      // Vérifier si c'est une erreur de colonne manquante
      if (updateError.message?.includes('column') || updateError.code === '42703') {
        console.error('❌ Les colonnes password_reset_token ou password_reset_expires n\'existent pas dans la table profiles');
        return NextResponse.json(
          { 
            error: 'Erreur de configuration de la base de données. Veuillez contacter l\'administrateur.',
            details: 'Colonnes manquantes dans la table profiles'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la génération du token de réinitialisation',
          details: updateError.message || 'Erreur inconnue'
        },
        { status: 500 }
      );
    }

    console.log(`✅ Token de réinitialisation sauvegardé avec succès`);

    // Envoyer l'email de réinitialisation
    // Détecter l'environnement et utiliser l'URL appropriée
    // Par défaut, utiliser TOUJOURS l'URL de production (https://iahome.fr)
    // Sauf si on est explicitement en développement local
    let appUrl: string;
    const nodeEnv = process.env.NODE_ENV || 'development';
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const isLocalDev = publicAppUrl.includes('localhost') || publicAppUrl.includes('127.0.0.1');
    
    // Si on est en développement local ET que l'URL contient localhost, utiliser localhost
    if (nodeEnv === 'development' && isLocalDev) {
      appUrl = 'http://localhost:3000';
      console.log('🔧 Développement local - Utilisation de http://localhost:3000 pour l\'email de réinitialisation');
    } else {
      // Par défaut (production ou autres cas), TOUJOURS utiliser l'URL de production
      appUrl = 'https://iahome.fr';
      console.log('🔒 Utilisation de https://iahome.fr pour l\'email de réinitialisation');
    }
    
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    console.log('📧 URL de réinitialisation générée:', resetUrl);
    
    // Vérifier si le service email est configuré
    const emailService = EmailService.getInstance();
    const isEmailConfigured = emailService.isServiceConfigured();
    
    console.log('📧 Configuration du service email:', {
      isConfigured: isEmailConfigured,
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr'
    });

    if (!isEmailConfigured) {
      console.error('❌ Service email non configuré - RESEND_API_KEY manquant');
      // Retourner une erreur explicite pour que l'utilisateur sache qu'il y a un problème
      return NextResponse.json(
        { 
          error: 'Le service d\'envoi d\'email n\'est pas configuré. Veuillez contacter l\'administrateur.',
          details: 'RESEND_API_KEY manquant'
        },
        { status: 500 }
      );
    }

    // Envoyer l'email de réinitialisation
    console.log(`📧 Tentative d'envoi d'email de réinitialisation à ${email}...`);
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetUrl
    );

    if (!emailSent) {
      console.error(`❌ Échec de l'envoi de l'email de réinitialisation à ${email}`);
      // Retourner une erreur pour que l'utilisateur sache qu'il y a un problème
      return NextResponse.json(
        { 
          error: 'Impossible d\'envoyer l\'email de réinitialisation. Veuillez réessayer plus tard ou contacter l\'administrateur.',
          details: 'Erreur lors de l\'envoi de l\'email'
        },
        { status: 500 }
      );
    }

    console.log(`✅ Email de réinitialisation envoyé avec succès à ${email}`);
    console.log(`🔑 Token de réinitialisation généré pour ${email}: ${resetToken.substring(0, 8)}...`);

    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email existe dans notre système, vous recevrez un email de réinitialisation.'
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}


