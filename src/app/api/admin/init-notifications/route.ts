import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initialisation du système de notifications...');

    // Créer la table notification_settings si elle n'existe pas
    const { error: createSettingsError } = await supabase.rpc('create_notification_settings_table');
    if (createSettingsError) {
      console.log('Table notification_settings existe déjà ou erreur:', createSettingsError.message);
    }

    // Créer la table notification_logs si elle n'existe pas
    const { error: createLogsError } = await supabase.rpc('create_notification_logs_table');
    if (createLogsError) {
      console.log('Table notification_logs existe déjà ou erreur:', createLogsError.message);
    }

    // Vérifier si des paramètres existent déjà
    const { data: existingSettings, error: checkError } = await supabase
      .from('notification_settings')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification des paramètres existants:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la vérification des paramètres existants',
        details: checkError.message
      }, { status: 500 });
    }

    if (existingSettings && existingSettings.length > 0) {
      ;
      return NextResponse.json({
        success: true,
        message: 'Paramètres de notifications déjà initialisés',
        settingsCount: existingSettings.length
      });
    }

    // Insérer les paramètres de notifications par défaut
    const defaultSettings = [
      {
        event_type: 'user_signup',
        name: 'Inscription utilisateur',
        description: 'Notification envoyée lors de l\'inscription d\'un nouvel utilisateur',
        is_enabled: true,
        email_template_subject: 'Bienvenue sur IAHome !',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bienvenue sur IAHome !</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos modules.</p>
            <p>Merci de nous faire confiance !</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'user_login',
        name: 'Connexion utilisateur',
        description: 'Notification envoyée lors de la connexion d\'un utilisateur',
        is_enabled: false,
        email_template_subject: 'Connexion détectée - IAHome',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Connexion détectée</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Une connexion à votre compte IAHome a été détectée le {{login_date}}.</p>
            <p>Si ce n'était pas vous, veuillez contacter le support.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'module_activated',
        name: 'Module activé',
        description: 'Notification envoyée lorsqu\'un module est activé pour un utilisateur',
        is_enabled: true,
        email_template_subject: 'Module activé - {{module_name}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Module activé</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Le module <strong>{{module_name}}</strong> a été activé pour votre compte.</p>
            <p>Vous pouvez maintenant y accéder depuis votre tableau de bord.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'payment_success',
        name: 'Paiement réussi',
        description: 'Notification envoyée lors d\'un paiement réussi',
        is_enabled: true,
        email_template_subject: 'Paiement confirmé - {{amount}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Paiement confirmé</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Votre paiement de <strong>{{amount}}</strong> a été confirmé.</p>
            <p>Merci pour votre achat !</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'module_usage_limit',
        name: 'Limite d\'usage atteinte',
        description: 'Notification envoyée quand un utilisateur atteint sa limite d\'usage',
        is_enabled: true,
        email_template_subject: 'Limite d\'usage atteinte - {{module_name}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Limite d'usage atteinte</h2>
            <p>Bonjour {{user_name}},</p>
            <p>Vous avez atteint votre limite d'usage pour le module <strong>{{module_name}}</strong>.</p>
            <p>Considérez une mise à niveau pour continuer à utiliser ce module.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'admin_alert',
        name: 'Alerte administrateur',
        description: 'Notification envoyée aux administrateurs pour les événements critiques',
        is_enabled: true,
        email_template_subject: 'Alerte administrateur - {{alert_type}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Alerte administrateur</h2>
            <p>Une alerte de type <strong>{{alert_type}}</strong> a été déclenchée.</p>
            <p><strong>Détails:</strong> {{alert_details}}</p>
            <p>Veuillez vérifier le système.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      }
    ];

    const { data: insertedSettings, error: insertError } = await supabase
      .from('notification_settings')
      .insert(defaultSettings)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des paramètres:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'insertion des paramètres',
        details: insertError.message
      }, { status: 500 });
    }

    console.log(`✅ ${insertedSettings?.length || 0} paramètres de notifications initialisés`);

    return NextResponse.json({
      success: true,
      message: 'Système de notifications initialisé avec succès',
      settingsCount: insertedSettings?.length || 0,
      settings: insertedSettings
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
