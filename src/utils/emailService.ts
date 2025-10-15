import { Resend } from 'resend';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeResend();
  }

  private initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured - email service disabled');
      this.isConfigured = false;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
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
        console.warn('Email service not configured - skipping email send');
        return false;
      }

      const { to, subject, html, from = process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>' } = emailData;

      ;
      
      const result = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (result.error) {
        console.error('Email send error:', result.error);
        console.log('📧 Résultat envoi email: false');
        return false;
      }

      console.log('📧 Résultat envoi email: true');
      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      console.log('📧 Résultat envoi email: false');
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
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
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

      const result = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>',
        to: userEmail,
        subject,
        html,
      });

      if (result.error) {
        console.error('Notification email send error:', result.error);
        return false;
      }

      // Enregistrer le log de succès
      await supabase
        .from('notification_logs')
        .insert({
          event_type: eventType,
          user_email: userEmail,
          event_data: templateData,
          email_sent: true,
          email_sent_at: new Date().toISOString()
        });

      console.log(`✅ Notification ${eventType} envoyée à ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Notification email service error:', error);
      
      // Enregistrer le log d'erreur
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabase
          .from('notification_logs')
          .insert({
            event_type: eventType,
            user_email: userEmail,
            event_data: templateData,
            email_sent: false,
            email_error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
      } catch (logError) {
        console.error('Erreur lors de l\'enregistrement du log:', logError);
      }

      return false;
    }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}
