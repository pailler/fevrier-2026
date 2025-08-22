import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST() {
  try {
    const notificationSettings = [
      {
        event_type: 'user_login',
        event_name: 'Connexion utilisateur',
        event_description: 'Notification envoyée quand un utilisateur se connecte',
        is_enabled: true,
        email_template_subject: 'Connexion à IAHome - {userName}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Connexion à IAHome</h2>
            <p>Bonjour {userName},</p>
            <p>Une nouvelle connexion a été détectée sur votre compte IAHome.</p>
            <p><strong>Détails :</strong></p>
            <ul>
              <li>Date et heure : ${new Date().toLocaleString('fr-FR')}</li>
              <li>Adresse IP : [Détectée automatiquement]</li>
            </ul>
            <p>Si vous n'êtes pas à l'origine de cette connexion, veuillez contacter immédiatement notre support.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système de sécurité IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'user_logout',
        event_name: 'Déconnexion utilisateur',
        event_description: 'Notification envoyée quand un utilisateur se déconnecte',
        is_enabled: true,
        email_template_subject: 'Déconnexion de IAHome - {userName}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Déconnexion de IAHome</h2>
            <p>Bonjour {userName},</p>
            <p>Vous avez été déconnecté de votre compte IAHome.</p>
            <p><strong>Détails :</strong></p>
            <ul>
              <li>Date et heure : ${new Date().toLocaleString('fr-FR')}</li>
            </ul>
            <p>Pour vous reconnecter, visitez <a href="https://iahome.fr/login">https://iahome.fr/login</a></p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'app_accessed',
        event_name: 'Accès à une application',
        event_description: 'Notification envoyée quand un utilisateur accède à une application',
        is_enabled: true,
        email_template_subject: 'Accès à {appName} - {userName}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Accès à {appName}</h2>
            <p>Bonjour {userName},</p>
            <p>Vous avez accédé à l'application <strong>{appName}</strong>.</p>
            <p><strong>Détails :</strong></p>
            <ul>
              <li>Application : {appName}</li>
              <li>Date et heure : ${new Date().toLocaleString('fr-FR')}</li>
              <li>Utilisateur : {userName}</li>
            </ul>
            <p>Si vous n'êtes pas à l'origine de cet accès, veuillez vérifier la sécurité de votre compte.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système de notifications IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'app_activated',
        event_name: 'Activation d\'une application',
        event_description: 'Notification envoyée quand un utilisateur active une application',
        is_enabled: true,
        email_template_subject: 'Activation de {appName} - {userName}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Activation de {appName}</h2>
            <p>Bonjour {userName},</p>
            <p>Vous avez activé l'application <strong>{appName}</strong>.</p>
            <p><strong>Détails :</strong></p>
            <ul>
              <li>Application : {appName}</li>
              <li>Date et heure : ${new Date().toLocaleString('fr-FR')}</li>
              <li>Utilisateur : {userName}</li>
            </ul>
            <p>Vous pouvez maintenant accéder à cette application depuis votre tableau de bord.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système de notifications IAHome.
            </p>
          </div>
        `
      }
    ];

    const results = [];

    for (const setting of notificationSettings) {
      try {
        // Vérifier si le paramètre existe déjà
        const { data: existing } = await supabase
          .from('notification_settings')
          .select('id')
          .eq('event_type', setting.event_type)
          .single();

        if (existing) {
          // Mettre à jour le paramètre existant
          const { error } = await supabase
            .from('notification_settings')
            .update({
              ...setting,
              updated_at: new Date().toISOString()
            })
            .eq('event_type', setting.event_type);

          results.push({
            event_type: setting.event_type,
            action: 'updated',
            success: !error,
            error: error?.message
          });
        } else {
          // Créer un nouveau paramètre
          const { error } = await supabase
            .from('notification_settings')
            .insert({
              ...setting,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          results.push({
            event_type: setting.event_type,
            action: 'created',
            success: !error,
            error: error?.message
          });
        }
      } catch (error) {
        results.push({
          event_type: setting.event_type,
          action: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de notification initialisés',
      results
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'initialisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
