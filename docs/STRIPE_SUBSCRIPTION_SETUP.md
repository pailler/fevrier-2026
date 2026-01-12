# Configuration Stripe pour les Abonnements Mensuels Automatiques

## 📋 Vue d'ensemble

Pour que Stripe prélève automatiquement la même somme chaque mois (9,90€ pour l'abonnement mensuel), vous devez configurer :

1. **Le webhook Stripe** pour écouter les événements de renouvellement
2. **La logique de crédit de tokens** à chaque renouvellement
3. **La gestion des échecs de paiement**

---

## 🔧 Actions à Effectuer

### 1. Configurer le Webhook Stripe dans le Dashboard

1. **Accéder au Dashboard Stripe** : https://dashboard.stripe.com/webhooks
2. **Créer un nouveau webhook** ou modifier l'existant
3. **URL du webhook** : `https://iahome.fr/api/stripe-webhook` (ou votre domaine)
4. **Événements à écouter** :
   - ✅ `checkout.session.completed` (déjà géré)
   - ✅ `invoice.payment_succeeded` (à ajouter) - **CRITIQUE pour les renouvellements**
   - ✅ `invoice.payment_failed` (à ajouter) - Pour gérer les échecs
   - ✅ `customer.subscription.deleted` (optionnel) - Pour gérer les annulations
   - ✅ `customer.subscription.updated` (optionnel) - Pour gérer les modifications

### 2. Modifier le Webhook Handler

Le fichier `src/app/api/stripe-webhook/route.ts` doit être modifié pour gérer les événements de renouvellement.

**Événements à gérer :**

#### `invoice.payment_succeeded`
- Se déclenche à chaque renouvellement mensuel
- Contient les informations de l'abonnement
- Doit créditer 3000 tokens à l'utilisateur

#### `invoice.payment_failed`
- Se déclenche si le paiement échoue
- Permet d'envoyer une notification à l'utilisateur
- Optionnel : suspendre l'accès

### 3. Structure de la Base de Données

Assurez-vous d'avoir une table pour stocker les abonnements :

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  package_type TEXT NOT NULL, -- 'subscription_monthly' ou 'subscription_yearly'
  tokens_per_period INTEGER NOT NULL, -- 3000 pour mensuel
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Logique de Crédit de Tokens

À chaque renouvellement (`invoice.payment_succeeded`), vous devez :

1. **Récupérer l'abonnement** depuis Stripe
2. **Identifier l'utilisateur** via les métadonnées de l'abonnement
3. **Créditer les tokens** (3000 pour mensuel, 3000 pour annuel)
4. **Mettre à jour la date de renouvellement**

---

## 📝 Code à Ajouter dans le Webhook

### Exemple de gestion de `invoice.payment_succeeded`

```typescript
case 'invoice.payment_succeeded':
  await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
  break;
```

### Fonction à créer

```typescript
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Paiement d\'abonnement réussi:', invoice.id);
  
  // Récupérer l'abonnement
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.log('❌ Pas d\'abonnement associé');
    return;
  }

  // Récupérer l'abonnement depuis Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Récupérer les métadonnées
  const userId = subscription.metadata?.userId;
  const userEmail = subscription.metadata?.userEmail;
  const packageType = subscription.metadata?.packageType;
  const tokens = parseInt(subscription.metadata?.tokens || '3000');

  if (!userEmail) {
    console.log('❌ Email utilisateur manquant');
    return;
  }

  // Récupérer l'utilisateur
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    console.log('❌ Utilisateur non trouvé:', userEmail);
    return;
  }

  // Créditer les tokens (addition, pas remplacement)
  const { data: existingTokens } = await supabase
    .from('user_tokens')
    .select('tokens')
    .eq('user_id', userData.id)
    .single();

  const currentTokens = existingTokens?.tokens || 0;
  const newTokenCount = currentTokens + tokens;

  await supabase
    .from('user_tokens')
    .upsert({
      user_id: userData.id,
      tokens: newTokenCount,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  console.log(`✅ ${tokens} tokens crédités pour ${userEmail} (Total: ${newTokenCount})`);

  // Mettre à jour l'abonnement dans la base
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userData.id,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: subscription.customer as string,
      package_type: packageType,
      tokens_per_period: tokens,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });
}
```

---

## 🔄 Flux de Renouvellement Automatique

### Premier Paiement (Abonnement)
1. Utilisateur clique sur "S'abonner"
2. Redirection vers Stripe Checkout
3. Paiement initial de 9,90€
4. Événement `checkout.session.completed` → Crédit de 3000 tokens

### Renouvellements Mensuels
1. **Stripe prélève automatiquement** 9,90€ chaque mois
2. Événement `invoice.payment_succeeded` → Crédit de 3000 tokens
3. L'utilisateur reçoit ses tokens sans action

### En Cas d'Échec
1. Stripe tente de prélever
2. Si échec → Événement `invoice.payment_failed`
3. Optionnel : Suspendre l'accès ou envoyer une notification

---

## ✅ Checklist de Mise en Place

- [ ] Créer la table `user_subscriptions` dans Supabase
- [ ] Modifier `src/app/api/stripe-webhook/route.ts` pour gérer `invoice.payment_succeeded`
- [ ] Configurer le webhook dans le Dashboard Stripe
- [ ] Tester avec un abonnement en mode test
- [ ] Vérifier que les tokens sont crédités à chaque renouvellement
- [ ] Gérer les échecs de paiement (optionnel)
- [ ] Envoyer des emails de confirmation (optionnel)

---

## 🧪 Test en Mode Développement

1. Utiliser les clés API Stripe en mode test
2. Créer un abonnement test
3. Utiliser la CLI Stripe pour simuler un renouvellement :
   ```bash
   stripe trigger invoice.payment_succeeded
   ```
4. Vérifier que les tokens sont crédités

---

## 📚 Ressources

- [Documentation Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Événements d'abonnement](https://stripe.com/docs/billing/subscriptions/overview#subscription-events)

---

## ⚠️ Points Importants

1. **Stripe gère automatiquement les prélèvements** - Vous n'avez pas besoin de code pour déclencher le paiement
2. **Le webhook est essentiel** - Sans lui, les tokens ne seront pas crédités automatiquement
3. **Les métadonnées** doivent être correctement stockées lors de la création de l'abonnement
4. **Les échecs de paiement** doivent être gérés pour éviter les abonnements "zombies"

---

## 🔐 Sécurité

- Vérifier la signature du webhook avec `STRIPE_WEBHOOK_SECRET`
- Ne jamais faire confiance aux données du webhook sans vérification
- Logger tous les événements pour le débogage
