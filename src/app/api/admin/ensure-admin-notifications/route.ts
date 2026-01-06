import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Vérification et ajout des notifications admin...');

    const adminNotifications = [
      {
        event_type: 'admin_user_signup',
        name: 'Notification admin - Nouvel utilisateur',
        description: 'Notification envoyée à l\'administrateur lorsqu\'un nouvel utilisateur s\'inscrit',
        is_enabled: true,
        email_template_subject: 'Nouvel utilisateur inscrit - {{user_email}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nouvel utilisateur inscrit</h2>
            <p>Un nouvel utilisateur vient de s'inscrire sur IAHome.</p>
            <p><strong>Nom:</strong> {{user_name}}</p>
            <p><strong>Email:</strong> {{user_email}}</p>
            <p><strong>Date d'inscription:</strong> {{signup_date}} à {{signup_time}}</p>
            <p><strong>Méthode d'inscription:</strong> {{signup_method || 'Email'}}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      },
      {
        event_type: 'admin_module_activated',
        name: 'Notification admin - Application activée',
        description: 'Notification envoyée à l\'administrateur lorsqu\'une application est activée',
        is_enabled: true,
        email_template_subject: 'Nouvelle application activée - {{module_name}}',
        email_template_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Application activée</h2>
            <p>Une nouvelle application a été activée par un utilisateur.</p>
            <p><strong>Utilisateur:</strong> {{user_name}} ({{user_email}})</p>
            <p><strong>Application:</strong> {{module_name}} ({{module_id}})</p>
            <p><strong>Date d'activation:</strong> {{activation_date}}</p>
            <p><strong>Méthode:</strong> {{activation_method || 'Tokens'}}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par IAHome.
            </p>
          </div>
        `
      }
    ];

    const results = [];

    for (const notification of adminNotifications) {
      try {
        // Vérifier si la notification existe déjà
        const { data: existing, error: checkError } = await supabase
          .from('notification_settings')
          .select('id, is_enabled')
          .eq('event_type', notification.event_type)
          .single();

        if (existing) {
          // La notification existe, vérifier si elle est activée
          if (!existing.is_enabled) {
            // Activer la notification
            const { error: updateError } = await supabase
              .from('notification_settings')
              .update({ is_enabled: true })
              .eq('event_type', notification.event_type);

            if (updateError) {
              console.error(`❌ Erreur lors de l'activation de ${notification.event_type}:`, updateError);
              results.push({
                event_type: notification.event_type,
                status: 'error',
                message: `Erreur lors de l'activation: ${updateError.message}`
              });
            } else {
              console.log(`✅ Notification ${notification.event_type} activée`);
              results.push({
                event_type: notification.event_type,
                status: 'activated',
                message: 'Notification activée avec succès'
              });
            }
          } else {
            console.log(`ℹ️ Notification ${notification.event_type} existe déjà et est activée`);
            results.push({
              event_type: notification.event_type,
              status: 'exists',
              message: 'Notification existe déjà et est activée'
            });
          }
        } else {
          // La notification n'existe pas, l'ajouter
          const { data: inserted, error: insertError } = await supabase
            .from('notification_settings')
            .insert(notification)
            .select()
            .single();

          if (insertError) {
            console.error(`❌ Erreur lors de l'insertion de ${notification.event_type}:`, insertError);
            results.push({
              event_type: notification.event_type,
              status: 'error',
              message: `Erreur lors de l'insertion: ${insertError.message}`
            });
          } else {
            console.log(`✅ Notification ${notification.event_type} ajoutée`);
            results.push({
              event_type: notification.event_type,
              status: 'created',
              message: 'Notification créée avec succès'
            });
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${notification.event_type}:`, error);
        results.push({
          event_type: notification.event_type,
          status: 'error',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'created' || r.status === 'activated' || r.status === 'exists').length;

    return NextResponse.json({
      success: true,
      message: `${successCount}/${adminNotifications.length} notifications admin configurées`,
      results
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des notifications admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
