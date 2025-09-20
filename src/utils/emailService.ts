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

      console.log('🔍 DEBUG: Appel de emailService.sendEmail...');
      
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

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}
