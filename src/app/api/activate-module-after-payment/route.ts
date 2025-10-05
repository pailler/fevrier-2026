'use client';

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

    console.log('🔍 Début de l\'activation du module après paiement');
    console.log('📋 Paramètres reçus:', { sessionId, userId, userEmail, testMode });

    if (!sessionId || !userId || !userEmail) {
      console.log('❌ Paramètres manquants');
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
        } else if (sessionId.includes('invoke')) {
          moduleId = 'invoke';
          moduleTitle = 'Invoke IA';
          paymentAmount = 990; // 9.90 EUR en centimes
        } else if (sessionId.includes('stablediffusion')) {
          moduleId = 'stablediffusion';
          moduleTitle = 'Stable diffusion IA';
          paymentAmount = 990; // 9.90 EUR en centimes
        } else if (sessionId.includes('sdnext')) {
          moduleId = 'sdnext';
          moduleTitle = 'SDnext IA';
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

    // Vérifier si l'utilisateur a déjà accès à ce module
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      console.log('ℹ️ Module déjà activé pour l\'utilisateur');
      return NextResponse.json({
        success: true,
        message: 'Module déjà activé',
        moduleInfo: moduleData
      });
    }

    console.log('🔄 Activation du module pour l\'utilisateur...');

    // Activer le module pour l'utilisateur avec quota de 50 utilisations par mois
    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()); // Expire dans 1 mois
    
    const { data: activationData, error: activationError } = await supabase
      .from('user_applications')
      .insert([
        {
          user_id: userId,
          module_id: moduleId,
          module_title: moduleTitle,
          is_active: true,
          access_level: 'paid',
          usage_count: 0,
          max_usage: 50, // Quota de 50 utilisations
          expires_at: expiresAt.toISOString(), // Expire dans 1 mois
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

    console.log('✅ Module activé avec succès:', activationData);

    // Envoyer une notification d'activation du module
    try {
      const { NotificationService } = await import('../../../utils/notificationService');
      const notificationService = NotificationService.getInstance();
      
      await notificationService.notifyAppAccessed(
        userEmail,
        moduleTitle,
        userEmail.split('@')[0] || 'Utilisateur'
      );
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
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
        console.log('✅ Paiement enregistré avec succès');
      } else {
        console.log('⚠️ Table payments non disponible, paiement non enregistré');
      }
    } catch (paymentError) {
      console.error('Erreur lors de l\'enregistrement du paiement:', paymentError);
      // Ne pas faire échouer l'activation si l'enregistrement du paiement échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Module activé avec succès',
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
