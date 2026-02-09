import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../../utils/emailService';

/**
 * Envoie un email de test en utilisant le template de notification sélectionné.
 * Body: { eventType: string, email: string, userName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { eventType, email, userName } = await request.json();

    if (!eventType || !email) {
      return NextResponse.json(
        { success: false, error: 'eventType et email sont requis' },
        { status: 400 }
      );
    }

    const templateData: Record<string, string> = {
      user_name: userName || email.split('@')[0] || 'Utilisateur'
    };

    const emailService = EmailService.getInstance();
    if (!emailService.isServiceConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Service email non configuré (RESEND_API_KEY)' },
        { status: 500 }
      );
    }

    const sent = await emailService.sendNotificationEmail(eventType, email, templateData);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès',
        eventType,
        email
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Template désactivé, introuvable ou erreur d\'envoi. Vérifiez que le type de notification existe et est activé.'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ send-test-notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
}
