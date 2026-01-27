import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'L\'adresse email est requise'
      }, { status: 400 });
    }

    const userEmail = email;
    const name = userName || userEmail.split('@')[0] || 'Utilisateur';

    console.log(`📧 Test d'envoi du mail "appli activée sans utilisation" à ${userEmail}`);

    // Utiliser une instance serveur sans auth pour éviter les conflits GoTrueClient
    const supabase = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: undefined,
        },
        global: {
          headers: {
            'X-Client-Info': 'iahome-api-server'
          }
        }
      }
    );

    // Vérifier si le type de notification existe
    const { data: existingData, error: checkError } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('event_type', 'app_activated_no_usage')
      .maybeSingle();

    // Ignorer l'erreur "non trouvé" (PGRST116)
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('⚠️ Erreur lors de la vérification:', checkError);
    }

    const existing = existingData;

    // Utiliser upsert pour créer ou mettre à jour la notification
    console.log('🔧 Création/mise à jour du type de notification app_activated_no_usage...');
    
    // TEMPLATE DISTINCT pour "Appli activée sans utilisation" - différent de "Sans application activée"
    const notificationData = {
      event_type: 'app_activated_no_usage',
      name: 'Application activée sans utilisation',
      is_enabled: true,
      email_template_subject: 'Votre application vous attend ! Découvrez-la maintenant',
      email_template_body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #7c3aed; margin-top: 0; font-size: 28px;">Bonjour {{user_name}} ! 👋</h1>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Nous avons remarqué que vous avez activé une application sur IAHome, mais que vous ne l'avez pas encore utilisée.
                </p>
                
                <div style="background-color: #f3e8ff; border-left: 4px solid #7c3aed; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="color: #6b21a8; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
                    💡 Votre application vous attend !
                  </p>
                  <p style="color: #581c87; font-size: 14px; margin: 0;">
                    Votre application est déjà activée et prête à être utilisée. Découvrez toutes ses fonctionnalités et commencez à en profiter dès maintenant !
                  </p>
                </div>
                
                <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px; margin-bottom: 16px;">
                  🚀 Comment utiliser votre application activée ? (3 étapes simples)
                </h2>
                
                <div style="margin: 24px 0;">
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: flex-start;">
                      <div style="background-color: #7c3aed; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                        1
                      </div>
                      <div>
                        <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                          Accédez à "Mes applis"
                        </p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                          Cliquez sur <a href="https://iahome.fr/applications" style="color: #7c3aed; text-decoration: none; font-weight: 600;">"Mes applis"</a> dans la bannière en haut de la page pour voir toutes vos applications activées.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: flex-start;">
                      <div style="background-color: #7c3aed; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                        2
                      </div>
                      <div>
                        <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                          Sélectionnez votre application
                        </p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                          Cliquez sur l'application que vous avez activée. Vous accéderez directement à son interface et pourrez commencer à l'utiliser immédiatement.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: flex-start;">
                      <div style="background-color: #7c3aed; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                        3
                      </div>
                      <div>
                        <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                          Explorez et utilisez
                        </p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                          Découvrez toutes les fonctionnalités de votre application et commencez à l'utiliser. C'est simple, intuitif et vous avez déjà tout ce qu'il faut !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://iahome.fr/applications" style="background-color: #7c3aed; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Accéder à mes applications →
                  </a>
                </div>
                
                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="color: #166534; font-size: 14px; margin: 0;">
                    <strong>💡 Rappel :</strong> Votre application est déjà activée ! Vous n'avez plus qu'à l'utiliser. Aucune activation supplémentaire n'est nécessaire.
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
                  Si vous avez des questions ou besoin d'aide pour utiliser votre application, n'hésitez pas à nous contacter. Nous sommes là pour vous accompagner !
                </p>
                
                <p style="color: #374151; font-size: 16px; margin-top: 24px;">
                  À très bientôt sur IAHome !<br>
                  <strong>L'équipe IAHome</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                  Cet email a été envoyé automatiquement par IAHome.<br>
                  Vous avez reçu cet email car vous avez activé une application sur IAHome mais ne l'avez pas encore utilisée.
                </p>
              </div>
            </div>
          `
    };

    // Utiliser upsert pour créer ou mettre à jour (évite les erreurs de contrainte unique)
    const { data: upsertedData, error: upsertError } = await supabase
      .from('notification_settings')
      .upsert(notificationData, {
        onConflict: 'event_type'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Erreur lors de la création/mise à jour du type de notification:', upsertError);
      console.error('Code erreur:', upsertError.code);
      console.error('Message:', upsertError.message);
      console.error('Détails:', upsertError.details);
      console.error('Hint:', upsertError.hint);
      
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la création du type de notification',
        error: upsertError.message || 'Erreur inconnue',
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint,
        fullError: JSON.stringify(upsertError)
      }, { status: 500 });
    } else {
      if (existing) {
        console.log('✅ Type de notification mis à jour avec succès:', upsertedData?.id);
      } else {
        console.log('✅ Type de notification créé avec succès:', upsertedData?.id);
      }
    }

    // Récupérer le template depuis la base de données
    const { data: notificationSetting, error: fetchError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('event_type', 'app_activated_no_usage')
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération du template:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la récupération du template de notification',
        error: fetchError.message || 'Erreur inconnue',
        code: fetchError.code,
        details: fetchError.details
      }, { status: 500 });
    }

    if (!notificationSetting) {
      console.error('❌ Template de notification non trouvé après création');
      return NextResponse.json({
        success: false,
        message: 'Template de notification non trouvé',
        error: 'Le type de notification app_activated_no_usage n\'existe pas dans la base de données'
      }, { status: 500 });
    }

    // Vérifier la configuration Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>';
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY non configuré');
      return NextResponse.json({
        success: false,
        message: 'Configuration email non disponible',
        error: 'RESEND_API_KEY manquant'
      }, { status: 500 });
    }

    if (!resendApiKey.trim()) {
      console.error('❌ RESEND_API_KEY est vide');
      return NextResponse.json({
        success: false,
        message: 'Configuration email invalide',
        error: 'RESEND_API_KEY vide'
      }, { status: 500 });
    }

    console.log('📧 Configuration Resend:', {
      hasApiKey: !!resendApiKey,
      apiKeyLength: resendApiKey.length,
      apiKeyPrefix: resendApiKey.substring(0, 5) + '...',
      fromEmail: resendFromEmail
    });

    let resend;
    try {
      resend = new Resend(resendApiKey);
      console.log('✅ Instance Resend créée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'instance Resend:', error);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'initialisation de Resend',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 });
    }

    // Remplacer les variables dans le template
    let subject = notificationSetting.email_template_subject.replace(/\{\{user_name\}\}/g, name);
    let html = notificationSetting.email_template_body.replace(/\{\{user_name\}\}/g, name);

    console.log('📧 Préparation de l\'envoi:', {
      to: userEmail,
      from: resendFromEmail,
      subject: subject.substring(0, 50) + '...'
    });

    // Envoyer l'email
    let result;
    try {
      result = await resend.emails.send({
        from: resendFromEmail,
        to: userEmail,
        subject: subject,
        html: html
      });

      if (result.error) {
        console.error('❌ Erreur envoi email:', result.error);
        return NextResponse.json({
          success: false,
          message: 'Erreur lors de l\'envoi de l\'email',
          error: result.error.message || JSON.stringify(result.error),
          details: result.error
        }, { status: 500 });
      }

      console.log('✅ Email envoyé avec succès:', {
        emailId: result.data?.id,
        to: userEmail
      });
    } catch (error) {
      console.error('❌ Exception lors de l\'envoi:', error);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      }, { status: 500 });
    }

    // Enregistrer le log de notification
    try {
      await supabase
        .from('notification_logs')
        .insert({
          event_type: 'app_activated_no_usage',
          user_email: userEmail,
          event_data: { user_name: name },
          email_sent: true,
          email_sent_at: new Date().toISOString()
        });
    } catch (err) {
      console.warn('⚠️ Impossible d\'enregistrer le log:', err);
    }

    console.log(`✅ Email envoyé avec succès à ${userEmail}`);
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      email: userEmail,
      userName: name
    });

  } catch (error) {
    console.error('❌ Erreur lors du test email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
