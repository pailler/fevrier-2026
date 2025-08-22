import { supabase } from './supabaseClient';
// import { EmailService } from './emailService';

export interface NotificationSetting {
  id: string;
  event_type: string;
  event_name: string;
  event_description: string;
  is_enabled: boolean;
  email_template_subject: string;
  email_template_body: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  event_type: string;
  user_id?: string;
  user_email?: string;
  event_data: any;
  email_sent: boolean;
  email_sent_at?: string;
  email_error?: string;
  created_at: string;
}

export class NotificationService {
  private static instance: NotificationService;
  // private emailService: EmailService;

  constructor() {
    // this.emailService = EmailService.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Récupérer tous les paramètres de notification
  async getNotificationSettings(): Promise<NotificationSetting[]> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('event_name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Mettre à jour un paramètre de notification
  async updateNotificationSetting(
    eventType: string, 
    updates: Partial<NotificationSetting>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('event_type', eventType);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Envoyer une notification
  async sendNotification(
    eventType: string,
    userEmail: string,
    eventData: any = {}
  ): Promise<boolean> {
    try {
      // Vérifier si la notification est activée
      const { data: setting, error: settingError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('event_type', eventType)
        .single();

      if (settingError || !setting) {
        return false;
      }

      if (!setting.is_enabled) {
        return false;
      }

      // Envoyer l'email (désactivé temporairement)
      const emailSent = false; // await this.emailService.sendEmail({
      //   to: userEmail,
      //   subject: setting.email_template_subject,
      //   html: this.generateEmailHtml(setting.email_template_body, eventData)
      // });

      // Enregistrer le log
      await this.logNotification(eventType, userEmail, eventData, emailSent);

      return emailSent;
    } catch (error) {
      await this.logNotification(eventType, userEmail, eventData, false, error instanceof Error ? error.message : 'Erreur inconnue');
      return false;
    }
  }

  // Enregistrer un log de notification
  private async logNotification(
    eventType: string,
    userEmail: string,
    eventData: any,
    emailSent: boolean,
    emailError?: string
  ): Promise<void> {
    try {
      await supabase
        .from('notification_logs')
        .insert({
          event_type: eventType,
          user_email: userEmail,
          event_data: eventData,
          email_sent: emailSent,
          email_sent_at: emailSent ? new Date().toISOString() : null,
          email_error: emailError
        });
    } catch (error) {
      }
  }

  // Récupérer les logs de notification
  async getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Générer le HTML de l'email
  private generateEmailHtml(template: string, eventData: any): string {
    // Remplacer les variables dans le template
    let html = template;
    
    // Ajouter des variables dynamiques basées sur eventData
    if (eventData.userName) {
      html = html.replace('{userName}', eventData.userName);
    }
    if (eventData.moduleName) {
      html = html.replace('{moduleName}', eventData.moduleName);
    }
    if (eventData.appName) {
      html = html.replace('{appName}', eventData.appName);
    }
    if (eventData.timestamp) {
      html = html.replace('{timestamp}', new Date(eventData.timestamp).toLocaleString('fr-FR'));
    }

    // Template HTML de base
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification IAHome</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔔 Notification IAHome</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Système de notifications</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                ${html}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://iahome.fr'}/admin" 
                 style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Accéder à l'admin
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              L'équipe IAHome<br>
              <a href="mailto:support@iahome.fr" style="color: #2563eb; text-decoration: none;">support@iahome.fr</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Méthodes spécifiques pour chaque type d'événement
  async notifyUserCreated(userEmail: string, userName?: string): Promise<boolean> {
    return this.sendNotification('user_created', userEmail, {
      userName,
      timestamp: new Date().toISOString()
    });
  }

  async notifyUserLogin(userEmail: string, userName?: string): Promise<boolean> {
    return this.sendNotification('user_login', userEmail, {
      userName,
      timestamp: new Date().toISOString()
    });
  }

  async notifyModuleActivated(userEmail: string, moduleName: string, userName?: string): Promise<boolean> {
    return this.sendNotification('module_activated', userEmail, {
      userName,
      moduleName,
      timestamp: new Date().toISOString()
    });
  }

  async notifyUserLogout(userEmail: string, userName?: string): Promise<boolean> {
    return this.sendNotification('user_logout', userEmail, {
      userName,
      timestamp: new Date().toISOString()
    });
  }

  async notifyAppAccessed(userEmail: string, appName: string, userName?: string): Promise<boolean> {
    return this.sendNotification('app_accessed', userEmail, {
      userName,
      appName,
      timestamp: new Date().toISOString()
    });
  }
}
