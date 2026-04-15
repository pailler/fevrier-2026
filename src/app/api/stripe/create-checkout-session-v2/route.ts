import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isPrestationMarketingPromoActive } from '../../../../utils/prestationMarketingPromo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Configuration des nouveaux packages
const PACKAGES_V2 = {
  subscription_monthly: {
    name: 'Abonnement Starter Mensuel',
    price: 990, // 9,90€ en centimes
    testPrice: 50, // 0,50€ en centimes pour les tests
    tokens: 3000,
    pricePerToken: 0.0033,
    description: '3000 tokens/mois - Accès complet à toutes les applications',
    mode: 'subscription' as const,
    interval: 'month' as const,
  },
  subscription_yearly: {
    name: 'Abonnement Starter Annuel',
    price: 9900, // 99,00€ en centimes
    testPrice: 50, // 0,50€ en centimes pour les tests
    tokens: 3000, // tokens par mois
    totalTokens: 36000, // tokens pour l'année
    pricePerToken: 0.00275,
    description: '3000 tokens/mois × 12 mois - 2 mois gratuits',
    mode: 'subscription' as const,
    interval: 'year' as const,
  },
  pack_standard: {
    name: 'Pack Standard',
    price: 1980, // 19,80€ en centimes
    testPrice: 50, // 0,50€ en centimes pour les tests
    tokens: 3000,
    pricePerToken: 0.0066,
    description: '3000 tokens - Achat unique sans engagement',
    mode: 'payment' as const,
  },
  photobooth_personalized: {
    name: 'Photobooth personnalisé',
    price: 39900, // 399,00€ TTC (199,00€ pendant la ristourne jusqu’au 5 avril 2026 inclus)
    testPrice: 50,
    tokens: 0,
    pricePerToken: 0,
    description:
      'Borne Photobooth sur mesure (événement) — paiement en ligne IA Home. Nous vous recontactons pour la personnalisation.',
    mode: 'payment' as const,
  },
  prestation_marketing: {
    name: 'Prestation développement sur mesure',
    price: 24900, // 249,00€ TTC (199,00€ pendant la ristourne jusqu’au 5 avril 2026 inclus)
    testPrice: 50,
    tokens: 0,
    pricePerToken: 0,
    description:
      'Accompagnement / développement sur mesure — paiement en ligne sécurisé. Nous vous recontactons pour préciser votre projet.',
    mode: 'payment' as const,
  },
};

// Emails autorisés pour les tests avec prix minimum
// DÉSACTIVÉ en production - Tous les utilisateurs paient le prix normal
const TEST_EMAILS: string[] = []; // Liste vide en production

