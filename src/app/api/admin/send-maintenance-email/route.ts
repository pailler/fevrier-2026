import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../utils/notificationService';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

    // Utiliser la fonction SQL Supabase pour créer/mettre à jour le template
    // Cette fonction fait un UPSERT (INSERT ... ON CONFLICT UPDATE)
    const { error: functionError } = await supabase.rpc('upsert_maintenance_template');

    if (functionError) {
      console.error('Erreur lors de l\'appel de la fonction SQL:', functionError);
      // Fallback: créer/mettre à jour manuellement si la fonction n'existe pas
      console.log('Tentative de création/mise à jour manuelle...');
      
      // Définir le template de maintenance
      const templateData: any = {
      event_type: 'maintenance_completed',
      event_name: 'Fin de maintenance - Services rétablis',
      is_enabled: true,
      email_template_subject: '✅ Maintenance terminée - Tous les services sont rétablis',
      email_template_body: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header avec gradient -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; font-family: Arial, Helvetica, sans-serif;">
                              Maintenance terminée
                            </h1>
                            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">
                              Tous les services sont rétablis
                            </p>
                        </td>
                      </tr>
                      
                      <!-- Contenu principal -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                            Bonjour <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">{{user_name}}</strong>,
                          </p>
                          
                          <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                            Nous avons le plaisir de vous informer que la maintenance de notre plateforme IAHome est maintenant terminée.
                          </p>
                          
                          <!-- Carte de statut -->
                          <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; margin: 30px 0;">
                            <tr>
                              <td style="padding: 20px;">
                                <table role="presentation" style="width: 100%;">
                                  <tr>
                                    <td style="width: 50px; vertical-align: top;">
                                      <div style="background-color: #10b981; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px;">
                                        <span style="color: white; font-size: 20px; font-family: Arial, Helvetica, sans-serif;">✓</span>
                                      </div>
                                    </td>
                                    <td style="vertical-align: top; padding-left: 12px;">
                                      <h2 style="color: #065f46; margin: 0 0 12px 0; font-size: 20px; font-weight: 700; font-family: Arial, Helvetica, sans-serif;">
                                        Tous les services sont opérationnels
                                      </h2>
                                      <p style="color: #047857; font-size: 15px; margin: 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                                        Vous pouvez maintenant vous connecter sans problème et accéder à toutes les fonctionnalités de IAHome. Tous les modules et applications sont disponibles et fonctionnent normalement.
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Informations -->
                          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif;">
                              📋 Détails de la maintenance
                            </h3>
                            <div style="color: #4b5563; font-size: 14px; line-height: 1.8; font-family: Arial, Helvetica, sans-serif;">
                              <p style="margin: 8px 0; font-family: Arial, Helvetica, sans-serif;">
                                <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">Date de rétablissement :</strong> {{completion_date}}
                              </p>
                              <p style="margin: 8px 0; font-family: Arial, Helvetica, sans-serif;">
                                <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">Statut :</strong> <span style="color: #10b981; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">✓ Tous les services opérationnels</span>
                              </p>
                            </div>
                          </div>
                          
                          <!-- Bouton CTA -->
                          <table role="presentation" style="width: 100%; margin: 35px 0;">
                            <tr>
                              <td style="text-align: center; padding: 20px 0;">
                                <table role="presentation" style="margin: 0 auto;">
                                  <tr>
                                    <td style="background-color: #10b981; border-radius: 8px; padding: 0;">
                                      <a href="https://iahome.fr/login" style="display: block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: bold; font-size: 18px; font-family: Arial, Helvetica, sans-serif; line-height: 1.4; letter-spacing: 0.3px; border: 2px solid #059669;">
                                        <span style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none;">Se connecter et profiter des applications IAHome →</span>
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                <p style="color: #6b7280; font-size: 14px; margin-top: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
                                  Vous pouvez désormais vous connecter sans problème et accéder à toutes vos applications
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 30px 0 0 0; font-family: Arial, Helvetica, sans-serif;">
                            Nous vous remercions de votre patience pendant cette période de maintenance. Si vous rencontrez le moindre problème, n'hésitez pas à nous contacter.
                          </p>
                          
                          <p style="color: #374151; font-size: 16px; margin: 30px 0 0 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                            Cordialement,<br>
                            <strong style="color: #1f2937; font-family: Arial, Helvetica, sans-serif;">L'équipe IAHome</strong>
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                            Cet email a été envoyé automatiquement par IAHome.<br>
                            Vous avez reçu cet email car vous êtes inscrit(e) sur notre plateforme.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
    };

      // Supprimer description si la colonne n'existe pas (comme dans setup-notifications)
      const templateDataToUse = { ...templateData };
      delete templateDataToUse.description;

      // Utiliser UPSERT avec ON CONFLICT
      const { error: upsertError } = await supabase
        .from('notification_settings')
        .upsert(templateDataToUse, {
          onConflict: 'event_type',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('❌ Erreur lors de la création/mise à jour du template:', upsertError);
        return NextResponse.json(
          { 
            success: false, 
            error: `Erreur lors de la création/mise à jour du template: ${upsertError.message || JSON.stringify(upsertError)}` 
          },
          { status: 500 }
        );
      }
      
      console.log('✅ Template de maintenance créé/mis à jour avec succès (fallback manuel)');
    } else {
      console.log('✅ Template de maintenance créé/mis à jour avec succès (via fonction SQL)');
    }

    // Envoyer l'email
    const notificationService = NotificationService.getInstance();
    const finalUserName = userName || email.split('@')[0] || 'Utilisateur';
    
    const result = await notificationService.sendMaintenanceCompletedNotification(email, finalUserName);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Email de maintenance envoyé avec succès',
        email: email
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de maintenance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Détails de l\'erreur:', {
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
