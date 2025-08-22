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

  constructor() {}

  static getInstance(): NotificationServiceClient {
    if (!NotificationServiceClient.instance) {
      NotificationServiceClient.instance = new NotificationServiceClient();
    }
    return NotificationServiceClient.instance;
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

  // Récupérer les logs de notification
  async getNotificationLogs(limit: number = 20): Promise<NotificationLog[]> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Envoyer une notification via l'API
  async sendNotification(
    eventType: string,
    userEmail: string,
    eventData: any = {}
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          userEmail,
          eventData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  }
}
