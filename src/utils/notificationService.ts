import { supabase } from './supabaseClient';
import { EmailService } from './emailService';

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
  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
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
      console.log('🔍 DEBUG: Début sendNotification');
      console.log('🔍 DEBUG: eventType:', eventType);
      console.log('🔍 DEBUG: userEmail:', userEmail);
      console.log('🔍 DEBUG: eventData:', eventData);
      
      // Vérifier si la notification est activée
      console.log('🔍 DEBUG: Vérification des paramètres de notification...');
      const { data: setting, error: settingError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('event_type', eventType)
        .single();

      console.log('🔍 DEBUG: setting:', setting);
      console.log('🔍 DEBUG: settingError:', settingError);

      if (settingError || !setting) {
        console.log('❌ DEBUG: Paramètres de notification non trouvés ou erreur');
        return false;
      }

      if (!setting.is_enabled) {
        console.log('❌ DEBUG: Notification désactivée');
        return false;
      }

      console.log('✅ DEBUG: Notification activée, préparation de l\'email...');

      // Envoyer l'email
      console.log('📧 Tentative d\'envoi d\'email pour:', { eventType, userEmail, subject: setting.email_template_subject });
      
      // Remplacer les variables dans le sujet
      const subject = this.replaceVariables(setting.email_template_subject, eventData);
      console.log('🔍 DEBUG: Sujet après remplacement:', subject);
      
      const emailData = {
        to: userEmail,
        subject: subject,
        html: await this.generateEmailHtml(eventType, eventData)
      };
      
      console.log('📧 Données email:', emailData);
      
      console.log('🔍 DEBUG: Appel de emailService.sendEmail...');
      const emailSent = await this.emailService.sendEmail(emailData);
      
      console.log('📧 Résultat envoi email:', emailSent);

      // Enregistrer le log
      console.log('🔍 DEBUG: Enregistrement du log...');
      await this.logNotification(eventType, userEmail, eventData, emailSent, emailSent ? undefined : 'Échec envoi email');

      console.log('✅ DEBUG: Fin sendNotification, résultat:', emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ DEBUG: Erreur dans sendNotification:', error);
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

  // Récupérer le template HTML pour un type d'événement
  private async getEmailTemplate(eventType: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('email_template_body')
        .eq('event_type', eventType)
        .eq('is_enabled', true)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération du template:', error);
        return null;
      }

      return data?.email_template_body || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du template:', error);
      return null;
    }
  }

  // Générer le HTML de l'email
  private async generateEmailHtml(eventType: string, eventData: any): Promise<string> {
    console.log('🔧 Génération HTML pour:', eventType);
    console.log('📦 Données événement:', eventData);
    
    // Récupérer le template depuis la base de données
    console.log('🔍 DEBUG: Récupération du template...');
    const template = await this.getEmailTemplate(eventType);
    if (!template) {
      console.error('❌ Template non trouvé pour:', eventType);
      return '<p>Template non trouvé</p>';
    }
    
    console.log('📄 Template brut:', template);
    
    // Remplacer les variables dynamiques
    console.log('🔍 DEBUG: Remplacement des variables...');
    let html = this.replaceVariables(template, eventData);
    
    // Remplacer aussi les dates hardcodées dans les templates
    const currentDate = new Date().toLocaleString('fr-FR');
    html = html.replace(/22\/08\/2025 12:03:29/g, currentDate);
    html = html.replace(/2025-08-22T12:03:29/g, new Date().toISOString());
    html = html.replace(/22\/08\/2025 13:04:17/g, currentDate);
    html = html.replace(/2025-08-22T13:04:17/g, new Date().toISOString());
    
    console.log('✅ HTML généré:', html.substring(0, 200) + '...');
    
    return html;
  }

  // Remplacer les variables dans un texte
  private replaceVariables(text: string, eventData: any): string {
    // Variables de base
    const variables: { [key: string]: string } = {
      '{userName}': eventData.userName || eventData.user_name || 'Utilisateur',
      '{appName}': eventData.appName || eventData.app_name || 'Application',
      '{timestamp}': new Date().toLocaleString('fr-FR'),
      '{date}': new Date().toLocaleDateString('fr-FR'),
      '{time}': new Date().toLocaleTimeString('fr-FR'),
      '{ip}': eventData.ip || '[Détectée automatiquement]',
      '{userId}': eventData.userId || eventData.user_id || 'N/A'
    };
    
    // Remplacer toutes les variables
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value);
    });
    
    return result;
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
