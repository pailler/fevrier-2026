import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '../../../../utils/supabaseConfig';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey()
    );

    // Vérifier si le template existe déjà
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('event_type', 'inactivity_warning')
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Le template d\'avertissement d\'inactivité existe déjà',
        id: existing.id
      });
    }

    // Créer le template d'email d'avertissement
    const { data: template, error: templateError } = await supabase
      .from('notification_settings')
      .insert({
        event_type: 'inactivity_warning',
        event_name: 'Avertissement d\'inactivité',
        is_enabled: true,
        email_template_subject: '⚠️ Votre compte IAHome sera désactivé dans {{daysRemaining}} jour(s)',
        email_template_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Avertissement d'inactivité</h1>
              </div>
              <div class="content">
                <p>Bonjour {{fullName}},</p>
                
                <p>Nous avons remarqué que vous n'avez pas utilisé votre compte IAHome depuis un certain temps.</p>
                
                <p><strong>Votre compte sera automatiquement désactivé dans {{daysRemaining}} jour(s)</strong> si aucune activité n'est enregistrée.</p>
                
                <p>Pour éviter la désactivation de votre compte, il vous suffit de vous connecter et d'utiliser l'une de nos applications.</p>
                
                <div style="text-align: center;">
                  <a href="{{reactivationLink}}" class="button">Réactiver mon compte maintenant</a>
                </div>
                
                <p>Ou connectez-vous directement sur <a href="https://iahome.fr/login">https://iahome.fr/login</a></p>
                
                <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                
                <p>Cordialement,<br>L'équipe IAHome</p>
              </div>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement. Si vous avez des questions, contactez-nous à support@iahome.fr</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
      .select()
      .single();

    if (templateError) {
      console.error('❌ Erreur lors de la création du template:', templateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du template', details: templateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template d\'avertissement d\'inactivité créé avec succès',
      template
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  }
}
