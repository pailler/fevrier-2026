import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { EmailService } from '../../../utils/emailService';
import crypto from 'crypto';

const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API create-magic-link appelée');
    
    const body = await request.json();
    const { userId, subscriptionId, moduleName, userEmail, redirectUrl } = body;

    console.log('🔍 Données reçues:', { userId, subscriptionId, moduleName, userEmail, redirectUrl });

    // Validation des paramètres
    if (!userId || !moduleName || !userEmail) {
      console.error('❌ Paramètres manquants');
      return NextResponse.json(
        { error: 'Paramètres manquants: userId, moduleName, userEmail requis' },
        { status: 400 }
      );
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    
    // Définir l'expiration (24 heures)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('🔍 Token généré:', token);
    console.log('🔍 Expiration:', expiresAt);

    // Insérer le magic link dans Supabase
    const { data, error } = await supabase
      .from('magic_links')
      .insert({
        token,
        user_id: userId,
        subscription_id: subscriptionId,
        module_name: moduleName,
        user_email: userEmail,
        redirect_url: redirectUrl,
        expires_at: expiresAt.toISOString(),
        is_used: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion magic link:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du magic link' },
        { status: 500 }
      );
    }

    console.log('✅ Magic link créé dans Supabase:', data.id);

    // Construire l'URL du magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://iahome.fr';
    let magicLinkUrl: string;

    if (redirectUrl) {
      // Pour tous les modules, utiliser l'API proxy-access qui inclut les credentials
      magicLinkUrl = `${baseUrl}/api/proxy-access?token=${token}&module=${moduleName}`;
    } else {
      // Sinon, utiliser l'URL par défaut
      magicLinkUrl = `${baseUrl}/access/${moduleName}?token=${token}&user=${userId}`;
    }

    console.log('🔍 URL magic link:', magicLinkUrl);

    // Envoyer l'email avec le magic link
    try {
      await emailService.sendMagicLinkEmail(userEmail, moduleName, magicLinkUrl, expiresAt);
      console.log('✅ Email magic link envoyé à:', userEmail);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // On continue même si l'email échoue, le magic link est créé
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link créé avec succès',
      data: {
        id: data.id,
        token,
        expiresAt: expiresAt.toISOString(),
        magicLinkUrl
      }
    });

  } catch (error) {
    console.error('❌ Erreur création magic link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la création du magic link' },
      { status: 500 }
    );
  }
} 
