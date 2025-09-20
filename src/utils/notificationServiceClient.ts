import { supabase } from './supabaseClient';

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

  constructor() {
    // Utilise uniquement les API routes côté serveur
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
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) return [];
      const data = await response.json();
      return data.settings || [];
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
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, updates })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Récupérer les logs de notification
  async getNotificationLogs(limit: number = 20): Promise<NotificationLog[]> {
    try {
      const response = await fetch(`/api/admin/notifications?logs=true&limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.logs || [];
    } catch (error) {
      return [];
    }
  }

  // Envoyer une notification directement via l'API
  async sendNotification(
    eventType: string,
    userEmail: string,
    eventData: any = {}
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          appName: eventData.appName || eventType,
          userName: eventData.userName || 'Utilisateur'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
      return false;
    }
  }

  // Méthodes spécifiques pour chaque type de notification
  async notifyUserCreated(userEmail: string, userName?: string): Promise<boolean> {
    return await this.sendNotification('user_created', userEmail, { userName });
  }

  async notifyUserLogin(userEmail: string, userName?: string): Promise<boolean> {
    return await this.sendNotification('user_login', userEmail, { userName });
  }

  async notifyUserLogout(userEmail: string, userName?: string): Promise<boolean> {
    return await this.sendNotification('user_logout', userEmail, { userName });
  }

  async notifyAppAccessed(userEmail: string, appName: string, userName?: string): Promise<boolean> {
    return await this.sendNotification('app_accessed', userEmail, { appName, userName });
  }

  async notifyModuleActivated(userEmail: string, moduleName: string, userName?: string): Promise<boolean> {
    return await this.sendNotification('module_activated', userEmail, { moduleName, userName });
  }
}
