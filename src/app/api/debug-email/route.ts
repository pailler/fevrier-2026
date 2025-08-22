import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../utils/emailService';

export async function GET() {
  try {
    const emailService = EmailService.getInstance();
    const apiKey = process.env.RESEND_API_KEY;
    
    return NextResponse.json({
      success: true,
      debug: {
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Non configurée',
        emailServiceInitialized: !!emailService,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors du debug', details: error instanceof Error ? error.message : 'Erreur inconnue' },
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
    
    // Test d'envoi d'email simple
    const result = await emailService.sendTestEmail(email);
    
    return NextResponse.json({
      success: result,
      message: result ? 'Email de test envoyé avec succès' : 'Erreur lors de l\'envoi de l\'email de test',
      debug: {
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        emailServiceInitialized: !!emailService
      }
    });

  } catch (error) {
    console.error('Erreur lors du test email:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        debug: {
          apiKeyConfigured: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0
        }
      },
      { status: 500 }
    );
  }
}
