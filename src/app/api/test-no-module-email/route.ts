import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    const userEmail = email || 'formateur_tic@hotmail.com';
    const name = userName || userEmail.split('@')[0] || 'Utilisateur';

    console.log(`📧 Test d'envoi du mail "sans module activé" à ${userEmail}`);

    // Envoi direct avec Resend (sans passer par la base de données)
    console.log('📧 Envoi direct avec Resend...');
    
    const EmailService = (await import('../../../utils/emailService')).EmailService;
    const emailService = EmailService.getInstance();
    
    if (!emailService.isServiceConfigured()) {
      return NextResponse.json({
        success: false,
        message: 'Service email non configuré (RESEND_API_KEY manquant)',
        email: userEmail
      }, { status: 500 });
    }
      
      // Template HTML avec les variables remplacées
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-top: 0; font-size: 28px;">Bienvenue sur IAHome, ${name} ! 🎉</h1>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Nous avons remarqué que vous vous êtes inscrit(e) récemment mais que vous n'avez pas encore activé de module.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
                🎁 Offre spéciale : 200 tokens bonus !
              </p>
              <p style="color: #78350f; font-size: 14px; margin: 0;">
                Activez votre premier module dans les <strong>3 prochains jours</strong> et recevez automatiquement <strong>200 tokens supplémentaires</strong> sur votre compte !
              </p>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px; margin-bottom: 16px;">
              📚 Comment activer votre premier module ? (4 étapes simples)
            </h2>
            
            <div style="margin: 24px 0;">
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    1
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Connectez-vous à votre compte
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Rendez-vous sur <a href="https://iahome.fr" style="color: #2563eb; text-decoration: none;">iahome.fr</a> et connectez-vous avec vos identifiants.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    2
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Parcourez nos modules
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Accédez à la page <a href="https://iahome.fr/modules" style="color: #2563eb; text-decoration: none;">Modules</a> ou <a href="https://iahome.fr/applications" style="color: #2563eb; text-decoration: none;">Applications</a> pour découvrir tous nos outils disponibles.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    3
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Cliquez sur "Activer" ou "Accéder"
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Choisissez le module qui vous intéresse et cliquez sur le bouton d'activation. Les tokens nécessaires seront automatiquement débités de votre compte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    4
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Cliquez sur "Mes applis" dans la bannière
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Une fois le module activé, cliquez sur "Mes applis" dans la bannière en haut de la page pour accéder à toutes vos applications activées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://iahome.fr/modules" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Découvrir les modules →
              </a>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #065f46; font-size: 14px; margin: 0;">
                <strong>💡 Astuce :</strong> Vous avez déjà reçu des tokens de bienvenue lors de votre inscription. Vous pouvez les utiliser pour activer votre premier module dès maintenant !
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
              Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous accompagner !
            </p>
            
            <p style="color: #374151; font-size: 16px; margin-top: 24px;">
              À très bientôt sur IAHome !<br>
              <strong>L'équipe IAHome</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              Cet email a été envoyé automatiquement par IAHome.<br>
              Vous avez reçu cet email car vous êtes inscrit(e) sur IAHome mais n'avez pas encore activé de module.
            </p>
          </div>
        </div>
      `;

    const result = await emailService.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur IAHome ! Activez votre premier module et recevez 200 tokens bonus !',
      html: emailHtml
    });

    if (result) {
      console.log(`✅ Email envoyé avec succès à ${userEmail}`);
      return NextResponse.json({
        success: true,
        message: 'Email envoyé avec succès',
        email: userEmail,
        userName: name
      });
    } else {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${userEmail}`);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
        email: userEmail
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test email:', error);
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

