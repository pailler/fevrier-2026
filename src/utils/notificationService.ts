import { EmailService } from './emailService';

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

  /**
   * Envoyer une notification d'inscription utilisateur
   */
  async sendUserSignupNotification(userEmail: string, userName: string): Promise<boolean> {
    return this.emailService.sendNotificationEmail('user_signup', userEmail, {
      user_name: userName,
      signup_date: new Date().toLocaleDateString('fr-FR')
    });
  }

  /**
   * Envoyer une notification de connexion utilisateur
   */
  async sendUserLoginNotification(userEmail: string, userName: string): Promise<boolean> {
    return this.emailService.sendNotificationEmail('user_login', userEmail, {
      user_name: userName,
      login_date: new Date().toLocaleString('fr-FR')
    });
  }

  /**
   * Envoyer une notification d'activation de module
   */
  async sendModuleActivatedNotification(userEmail: string, userName: string, moduleName: string): Promise<boolean> {
    return this.emailService.sendNotificationEmail('module_activated', userEmail, {
      user_name: userName,
      module_name: moduleName,
      activation_date: new Date().toLocaleDateString('fr-FR')
    });
  }

  /**
   * Envoyer une notification de paiement réussi
   */
  async sendPaymentSuccessNotification(userEmail: string, userName: string, amount: string, moduleName?: string): Promise<boolean> {
    return this.emailService.sendNotificationEmail('payment_success', userEmail, {
      user_name: userName,
      amount: amount,
      module_name: moduleName || 'Service IAHome',
      payment_date: new Date().toLocaleDateString('fr-FR')
    });
  }

  /**
   * Envoyer une notification de limite d'usage atteinte
   */
  async sendUsageLimitNotification(userEmail: string, userName: string, moduleName: string, currentUsage: number, maxUsage: number): Promise<boolean> {
    return this.emailService.sendNotificationEmail('module_usage_limit', userEmail, {
      user_name: userName,
      module_name: moduleName,
      current_usage: currentUsage.toString(),
      max_usage: maxUsage.toString(),
      usage_percentage: Math.round((currentUsage / maxUsage) * 100).toString()
    });
  }

  /**
   * Envoyer une alerte administrateur
   */
  async sendAdminAlert(adminEmail: string, alertType: string, alertDetails: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<boolean> {
    return this.emailService.sendNotificationEmail('admin_alert', adminEmail, {
      alert_type: alertType,
      alert_details: alertDetails,
      severity: severity,
      alert_date: new Date().toLocaleString('fr-FR')
    });
  }

  /**
   * Vérifier si le service de notifications est configuré
   */
  isConfigured(): boolean {
    return this.emailService.isServiceConfigured();
  }

  /**
   * Envoyer un email de test
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.emailService.sendTestEmail(to);
  }
}

// Export de l'instance singleton
export const notificationService = NotificationService.getInstance();