import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/** Formate l'email expéditeur pour Resend : "IAHome <noreply@iahome.fr>" améliore la délivrabilité. */
function formatFromEmail(email: string | undefined): string {
  const addr = email || 'noreply@iahome.fr';
  return addr.includes('<') ? addr : `IAHome <${addr}>`;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeResend();
  }

  /** Format from: "IAHome <email@domain>" pour meilleure délivrabilité */
  private getFromEmail(): string {
    const raw = process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr';
    return raw.includes('<') ? raw : `IAHome <${raw}>`;
  }

  /** Normalise le format from: "IAHome <noreply@iahome.fr>" pour meilleure délivrabilité */
  private formatFromEmail(email: string | undefined): string {
    const addr = email || 'noreply@iahome.fr';
    return addr.includes('<') ? addr : `IAHome <${addr}>`;
  }

  private initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;
    
    console.log('📧 Initialisation du service email:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 5) || 'N/A',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'non configuré',
      nodeEnv: process.env.NODE_ENV || 'non défini'
    });
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured - email service disabled');
      console.error('📧 Vérifiez que RESEND_API_KEY est défini dans vos variables d\'environnement');
      this.isConfigured = false;
      return;
    }

    if (apiKey.trim() === '') {
      console.error('❌ RESEND_API_KEY est vide - email service disabled');
      this.isConfigured = false;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('✅ Email service initialized successfully');
      console.log('📧 Configuration:', {
        fromEmail: process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>',
        provider: 'Resend'
      });
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      if (error instanceof Error) {
        console.error('📧 Error details:', error.message);
      }
      this.isConfigured = false;
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.resend) {
        console.error('❌ Email service not configured - RESEND_API_KEY missing or invalid');
        console.error('📧 Configuration check:', {
          isConfigured: this.isConfigured,
          hasResend: !!this.resend,
          hasApiKey: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY?.length || 0
        });
        return false;
      }

      const rawFrom = process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>';
      const from = rawFrom.includes('<') ? rawFrom : `IAHome <${rawFrom}>`;
      const { to, subject, html, from: fromOverride } = emailData;
      const fromFinal = fromOverride || from;
      
      console.log('📧 Tentative d\'envoi d\'email:', {
        to,
        from,
        subject,
        htmlLength: html.length
      });
      
      const result = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (result.error) {
        console.error('❌ Email send error:', result.error);
        console.error('📧 Détails de l\'erreur:', JSON.stringify(result.error, null, 2));
        return false;
      }

      console.log('✅ Email sent successfully:', {
        emailId: result.data?.id,
        to,
        subject
      });
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      if (error instanceof Error) {
        console.error('📧 Error message:', error.message);
        console.error('📧 Error stack:', error.stack);
      }
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Test Email - IAHome Notifications',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email IAHome</h2>
          <p>Ceci est un email de test pour vérifier que le système de notifications fonctionne correctement.</p>
          <p>Timestamp: ${new Date().toLocaleString('fr-FR')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement par le système de notifications IAHome.
          </p>
        </div>
      `
    });
  }

  async sendNotificationEmail(
    eventType: string, 
    userEmail: string, 
    templateData: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.resend) {
        console.warn('Email service not configured - skipping notification email');
        return false;
      }

      // Récupérer le template depuis la base de données
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        getSupabaseUrl(),
        getSupabaseServiceRoleKey()
      );

      const { data: setting, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('event_type', eventType)
        .eq('is_enabled', true)
        .single();

      if (error || !setting) {
        console.log(`Notification ${eventType} désactivée ou non trouvée`);
        return false;
      }

      // Remplacer les variables dans le template
      let subject = setting.email_template_subject;
      let html = setting.email_template_body;

      Object.keys(templateData).forEach(key => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), templateData[key] || '');
        html = html.replace(new RegExp(placeholder, 'g'), templateData[key] || '');
      });

      // Pièce jointe inline pour le visuel iahome (relance offres)
      const attachments: { content: string; filename: string; contentId?: string }[] = [];
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://iahome.fr';
      if (eventType === 'relance_offres_iahome') {
        try {
          const imagePath = path.join(process.cwd(), 'public', 'images', 'email-visuel-iahome.png');
          if (fs.existsSync(imagePath)) {
            const content = fs.readFileSync(imagePath).toString('base64');
            attachments.push({
              content,
              filename: 'email-visuel-iahome.png',
              contentId: 'iahome-visuel',
            });
          } else {
            html = html.replace(/src="cid:iahome-visuel"/g, `src="${baseUrl}/images/email-visuel-iahome.png"`);
          }
        } catch (attachErr) {
          console.warn('⚠️ Visuel iahome non attaché:', attachErr);
          html = html.replace(/src="cid:iahome-visuel"/g, `src="${baseUrl}/images/email-visuel-iahome.png"`);
        }
      }

      const result = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>',
        to: userEmail,
        subject,
        html,
        ...(attachments.length > 0 && { attachments }),
      });

      if (result.error) {
        console.error('Notification email send error:', result.error);
        return false;
      }

      // Enregistrer le log de succès (sans échouer si la table n'existe pas)
      try {
        await supabase
          .from('notification_logs')
          .insert({
            event_type: eventType,
            user_email: userEmail,
            event_data: templateData,
            email_sent: true,
            email_sent_at: new Date().toISOString()
          });
      } catch (logError) {
        // Ignorer les erreurs de log, l'email a été envoyé avec succès
        console.log('⚠️ Impossible d\'enregistrer le log (non bloquant):', logError);
      }

      console.log(`✅ Notification ${eventType} envoyée à ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Notification email service error:', error);
      
      // Enregistrer le log d'erreur
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          getSupabaseUrl(),
          getSupabaseServiceRoleKey()
        );

        try {
          await supabase
            .from('notification_logs')
            .insert({
              event_type: eventType,
              user_email: userEmail,
              event_data: templateData,
              email_sent: false,
              email_error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        } catch (logInsertError) {
          // Ignorer les erreurs de log
          console.log('⚠️ Impossible d\'enregistrer le log d\'erreur (non bloquant):', logInsertError);
        }
      } catch (logError) {
        console.error('Erreur lors de l\'enregistrement du log:', logError);
      }

      return false;
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string | null,
    resetUrl: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe - IAHome',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Bonjour ${userName || 'utilisateur'},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Vous avez demandé à réinitialiser votre mot de passe sur IAHome. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              <strong>⚠️ Important :</strong> Ce lien est valide pendant 24 heures. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Cet email a été envoyé automatiquement par IAHome. Ne répondez pas à cet email.
            </p>
          </div>
        </div>
      `
    });
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}
