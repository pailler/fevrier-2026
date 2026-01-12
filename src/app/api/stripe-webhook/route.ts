import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../utils/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook Stripe reçu sur /api/stripe-webhook');
    console.log('📋 Headers reçus:', {
      'stripe-signature': request.headers.get('stripe-signature') ? 'présent' : 'manquant',
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent')
    });
    
    const body = await request.text();
    console.log('📦 Taille du body:', body.length, 'caractères');
    
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('❌ Signature manquante');
      console.log('📋 Tous les headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configuré dans les variables d\'environnement');
      return NextResponse.json(
        { error: 'Configuration webhook manquante' },
        { status: 500 }
      );
    }

    console.log('🔐 Vérification de la signature webhook...');
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Signature webhook valide');
    } catch (error) {
      console.log('❌ Erreur de signature webhook:', error);
      if (error instanceof Error) {
        console.log('❌ Message d\'erreur:', error.message);
      }
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    console.log('🔔 Événement Stripe reçu:', event.type);
    console.log('📋 Détails de l\'événement:', {
      id: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString()
    });

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log('ℹ️ Événement non géré:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ ===== CHECKOUT SESSION COMPLETED =====');
  console.log('✅ Session de paiement complétée:', session.id);
  console.log('📋 Détails de la session:', {
    id: session.id,
    mode: session.mode,
    payment_status: session.payment_status,
    status: session.status,
    amount_total: session.amount_total,
    customer_email: session.customer_email,
    subscription: session.subscription,
    metadata: session.metadata
  });

  // Vérifier le statut du paiement et de la session
  if (session.payment_status !== 'paid') {
    console.log('⚠️ Paiement non complété - ARRÊT:', {
      payment_status: session.payment_status,
      status: session.status
    });
    return;
  }
  
  console.log('✅ Paiement complété, continuation du traitement...');

  // Vérifier aussi le statut de la session pour les abonnements
  if (session.mode === 'subscription' && session.status !== 'complete') {
    console.log('⚠️ Session d\'abonnement non complète:', {
      status: session.status,
      payment_status: session.payment_status
    });
    // Ne pas retourner, continuer car le paiement peut être en cours
  }

  const moduleId = session.metadata?.moduleId;
  const moduleTitle = session.metadata?.moduleTitle;
  // Utiliser userEmail depuis les métadonnées (nouveau système) ou customerEmail (ancien système) ou customer_email (Stripe)
  const customerEmail = session.metadata?.userEmail || session.metadata?.customerEmail || session.customer_email;
  const isTestMode = session.metadata?.testMode === 'true';
  const paymentType = session.metadata?.type;
  const packageType = session.metadata?.packageType;

  if (!customerEmail) {
    console.log('❌ Email client manquant:', {
      metadata: session.metadata,
      customer_email: session.customer_email
    });
    return;
  }

  console.log('📧 Email client:', customerEmail);
  console.log('📦 Package type:', packageType);
  console.log('💰 Montant:', session.amount_total ? (session.amount_total / 100) + '€' : 'N/A');
  console.log('🔍 Mode session:', session.mode);

  // Récupérer l'utilisateur par email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (userError || !userData) {
    console.log('❌ Utilisateur non trouvé:', customerEmail);
    return;
  }

  // Gérer les abonnements (premier paiement)
  // Vérifier si c'est un abonnement même si packageType n'est pas dans les métadonnées
  // (on peut le récupérer depuis l'abonnement si nécessaire)
  if (session.mode === 'subscription') {
    // Si packageType n'est pas dans les métadonnées, essayer de le récupérer depuis l'abonnement
    let finalPackageType = packageType;
    let finalTokens = parseInt(session.metadata?.tokens || '3000');
    
    if (!finalPackageType && session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        finalPackageType = subscription.metadata?.packageType || 'subscription_monthly';
        finalTokens = parseInt(subscription.metadata?.tokens || '3000');
        console.log('📦 Package type récupéré depuis l\'abonnement:', finalPackageType);
      } catch (error) {
        console.error('❌ Erreur récupération abonnement:', error);
        // Utiliser les valeurs par défaut
        finalPackageType = 'subscription_monthly';
        finalTokens = 3000;
      }
    }
    
    if (!finalPackageType) {
      console.log('⚠️ Package type non trouvé, utilisation de la valeur par défaut');
      finalPackageType = 'subscription_monthly';
      finalTokens = 3000;
    }
    const subscriptionId = session.subscription as string;
    
    console.log('🔄 Abonnement créé - Crédit des tokens initiaux:', {
      userId: userData.id,
      subscriptionId,
      packageType: finalPackageType,
      tokens: finalTokens,
      metadata: session.metadata,
      subscriptionMetadata: session.subscription ? 'à récupérer' : 'N/A'
    });

    // Pour le premier paiement d'abonnement, créditer les tokens immédiatement
    // Cela garantit que l'utilisateur a ses tokens même si invoice.payment_succeeded est retardé
    const tokenQuota = finalTokens; // 3000 tokens par mois

    // Récupérer les tokens actuels pour logging
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userData.id)
      .single();

    const previousTokens = existingTokens?.tokens || 0;

    console.log('🔄 Crédit tokens abonnement initial (REMPLACEMENT):', {
      userEmail: customerEmail,
      previousTokens,
      tokenQuota,
      action: 'REMPLACEMENT (quota mensuel)'
    });

    // REMPLACER les tokens par le quota mensuel (pas d'accumulation)
    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userData.id,
        tokens: tokenQuota, // REMPLACER par le quota mensuel (3000)
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('❌ ERREUR CRITIQUE - Mise à jour tokens échouée:', updateError);
      console.error('❌ Détails de l\'erreur:', JSON.stringify(updateError, null, 2));
      // Ne pas retourner, continuer pour enregistrer la transaction
    } else {
      console.log(`✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS =====`);
      console.log(`✅ ${tokenQuota} tokens crédités pour ${customerEmail} (abonnement initial)`);
      console.log(`   Tokens précédents: ${previousTokens} → Nouveaux tokens: ${tokenQuota} (REMPLACEMENT)`);
      console.log(`   User ID: ${userData.id}`);
      console.log(`   Email: ${customerEmail}`);
    }

    // Enregistrer la transaction
    try {
      const { error: transactionError } = await supabase
        .from('user_credit_transactions')
        .insert({
          user_id: userData.id,
          transaction_type: 'subscription_initial',
          amount: (session.amount_total || 0) / 100,
          tokens: finalTokens,
          stripe_invoice_id: session.id,
          stripe_subscription_id: subscriptionId,
          package_type: finalPackageType,
          description: `Abonnement initial - ${finalTokens} tokens`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('❌ Erreur enregistrement transaction (checkout):', transactionError);
      } else {
        console.log('✅ Transaction enregistrée dans user_credit_transactions (checkout)');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction (checkout):', error);
    }

    // NOTE: invoice.payment_succeeded créditera aussi les tokens lors des renouvellements
    // Pour éviter le double crédit, on vérifie billing_reason dans handleInvoicePaymentSucceeded
    return;
  }

  // Gérer l'achat de tokens (pack standard ou ancien système)
  if (paymentType === 'token_purchase' || packageType === 'pack_standard') {
    const tokenPackage = session.metadata?.tokenPackage || packageType || 'pack_standard';
    const tokens = parseInt(session.metadata?.tokens || '3000');

    if (!tokens || tokens <= 0) {
      console.log('❌ Données de tokens manquantes ou invalides:', session.metadata);
      return;
    }

    console.log('🔄 Ajout de tokens via webhook:', {
      userId: userData.id,
      tokens,
      package: tokenPackage
    });

    // Récupérer les tokens actuels
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userData.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      console.error('❌ Erreur récupération tokens:', tokensError);
      return;
    }

    const currentTokens = existingTokens?.tokens || 0;
    const newTokenCount = currentTokens + tokens;

    // Ajouter les tokens à l'utilisateur (addition, pas remplacement)
    const { error: tokenError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userData.id,
        tokens: newTokenCount,
        package_name: tokenPackage,
        purchase_date: new Date().toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (tokenError) {
      console.error('❌ Erreur lors de l\'ajout des tokens:', tokenError);
      return;
    }

    console.log(`✅ ${tokens} tokens ajoutés (Total: ${newTokenCount})`);
    console.log('✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS (ACHAT UNIQUE) =====');

    // Enregistrer la transaction pour le pack standard
    if (packageType === 'pack_standard') {
      try {
        const { error: transactionError } = await supabase
          .from('user_credit_transactions')
          .insert({
            user_id: userData.id,
            transaction_type: 'token_purchase',
            amount: (session.amount_total || 0) / 100,
            tokens: tokens,
            stripe_invoice_id: session.id,
            package_type: packageType,
            description: `Achat Pack Standard - ${tokens} tokens`,
            created_at: new Date().toISOString()
          });

        if (transactionError) {
          console.error('❌ Erreur enregistrement transaction:', transactionError);
        } else {
          console.log('✅ Transaction enregistrée');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
      }
    }

    return;
  }

  // Gérer l'activation de module (logique existante)
  if (!moduleId || !moduleTitle) {
    console.log('❌ Métadonnées module manquantes:', session.metadata);
    return;
  }

  console.log('🔄 Activation du module via webhook:', {
    moduleId,
    moduleTitle,
    customerEmail,
    isTestMode
  });

  // Vérifier si l'utilisateur a déjà accès à ce module
  const { data: existingAccess } = await supabase
    .from('user_applications')
    .select('*')
    .eq('user_id', userData.id)
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .single();

  if (existingAccess) {
    ;
    return;
  }

  // Activer le module
  // Déterminer la durée d'expiration selon le type de module
  const now = new Date();
  const aiModules = ['whisper', 'stablediffusion', 'ruinedfooocus', 'comfyui', 'hunyuan3d', 'prompt-generator'];
  const isAIModule = aiModules.some(id => moduleId.toLowerCase().includes(id));
  
  // Modules IA : 30 jours (1 mois), Modules essentiels : 90 jours (3 mois)
  const expiresAt = new Date(now);
  if (isAIModule) {
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois
  } else {
    expiresAt.setDate(expiresAt.getDate() + 90); // 3 mois
  }

  const { data: activationData, error: activationError } = await supabase
    .from('user_applications')
    .insert([
      {
        user_id: userData.id,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'paid',
        usage_count: 0,
        max_usage: 50,
        expires_at: expiresAt.toISOString(),
      }
    ])
    .select()
    .single();

  if (activationError) {
    console.error('❌ Erreur lors de l\'activation:', activationError);
    return;
  }

  console.log('✅ Module activé avec succès via webhook:', activationData);

  // Envoyer une notification à l'utilisateur
  try {
    const { EmailService } = await import('../../../utils/emailService');
    const emailService = EmailService.getInstance();
    
    await emailService.sendNotificationEmail('module_activated', customerEmail, {
      user_name: customerEmail.split('@')[0] || 'Utilisateur',
      user_email: customerEmail,
      module_name: moduleTitle,
      module_id: moduleId,
      activation_date: new Date().toLocaleDateString('fr-FR'),
      activation_time: new Date().toLocaleTimeString('fr-FR'),
      activation_method: 'Paiement'
    });
  } catch (notificationError) {
    console.error('Erreur lors de l\'envoi de la notification utilisateur:', notificationError);
  }

  // Envoyer une notification à l'admin
  try {
    const { EmailService } = await import('../../../utils/emailService');
    const emailService = EmailService.getInstance();
    
    await emailService.sendNotificationEmail('admin_module_activated', 'formateur_tic@hotmail.com', {
      user_name: customerEmail.split('@')[0] || 'Utilisateur',
      user_email: customerEmail,
      module_name: moduleTitle,
      module_id: moduleId,
      activation_date: new Date().toLocaleDateString('fr-FR'),
      activation_time: new Date().toLocaleTimeString('fr-FR'),
      activation_method: 'Paiement'
    });
  } catch (notificationError) {
    console.error('Erreur lors de l\'envoi de la notification admin:', notificationError);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Paiement réussi:', paymentIntent.id);
  // Logique supplémentaire si nécessaire
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Paiement échoué:', paymentIntent.id);
  // Logique de gestion d'échec si nécessaire
}

// Gérer les renouvellements d'abonnement
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Paiement d\'abonnement réussi:', invoice.id);

  // Vérifier si c'est une facture d'abonnement
  // invoice.subscription peut être string | Subscription | null selon la version de Stripe
  const subscriptionId = (invoice as any).subscription 
    ? (typeof (invoice as any).subscription === 'string' 
        ? (invoice as any).subscription 
        : (invoice as any).subscription.id)
    : null;
  if (!subscriptionId) {
    console.log('ℹ️ Ce n\'est pas une facture d\'abonnement, ignoré');
    return;
  }

  // Récupérer l'abonnement depuis Stripe
  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('❌ Erreur récupération abonnement:', error);
    return;
  }

  // Récupérer les métadonnées de l'abonnement
  const userId = subscription.metadata?.userId;
  const userEmail = subscription.metadata?.userEmail || invoice.customer_email;
  const packageType = subscription.metadata?.packageType;
  const tokens = parseInt(subscription.metadata?.tokens || '3000');

  if (!userEmail) {
    console.log('❌ Email utilisateur manquant dans l\'abonnement');
    return;
  }

  // Récupérer l'utilisateur par email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    console.log('❌ Utilisateur non trouvé:', userEmail);
    return;
  }

  // Vérifier si c'est le premier paiement (checkout) ou un renouvellement
  const isFirstPayment = invoice.billing_reason === 'subscription_create';
  const isRenewal = invoice.billing_reason === 'subscription_cycle';

  console.log('🔄 Traitement paiement abonnement:', {
    invoiceId: invoice.id,
    subscriptionId,
    userEmail,
    packageType,
    tokens,
    billingReason: invoice.billing_reason,
    isFirstPayment,
    isRenewal
  });

  // Pour le premier paiement (subscription_create), les tokens ont déjà été crédités
  // via checkout.session.completed pour garantir un crédit immédiat
  // On ne crédite que lors des renouvellements (subscription_cycle)
  if (isFirstPayment) {
    console.log('ℹ️ Premier paiement détecté - Les tokens ont déjà été crédités via checkout.session.completed');
    console.log('   Enregistrement de la transaction uniquement...');
    
    // Enregistrer quand même la transaction pour l'historique
    try {
      const { error: transactionError } = await supabase
        .from('user_credit_transactions')
        .insert({
          user_id: userData.id,
          transaction_type: 'subscription_initial',
          amount: invoice.amount_paid / 100,
          tokens: tokens,
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: subscriptionId,
          package_type: packageType || 'subscription_monthly',
          description: `Abonnement initial - ${tokens} tokens (déjà crédité via checkout)`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('❌ Erreur enregistrement transaction:', transactionError);
      } else {
        console.log('✅ Transaction enregistrée (tokens déjà crédités)');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
    }
    
    return; // Ne pas créditer à nouveau
  }

  // Pour les renouvellements : REMPLACER les tokens par le quota mensuel (pas d'accumulation)
  // Chaque mois, l'utilisateur a exactement 3000 tokens (quota mensuel)
  const tokenQuota = tokens; // 3000 tokens par mois

  // Récupérer les tokens actuels pour logging (avant remplacement)
  const { data: existingTokens, error: tokensError } = await supabase
    .from('user_tokens')
    .select('tokens')
    .eq('user_id', userData.id)
    .single();

  const previousTokens = existingTokens?.tokens || 0;

  console.log('🔄 Mise à jour quota mensuel (REMPLACEMENT):', {
    userEmail,
    previousTokens, // Tokens avant remplacement
    tokenQuota, // Nouveau quota (3000)
    billingReason: invoice.billing_reason,
    action: 'REMPLACEMENT (pas d\'accumulation)'
  });

  // Mettre à jour les tokens de l'utilisateur (remplacement, pas addition)
  // IMPORTANT: upsert avec onConflict remplace les tokens existants
  const { error: updateError } = await supabase
    .from('user_tokens')
    .upsert({
      user_id: userData.id,
      tokens: tokenQuota, // REMPLACER par le quota mensuel (3000)
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (updateError) {
    console.error('❌ Erreur mise à jour tokens:', updateError);
    return;
  }

  console.log(`✅ Quota mensuel de ${tokenQuota} tokens crédité pour ${userEmail}`);
  console.log(`   Tokens précédents: ${previousTokens} → Nouveaux tokens: ${tokenQuota} (REMPLACEMENT)`);
  console.log('✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS (RENOUVELLEMENT) =====');

  // Enregistrer la transaction dans user_credit_transactions
  try {
    const { error: transactionError } = await supabase
      .from('user_credit_transactions')
      .insert({
        user_id: userData.id,
        transaction_type: isRenewal ? 'subscription_renewal' : 'subscription_initial',
        amount: invoice.amount_paid / 100, // Convertir de centimes en euros
        tokens: tokens,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: subscriptionId,
        package_type: packageType || 'subscription_monthly',
        description: isRenewal 
          ? `Renouvellement abonnement - ${tokens} tokens`
          : `Abonnement initial - ${tokens} tokens`,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ Erreur enregistrement transaction:', transactionError);
      // Ne pas bloquer le processus si l'enregistrement échoue
    } else {
      console.log('✅ Transaction enregistrée dans user_credit_transactions');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
    // Ne pas bloquer le processus
  }
}

// Gérer les échecs de paiement d'abonnement
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Paiement d\'abonnement échoué:', invoice.id);

  const subscriptionId = (invoice as any).subscription 
    ? (typeof (invoice as any).subscription === 'string' 
        ? (invoice as any).subscription 
        : (invoice as any).subscription.id)
    : null;
  if (!subscriptionId) {
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userEmail = subscription.metadata?.userEmail || invoice.customer_email;

    if (userEmail) {
      console.log(`⚠️ Échec de paiement pour ${userEmail} - Abonnement: ${subscriptionId}`);
      
      // Optionnel : Envoyer un email à l'utilisateur
      // Optionnel : Suspendre l'accès
    }
  } catch (error) {
    console.error('❌ Erreur gestion échec paiement:', error);
  }
}

// Gérer l'annulation d'abonnement
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🛑 Abonnement annulé:', subscription.id);

  const userEmail = subscription.metadata?.userEmail;
  if (userEmail) {
    console.log(`ℹ️ Abonnement annulé pour ${userEmail}`);
    
    // Optionnel : Enregistrer l'annulation dans la base de données
    // Optionnel : Envoyer un email de confirmation d'annulation
  }
}
