import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Clé API Resend non configurée',
        debug: {
          apiKeyConfigured: false,
          apiKeyLength: 0
        }
      });
    }

    const resend = new Resend(apiKey);
    
    // Test 1: Vérifier la configuration de base
    let configTest = {
      apiKeyConfigured: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      fromEmailConfigured: !!fromEmail,
      fromEmail: fromEmail,
      environment: process.env.NODE_ENV
    };

    // Test 2: Essayer de récupérer les domaines
    let domainsTest = null;
    try {
      const domains = await resend.domains.list();
      domainsTest = {
        success: true,
        domains: domains.data,
        count: Array.isArray(domains.data) ? domains.data.length : 0
      };
    } catch (error) {
      domainsTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      };
    }

    // Test 3: Essayer d'envoyer un email de test simple (sans réellement l'envoyer)
    // Note: On ne peut pas envoyer à test@example.com, donc on vérifie juste la configuration
    let emailTest = {
      success: true,
      message: 'Configuration valide (test d\'envoi non effectué - utilisez POST avec un email réel)',
      note: 'Utilisez POST /api/test-resend-domain avec un email réel pour tester l\'envoi'
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: configTest,
      domains: domainsTest,
      emailTest: emailTest,
      recommendations: getRecommendations(configTest, domainsTest, emailTest)
    });

  } catch (error) {
    console.error('Erreur lors du test Resend:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

function getRecommendations(config: any, domains: any, emailTest: any) {
  const recommendations = [];

  if (!config.apiKeyConfigured) {
    recommendations.push('❌ Clé API Resend non configurée');
  }

  if (!config.fromEmailConfigured) {
    recommendations.push('❌ Email d\'expéditeur non configuré');
  }

  if (domains && !domains.success) {
    recommendations.push('❌ Impossible de récupérer les domaines - vérifiez la clé API');
  }

  if (domains && domains.success && domains.count === 0) {
    recommendations.push('⚠️ Aucun domaine configuré dans Resend - ajoutez iahome.fr dans votre dashboard Resend');
  }

  if (emailTest && !emailTest.success) {
    if (emailTest.error?.includes('domain')) {
      recommendations.push('❌ Problème de domaine - vérifiez que iahome.fr est bien configuré dans Resend');
    } else if (emailTest.error?.includes('unauthorized')) {
      recommendations.push('❌ Clé API invalide ou expirée');
    } else {
      recommendations.push(`❌ Erreur d\'envoi d\'email: ${emailTest.error}`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Configuration Resend correcte');
  }

  return recommendations;
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

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    
    // Envoyer un email de test réel
    const result = await resend.emails.send({
      from: fromEmail || 'noreply@iahome.fr',
      to: email,
      subject: 'Test de configuration Resend - IAHome',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test de configuration Resend</h2>
          <p>Ceci est un email de test pour vérifier que la configuration Resend fonctionne correctement.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>Domaine d'expédition:</strong> ${fromEmail}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement par le système de test IAHome.
          </p>
        </div>
      `
    });

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi',
        details: result.error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      emailId: result.data?.id,
      debug: {
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey.length,
        fromEmail: fromEmail
      }
    });

  } catch (error) {
    console.error('Erreur lors du test email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
