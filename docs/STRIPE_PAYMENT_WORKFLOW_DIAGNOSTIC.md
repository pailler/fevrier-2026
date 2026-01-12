# Diagnostic du Workflow de Paiement Stripe

## Workflow Actuel

### 1. Création de la Session (Frontend → Backend)
- **Fichier**: `src/components/StripeButton2.tsx`
- **Action**: L'utilisateur clique sur "S'abonner"
- **Processus**:
  1. Vérifie l'authentification
  2. Appelle `/api/stripe/create-checkout-session-v2`
  3. Passe `packageType`, `userId`, `userEmail`
  4. Reçoit l'URL de redirection Stripe
  5. Redirige vers Stripe Checkout

### 2. Création de la Session Stripe (Backend)
- **Fichier**: `src/app/api/stripe/create-checkout-session-v2/route.ts`
- **Processus**:
  1. Vérifie la clé Stripe
  2. Détermine le prix (test ou production)
  3. Nettoie les métadonnées avec `cleanMetadataValue`
  4. Crée la session Stripe avec:
     - Métadonnées: `userId`, `userEmail`, `packageType`, `tokens`
     - `customer_email`: email non nettoyé
     - `subscription_data.metadata`: mêmes métadonnées pour l'abonnement
  5. Retourne l'URL de la session

### 3. Paiement sur Stripe Checkout
- L'utilisateur complète le paiement sur Stripe
- Stripe envoie un webhook `checkout.session.completed`

### 4. Réception du Webhook (Backend)
- **Fichier**: `src/app/api/webhooks/stripe/route.ts`
- **Processus**:
  1. Vérifie la signature du webhook
  2. Parse l'événement Stripe
  3. Appelle `handleCheckoutSessionCompleted`
  4. Vérifie `session.payment_status === 'paid'`
  5. Récupère l'email depuis `session.metadata?.userEmail || session.metadata?.customerEmail || session.customer_email`
  6. Trouve l'utilisateur dans Supabase
  7. Si `session.mode === 'subscription' && packageType`:
     - Crédite les tokens (REMPLACEMENT)
     - Enregistre la transaction

### 5. Redirection vers Payment Success
- **Fichier**: `src/app/payment-success/page.tsx`
- Affiche un message de succès

## Problèmes Identifiés

### Problème 1: Vérification du Payment Status
- **Ligne 90**: `if (session.payment_status !== 'paid')`
- **Problème**: Pour les abonnements, le statut peut être `paid` mais le webhook peut être reçu avant que le paiement soit complètement traité
- **Solution**: Vérifier aussi `session.status === 'complete'`

### Problème 2: Métadonnées Nettoyées
- **Ligne 119-127**: `cleanMetadataValue` supprime des caractères
- **Problème**: Si l'email contient des caractères spéciaux, il peut être mal nettoyé
- **Solution**: Ne pas nettoyer l'email, seulement les autres champs

### Problème 3: Condition de Package Type
- **Ligne 125**: `if (session.mode === 'subscription' && packageType)`
- **Problème**: Si `packageType` est vide ou undefined après nettoyage, la condition échoue
- **Solution**: Vérifier aussi `session.mode === 'subscription'` seul, et utiliser les métadonnées de l'abonnement si nécessaire

### Problème 4: Pas de Vérification de la Session
- **Problème**: Si le webhook n'est pas reçu, aucun mécanisme de vérification
- **Solution**: Ajouter une vérification manuelle de la session après redirection

### Problème 5: Logs Insuffisants
- **Problème**: Pas assez de logs pour diagnostiquer les problèmes
- **Solution**: Ajouter plus de logs à chaque étape

## Solutions Proposées

1. **Améliorer la vérification du payment status**
2. **Ne pas nettoyer l'email dans les métadonnées**
3. **Ajouter une vérification manuelle de la session**
4. **Améliorer les logs**
5. **Ajouter un endpoint de vérification de session**