// Fonction pour déterminer si on utilise les prix de test
function shouldUseTestPrice(userEmail: string | undefined): boolean {
  // Mode test forcé via variable d'environnement (pour tests uniquement)
  const forceTestMode = process.env.STRIPE_FORCE_TEST_PRICE === 'true';
  if (forceTestMode) {
    console.log('🔧 MODE TEST FORCÉ via STRIPE_FORCE_TEST_PRICE');
    return true;
  }
  
  // En production, ne jamais utiliser les prix de test
  // Même pour les emails de test, utiliser le prix normal
  console.log('🔍 Vérification prix test:', {
    userEmail,
    forceTestMode,
    result: false,
    reason: 'Production mode - Using normal prices'
  });
  return false; // Toujours false en production
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Stripe (côté serveur / conteneur)
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY manquante. Vérifiez le fichier d’env du conteneur (.env.production.local ou env_file dans docker-compose).');
      return NextResponse.json(
        {
          error: 'Clés Stripe manquantes',
          details: 'STRIPE_SECRET_KEY n’est pas définie. En Docker : vérifiez que le fichier .env.production.local (ou env.production.local) est bien lu par le conteneur (env_file dans docker-compose.prod.yml).',
        },
        { status: 500 }
      );
    }

    const { packageType, userId, userEmail, promotion_code_id } = await request.json();
    
    console.log('🔄 Création session Stripe V2:', { 
      packageType, 
      userId, 
      userEmail,
      promotion_code_id: promotion_code_id || '(aucun)',
      userEmailType: typeof userEmail,
      userEmailLength: userEmail?.length,
      userEmailTrimmed: userEmail?.trim()
    });

    if (!packageType || !PACKAGES_V2[packageType as keyof typeof PACKAGES_V2]) {
      console.error('❌ Package invalide:', packageType);
      return NextResponse.json(
        { error: 'Package invalide' },
        { status: 400 }
      );
    }

    const packageData = PACKAGES_V2[packageType as keyof typeof PACKAGES_V2];

    const hasValidPromotionCode =
      typeof promotion_code_id === 'string' && promotion_code_id.startsWith('promo_');

    // Déterminer si on utilise les prix de test
    const useTestPrice = shouldUseTestPrice(userEmail);
    let lineItemAmount = useTestPrice
      ? (packageData as { testPrice?: number }).testPrice || packageData.price
      : packageData.price;

    if (
      !useTestPrice &&
      isPrestationMarketingPromoActive() &&
      (packageType === 'prestation_marketing' || packageType === 'photobooth_personalized')
    ) {
      // Photobooth + code Stripe : base catalogue 399 € pour que -20 % (ex. BIENVENUE10) = 319,20 € TTC
      if (packageType === 'photobooth_personalized' && hasValidPromotionCode) {
        lineItemAmount = 39900;
      } else {
        lineItemAmount = 19900;
      }
    }

    console.log('📦 Package sélectionné:', {
      ...packageData,
      userEmail,
      useTestPrice,
      displayedPrice: packageData.price / 100 + '€',
      chargedAmount: lineItemAmount / 100 + '€',
    });

    // Définir l'URL de base
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iahome.fr';
    console.log('🌐 URL de base:', baseUrl);

    const cancelUrl =
      packageType === 'prestation_marketing'
        ? `${baseUrl}/marketing?canceled=true`
        : `${baseUrl}/pricing2?canceled=true`;

    // Fonction helper pour nettoyer les valeurs de métadonnées
    const cleanMetadataValue = (value: string | undefined): string => {
      if (!value) return '';
      // Retirer les quotes et caractères spéciaux problématiques
      return String(value)
        .replace(/['"]/g, '') // Retirer les quotes
        .replace(/[^\w\s@.-]/g, '') // Garder seulement alphanumériques, @, ., -, espaces
        .trim()
        .substring(0, 500); // Limiter la longueur
    };

    const discounts = hasValidPromotionCode ? [{ promotion_code: promotion_code_id }] : undefined;

    // Créer la session de paiement Stripe
    if (packageData.mode === 'subscription') {
      // Mode abonnement
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: packageData.name,
                description: packageData.description,
              },
              unit_amount: lineItemAmount,
              recurring: {
                interval: packageData.interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/payment-success?package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        ...(discounts ? { discounts } : { allow_promotion_codes: true }),
        metadata: {
          userId: cleanMetadataValue(userId),
          userEmail: cleanMetadataValue(userEmail),
          packageType: cleanMetadataValue(packageType),
          tokens: packageData.tokens.toString(),
          totalTokens: (packageData as { totalTokens?: number }).totalTokens?.toString() || packageData.tokens.toString(),
        },
        customer_email: userEmail, // Email pour reçu / factures Stripe (abonnements)
        subscription_data: {
          metadata: {
            userId: cleanMetadataValue(userId),
            userEmail: cleanMetadataValue(userEmail),
            packageType: cleanMetadataValue(packageType),
            tokens: packageData.tokens.toString(),
          },
        },
      });

      console.log('✅ Session abonnement créée:', session.id);
      console.log('💰 Prix appliqué dans Stripe:', {
        sessionId: session.id,
        amountTotal: session.amount_total ? (session.amount_total / 100).toFixed(2) + '€' : 'N/A',
        expectedPrice: (lineItemAmount / 100).toFixed(2) + '€',
        useTestPrice,
        userEmail
      });

      return NextResponse.json({ 
        sessionId: session.id,
        url: session.url 
      });
    } else {
      // Mode paiement unique : reçu + facture PDF envoyés au client par Stripe
      const paymentProductDescription =
        !useTestPrice && lineItemAmount === 19900 && packageType === 'photobooth_personalized'
          ? `${packageData.description} Ristourne : 199€ TTC jusqu’au 5 avril 2026 inclus (tarif catalogue 399€).`
          : !useTestPrice && lineItemAmount === 19900 && packageType === 'prestation_marketing'
            ? `${packageData.description} Ristourne : 199€ TTC jusqu’au 5 avril 2026 inclus (tarif catalogue 249€).`
            : packageData.description;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: packageData.name,
                description: paymentProductDescription,
              },
              unit_amount: lineItemAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        ...(discounts ? { discounts } : { allow_promotion_codes: true }),
        metadata: {
          userId: cleanMetadataValue(userId),
          userEmail: cleanMetadataValue(userEmail),
          packageType: cleanMetadataValue(packageType),
          tokens: packageData.tokens.toString(),
        },
        customer_email: userEmail, // Email pour reçu et facture Stripe
        // Justificatif : Stripe envoie reçu + facture PDF au client après paiement
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `${packageData.name} - ${paymentProductDescription}`,
            footer: 'IA Home - iahome.fr',
          },
        },
        payment_intent_data: {
          description:
            packageData.tokens > 0
              ? `${packageData.name} - ${packageData.tokens} tokens`
              : packageData.name,
        },
      });

      console.log('✅ Session paiement unique créée:', session.id);

      return NextResponse.json({ 
        sessionId: session.id,
        url: session.url 
      });
    }

  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    
    // Log plus détaillé de l'erreur
    if (error instanceof Error) {
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // Si c'est une erreur Stripe, log plus de détails
      if ('type' in error) {
        console.error('❌ Type d\'erreur Stripe:', (error as any).type);
        console.error('❌ Code d\'erreur Stripe:', (error as any).code);
        console.error('❌ Paramètre problématique:', (error as any).param);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session de paiement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
