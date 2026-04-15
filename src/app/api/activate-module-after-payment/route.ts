
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../utils/supabaseClient';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, userEmail, testMode = false } = body;

    ;
    console.log('📋 Paramètres reçus:', { sessionId, userId, userEmail, testMode });

    if (!sessionId || !userId || !userEmail) {
      ;
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    let moduleId: string = '';
    let moduleTitle: string = '';
    let paymentAmount = 0;
    let paymentCurrency = 'eur';

    // Mode test : simuler un paiement réussi
    if (testMode || sessionId.startsWith('cs_test_')) {
      // Pour le mode test, utiliser les métadonnées ou détecter le module
      // D'abord, essayer de récupérer la session Stripe pour obtenir les métadonnées
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.metadata) {
          moduleId = session.metadata.moduleId || '';
          moduleTitle = session.metadata.moduleTitle || '';
          paymentAmount = session.amount_total ? session.amount_total / 100 : 0;
          paymentCurrency = session.currency || 'eur';
        }
      } catch (error) {
        console.log('Impossible de récupérer la session Stripe, utilisation du fallback');
      }
      
      // Fallback si les métadonnées ne sont pas disponibles
      if (!moduleId || !moduleTitle) {
        if (sessionId.includes('comfyui')) {
          moduleId = 'comfyui';
          moduleTitle = 'ComfyUI';
          paymentAmount = 2999; // 29.99 EUR en centimes
        } else if (sessionId.includes('cogstudio')) {
          moduleId = 'cogstudio';
          moduleTitle = 'CogStudio';
          paymentAmount = 990; // 9.90 EUR en centimes
        } else if (sessionId.includes('stablediffusion')) {
          moduleId = 'stablediffusion';
          moduleTitle = 'Stable diffusion IA';
          paymentAmount = 990; // 9.90 EUR en centimes
          paymentAmount = 1990; // 19.90 EUR en centimes
        } else if (sessionId.includes('qrcodes')) {
          moduleId = 'qrcodes';
          moduleTitle = 'QR codes dynamiques';
          paymentAmount = 499; // 4.99 EUR en centimes
        } else if (sessionId.includes('ruinedfooocus')) {
          moduleId = 'ruinedfooocus';
          moduleTitle = 'RuinedFooocus';
          paymentAmount = 999; // 9.99 EUR en centimes
        } else {
          // Module par défaut pour le test (fallback)
          moduleId = 'ruinedfooocus';
          moduleTitle = 'RuinedFooocus';
          paymentAmount = 999; // 9.99 EUR en centimes
        }
        paymentCurrency = 'eur';
      }
      
      console.log('🧪 Mode test activé - Simulation d\'un paiement réussi pour', moduleTitle);
    } else {
      // Mode production : vérifier avec Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session Stripe non trouvée' },
          { status: 404 }
        );
      }

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { success: false, error: 'Paiement non complété' },
          { status: 400 }
        );
      }

      // Extraire les informations du module depuis les métadonnées
      moduleId = session.metadata?.moduleId || '';
      moduleTitle = session.metadata?.moduleTitle || '';
      paymentAmount = session.amount_total ? session.amount_total / 100 : 0;
      paymentCurrency = session.currency || 'eur';
    }

    if (!moduleId || !moduleTitle) {
      console.log('❌ Informations du module manquantes:', { moduleId, moduleTitle });
      return NextResponse.json(
        { success: false, error: 'Informations du module manquantes' },
        { status: 400 }
      );
    }

    console.log('✅ Module détecté:', { moduleId, moduleTitle, paymentAmount, paymentCurrency });

    // Récupérer les informations du module depuis la base de données
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError || !moduleData) {
      console.log('❌ Module non trouvé dans la base de données:', { moduleId, moduleError });
      return NextResponse.json(
        { success: false, error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Module trouvé dans la base de données:', moduleData.title);

    // Vérifier si l'utilisateur a déjà un accès (actif ou expiré)
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    const now = new Date().toISOString();
    let activationData;

    if (existingAccess && !accessError && existingAccess.is_active) {
      return NextResponse.json({
        success: true,
        message: 'Cette appli est déjà enregistrée sur votre compte',
        moduleInfo: moduleData
      });
    }

    if (existingAccess && !accessError) {
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'paid',
          usage_count: 0,
          updated_at: now
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la réactivation du module' },
          { status: 500 }
        );
      }
      activationData = reactivatedAccess;
    } else {
      const { data: newAccess, error: activationError } = await supabase
        .from('user_applications')
        .insert([
          {
            user_id: userId,
            module_id: moduleId,
            module_title: moduleTitle,
            is_active: true,
            access_level: 'paid',
            usage_count: 0,
            created_at: now,
            updated_at: now
          }
        ])
        .select()
        .single();

      if (activationError) {
        console.error('❌ Erreur lors de l\'activation du module:', activationError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de l\'activation du module' },
          { status: 500 }
        );
      }

      activationData = newAccess;
      console.log('✅ Module activé avec succès:', activationData);
    }

    // Envoyer une notification d'activation du module à l'utilisateur
    try {
      const { EmailService } = await import('../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      await emailService.sendNotificationEmail('module_activated', userEmail, {
        user_name: userEmail.split('@')[0] || 'Utilisateur',
        user_email: userEmail,
        module_name: moduleTitle,
        module_id: moduleId,
        activation_date: new Date().toLocaleDateString('fr-FR'),
        activation_time: new Date().toLocaleTimeString('fr-FR'),
        activation_method: 'Paiement'
      });
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification utilisateur:', notificationError);
      // Ne pas faire échouer l'activation si la notification échoue
    }

    // Envoyer une notification à l'admin
    try {
      const { EmailService } = await import('../../../utils/emailService');
      const emailService = EmailService.getInstance();
      
      await emailService.sendNotificationEmail('admin_module_activated', 'formateur_tic@hotmail.com', {
        user_name: userEmail.split('@')[0] || 'Utilisateur',
        user_email: userEmail,
        module_name: moduleTitle,
        module_id: moduleId,
        activation_date: new Date().toLocaleDateString('fr-FR'),
        activation_time: new Date().toLocaleTimeString('fr-FR'),
        activation_method: 'Paiement'
      });
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification admin:', notificationError);
      // Ne pas faire échouer l'activation si la notification échoue
    }

    // Enregistrer le paiement dans la base de données (optionnel)
    try {
      // Vérifier si la table payments existe
      const { data: paymentTest } = await supabase
        .from('payments')
        .select('id')
        .limit(1);
      
      if (paymentTest !== null) {
        // La table existe, on peut essayer d'insérer
        await supabase
          .from('payments')
          .insert([
            {
              user_id: userId,
              module_id: moduleId,
              stripe_session_id: sessionId,
              amount: paymentAmount,
              currency: paymentCurrency,
              status: 'completed',
              payment_method: testMode || sessionId.startsWith('cs_test_') ? 'test' : 'stripe',
              metadata: {
                moduleTitle: moduleTitle,
                customerEmail: userEmail,
                testMode: testMode || sessionId.startsWith('cs_test_'),
              }
            }
          ]);
        ;
      } else {
        console.log('⚠️ Table payments non disponible, paiement non enregistré');
      }
    } catch (paymentError) {
      console.error('Erreur lors de l\'enregistrement du paiement:', paymentError);
      // Ne pas faire échouer l'activation si l'enregistrement du paiement échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Accès ouvert sur votre compte',
      moduleInfo: moduleData,
      activationData: activationData
    });

  } catch (error) {
    console.error('Erreur lors de l\'activation du module après paiement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
