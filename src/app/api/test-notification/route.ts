import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseClient } from '../../../utils/supabaseService';

export async function POST(request: NextRequest) {
  try {
    const { eventType, email, subject, body, eventData } = await request.json();

    if (!eventType || !email || !subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier la configuration Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration email non disponible' },
        { status: 500 }
      );
    }

    // Instancier Resend à l'intérieur de la fonction
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`🧪 Test de notification: ${eventType} vers ${email}`);

    // Envoyer l'email de test via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr',
      to: [email],
      subject: `[TEST] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
            <h2 style="margin: 0; color: #007bff;">🧪 Email de Test - ${eventType}</h2>
            <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
              Ceci est un email de test pour vérifier la configuration des notifications.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <h3 style="color: #333; margin-top: 0;">Contenu de la notification :</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            
            <h4 style="color: #333; margin-top: 20px;">Données de l'événement :</h4>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              <pre>${JSON.stringify(eventData, null, 2)}</pre>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              Email de test envoyé depuis l'interface d'administration iahome.fr
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error('❌ Erreur Resend:', emailError);
      return NextResponse.json(
        { success: false, error: `Erreur Resend: ${emailError.message}` },
        { status: 500 }
      );
    }

    // Enregistrer le test dans les logs de notifications
    const supabase = getSupabaseClient();
    const { error: logError } = await supabase
      .from('notification_logs')
      .insert({
        event_type: eventType,
        user_email: email,
        event_data: eventData,
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('❌ Erreur lors de l\'enregistrement du log:', logError);
      // Ne pas faire échouer la requête pour une erreur de log
    }

    console.log(`✅ Email de test envoyé avec succès: ${emailData?.id}`);

    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      emailId: emailData?.id,
      eventType,
      email
    });

  } catch (error) {
    console.error('❌ Erreur lors du test de notification:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}