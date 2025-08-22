import { supabase } from './supabaseClient';
import { NotificationService } from './notificationService';

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

export class NotificationServiceClient {
  private static instance: NotificationServiceClient;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): NotificationServiceClient {
    if (!NotificationServiceClient.instance) {
      NotificationServiceClient.instance = new NotificationServiceClient();
    }
    return NotificationServiceClient.instance;
  }

  // Récupérer tous les paramètres de notification
  async getNotificationSettings(): Promise<NotificationSetting[]> {
    try {
      return await this.notificationService.getNotificationSettings();
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
      return await this.notificationService.updateNotificationSetting(eventType, updates);
    } catch (error) {
      return false;
    }
  }

  // Récupérer les logs de notification
  async getNotificationLogs(limit: number = 20): Promise<NotificationLog[]> {
    try {
      return await this.notificationService.getNotificationLogs(limit);
    } catch (error) {
      return [];
    }
  }

  // Envoyer une notification directement via le service
  async sendNotification(
    eventType: string,
    userEmail: string,
    eventData: any = {}
  ): Promise<boolean> {
    try {
      return await this.notificationService.sendNotification(eventType, userEmail, eventData);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
      return false;
    }
  }

  // Méthodes spécifiques pour chaque type de notification
  async notifyUserLogin(userEmail: string, userName?: string): Promise<boolean> {
    return await this.notificationService.notifyUserLogin(userEmail, userName);
  }

  async notifyUserLogout(userEmail: string, userName?: string): Promise<boolean> {
    return await this.notificationService.notifyUserLogout(userEmail, userName);
  }

  async notifyAppAccessed(userEmail: string, appName: string, userName?: string): Promise<boolean> {
    return await this.notificationService.notifyAppAccessed(userEmail, appName, userName);
  }
}
