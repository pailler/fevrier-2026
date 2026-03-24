import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';
import { EmailService } from '../../../utils/emailService';

type ResendTestDebug = {
  success: boolean;
  error?: string | null;
  emailId?: string | null;
  message?: string;
  fromFormatted?: string;
  note?: string;
};

export async function GET() {
  try {
    const debug: {
      timestamp: string;
      environment: string | undefined;
      resend: {
        apiKeyConfigured: boolean;
        apiKeyLength: number;
        apiKeyPrefix: string;
        fromEmailConfigured: boolean;
        fromEmail: string;
      };
      services: {
        emailServiceInitialized: boolean;
        notificationServiceInitialized: boolean;
      };
      resendTest: ResendTestDebug;
      notificationSettings: any[];
      recentLogs: any[];
    } = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Configuration Resend
      resend: {
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Non configurée',
        fromEmailConfigured: !!process.env.RESEND_FROM_EMAIL,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Non configuré'
      },
      
      // Services
      services: {
        emailServiceInitialized: false,
        notificationServiceInitialized: false
      },
      
      // Test Resend direct
      resendTest: {
        success: false,
        error: null,
        emailId: null,
      },
      
      // Paramètres de notification
      notificationSettings: [] as any[],
      
      // Logs récents
      recentLogs: [] as any[]
    };

    // Test EmailService
    try {
      const emailService = EmailService.getInstance();
      debug.services.emailServiceInitialized = !!emailService;
      
      // Test config Resend (pas d'envoi réel en GET - utiliser POST avec email pour tester)
      if (process.env.RESEND_API_KEY) {
        const rawFrom = process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr';
        const fromFormatted = rawFrom.includes('<') ? rawFrom : `IAHome <${rawFrom}>`;
        debug.resendTest = {
          success: true,
          message: 'Config OK - Utilisez POST avec votre email pour tester l\'envoi réel',
          fromFormatted,
          note: 'Resend rejette test@example.com - utiliser un email réel'
        };
      } else {
        debug.resendTest = {
          success: false,
          error: 'RESEND_API_KEY manquant',
          emailId: null,
        };
      }
    } catch (error) {
      debug.resendTest.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test NotificationService
    try {
      const notificationService = NotificationService.getInstance();
      debug.services.notificationServiceInitialized = !!notificationService;
      // debug.services.notificationServiceConfigured = notificationService.isConfigured();
      
      // Note: Les méthodes getNotificationSettings et getNotificationLogs 
      // ne sont pas implémentées dans le service actuel
      debug.notificationSettings = [];
      debug.recentLogs = [];
    } catch (error) {
      console.error('Erreur NotificationService:', error);
    }

    return NextResponse.json({
      success: true,
      debug
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du diagnostic',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    const result = await emailService.sendTestEmail(email);

    return NextResponse.json({
      success: result,
      message: result ? 'Email de test envoyé avec succès' : 'Échec de l\'envoi de l\'email de test',
      debug: {
        email,
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.RESEND_API_KEY
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du test d\'email',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
