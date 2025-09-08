import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json(
    { status: 'API notification-send is working', message: 'Use POST method to send notifications' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { eventType, userEmail, eventData } = await request.json();

    console.log('API notification-send called with:', { eventType, userEmail, eventData });

    // Vérifier si la notification est activée
    const { data: setting, error: settingError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('event_type', eventType)
      .eq('is_enabled', true)
      .single();

    if (settingError || !setting) {
      console.log('Notification désactivée ou non trouvée:', eventType);
      return NextResponse.json(
        { success: false, message: 'Notification désactivée' },
        { status: 200 }
      );
    }

    // Préparer l'email
    const emailData = {
      to: userEmail,
      subject: setting.email_template_subject,
      html: setting.email_template_body,
      from: process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>'
    };

    // Envoyer l'email
    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('Erreur envoi email:', result.error);
      
      // Enregistrer le log d'erreur
      await supabase
        .from('notification_logs')
        .insert({
          event_type: eventType,
          user_email: userEmail,
          event_data: eventData,
          email_sent: false,
          email_error: result.error.message
        });

      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    // Enregistrer le log de succès
    await supabase
      .from('notification_logs')
      .insert({
        event_type: eventType,
        user_email: userEmail,
        event_data: eventData,
        email_sent: true,
        email_sent_at: new Date().toISOString()
      });

    console.log('Email envoyé avec succès:', result.data?.id);
    return NextResponse.json(
      { success: true, emailId: result.data?.id },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur API notification:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


