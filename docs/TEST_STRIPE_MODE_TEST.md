# Guide de Test - Gestion des Tokens avec Stripe Mode Test

Ce guide explique comment tester la gestion des crédits avec Stripe en mode test.

## 📋 Prérequis

1. **Compte Stripe en mode Test** : https://dashboard.stripe.com/test
2. **Clés API de test** configurées dans `.env.local`
3. **Webhook de test** configuré dans Stripe Dashboard
4. **Utilisateur de test** dans Supabase avec l'email `regispailler@gmail.com`

---

## 🔧 Configuration du Mode Test

### 1. Variables d'environnement pour le mode test

Créez un fichier `.env.local` (ou modifiez-le) avec les clés de test Stripe :

```env
# Clés Stripe MODE TEST
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (secret du webhook de test)

# Forcer le prix de test pour tous les utilisateurs (optionnel)
STRIPE_FORCE_TEST_PRICE=true
```

### 2. Récupérer les clés de test Stripe

1. Allez sur https://dashboard.stripe.com/test/apikeys
2. Copiez la **Secret key** (commence par `sk_test_`)
3. Copiez la **Publishable key** (commence par `pk_test_`)

### 3. Configurer le webhook de test

1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez sur **"Add endpoint"**
3. URL : `https://iahome.fr/api/stripe-webhook` (ou votre URL de test)
4. Sélectionnez les événements :
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
5. Cliquez sur **"Add endpoint"**
6. **Copiez le "Signing secret"** (commence par `whsec_`) et ajoutez-le dans `.env.local`

---

## 🧪 Tests à Effectuer

### Test 1 : Abonnement Mensuel (Mode Test)

**Objectif** : Vérifier que les crédits sont crédités lors d'un abonnement mensuel en mode test.

**Étapes** :

1. **Connectez-vous** à l'application avec `regispailler@gmail.com`
2. **Allez sur** `/pricing2`
3. **Cliquez sur** "S'abonner" pour l'abonnement mensuel
4. **Sur Stripe Checkout**, utilisez une carte de test :
   - Numéro : `4242 4242 4242 4242`
   - Date d'expiration : n'importe quelle date future (ex: `12/34`)
   - CVC : n'importe quel 3 chiffres (ex: `123`)
   - Code postal : n'importe quel code (ex: `12345`)
5. **Complétez le paiement**
6. **Vérifiez** :
   - Redirection vers `/payment-success`
   - Les crédits sont crédités (3000 crédits)
   - La transaction est enregistrée dans `user_credit_transactions`

**Vérification dans les logs** :
```
✅ ===== CHECKOUT SESSION COMPLETED =====
✅ Session de paiement complétée: cs_test_...
✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS =====
✅ 3000 crédits crédités pour regispailler@gmail.com (abonnement initial)
```

**Vérification dans Supabase** :
```sql
-- Vérifier les crédits
SELECT * FROM user_crédits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'regispailler@gmail.com');

-- Vérifier les transactions
SELECT * FROM user_credit_transactions 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'regispailler@gmail.com')
ORDER BY created_at DESC;
```

---

### Test 2 : Abonnement Annuel (Mode Test)

**Objectif** : Vérifier que les crédits sont crédités lors d'un abonnement annuel en mode test.

**Étapes** : Identiques au Test 1, mais sélectionnez l'abonnement annuel.

**Vérification** :
- 3000 crédits crédités (quota mensuel)
- Transaction enregistrée avec `package_type = 'subscription_yearly'`

---

### Test 3 : Pack Standard (Achat Unique - Mode Test)

**Objectif** : Vérifier que les crédits sont ajoutés (pas remplacés) lors d'un achat unique.

**Étapes** :

1. **Notez le nombre de crédits actuels** de l'utilisateur
2. **Allez sur** `/pricing2`
3. **Cliquez sur** "Acheter" pour le Pack Standard
4. **Complétez le paiement** avec la carte de test
5. **Vérifiez** :
   - Les crédits sont **ajoutés** (pas remplacés)
   - Si l'utilisateur avait 1000 crédits, il devrait avoir 4000 crédits (1000 + 3000)

**Vérification dans les logs** :
```
✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS (ACHAT UNIQUE) =====
✅ 3000 crédits ajoutés (Total: 4000)
```

---

### Test 4 : Renouvellement d'Abonnement (Mode Test)

**Objectif** : Vérifier que les crédits sont remplacés (pas ajoutés) lors d'un renouvellement.

**Étapes** :

1. **Créez un abonnement** (Test 1)
2. **Dans Stripe Dashboard**, allez sur l'abonnement créé
3. **Utilisez l'outil de test** pour déclencher un renouvellement :
   - Allez sur l'abonnement → **"..."** → **"Send test webhook"**
   - Sélectionnez `invoice.payment_succeeded`
   - Cliquez sur **"Send test webhook"**
4. **Vérifiez** :
   - Les crédits sont **remplacés** par 3000 (pas ajoutés)
   - Si l'utilisateur avait 500 crédits, il devrait avoir 3000 crédits (pas 3500)

**Vérification dans les logs** :
```
✅ Paiement d'abonnement réussi: in_test_...
🔄 Mise à jour quota mensuel (REMPLACEMENT):
   Tokens précédents: 500 → Nouveaux crédits: 3000 (REMPLACEMENT)
✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS (RENOUVELLEMENT) =====
```

---

## 🔍 Vérification des Logs

### Logs du serveur Next.js

Les logs doivent afficher :

```
🔔 Webhook Stripe reçu sur /api/stripe-webhook
📋 Headers reçus: { 'stripe-signature': 'présent', ... }
📦 Taille du body: ... caractères
🔐 Vérification de la signature webhook...
✅ Signature webhook valide
🔔 Événement Stripe reçu: checkout.session.completed
✅ ===== CHECKOUT SESSION COMPLETED =====
✅ Session de paiement complétée: cs_test_...
📧 Email client: regispailler@gmail.com
📦 Package type: subscription_monthly
💰 Montant: 0.50€
🔄 Crédit crédits abonnement initial (REMPLACEMENT):
   Tokens précédents: 0 → Nouveaux crédits: 3000 (REMPLACEMENT)
✅ ===== TOKENS CRÉDITÉS AVEC SUCCÈS =====
✅ 3000 crédits crédités pour regispailler@gmail.com (abonnement initial)
✅ Transaction enregistrée dans user_credit_transactions (checkout)
```

### Logs Stripe Dashboard

1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez sur votre webhook
3. Vérifiez les **"Recent deliveries"** :
   - Statut : `200 OK` (succès)
   - Événement : `checkout.session.completed`
   - Temps de réponse : < 1 seconde

---

## 🐛 Dépannage

### Problème : Le webhook n'est pas reçu

**Solution** :
1. Vérifiez que l'URL du webhook est correcte dans Stripe
2. Vérifiez que le serveur est accessible publiquement
3. Utilisez un outil comme `ngrok` ou `cloudflared` pour exposer votre serveur local

### Problème : Erreur de signature

**Solution** :
1. Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret du webhook de test
2. Vérifiez que vous utilisez le bon secret (test vs production)

### Problème : Les crédits ne sont pas crédités

**Solution** :
1. Vérifiez les logs du serveur pour voir les erreurs
2. Vérifiez que l'utilisateur existe dans Supabase avec l'email correct
3. Vérifiez que la table `user_crédits` existe et est accessible
4. Utilisez le script `scripts/verify-stripe-session.ps1` pour vérifier manuellement

---

## 📝 Scripts de Test

### Script 1 : Vérifier une session de test

```powershell
.\scripts\verify-stripe-session.ps1 -SessionId 'cs_test_...'
```

### Script 2 : Créditer manuellement des crédits

```powershell
.\scripts\credit-crédits-subscription.ps1 -Email 'regispailler@gmail.com' -Tokens 3000 -PackageType 'subscription_monthly'
```

---

## ✅ Checklist de Test

- [ ] Les clés de test Stripe sont configurées dans `.env.local`
- [ ] Le webhook de test est configuré dans Stripe Dashboard
- [ ] L'utilisateur de test existe dans Supabase
- [ ] Test d'abonnement mensuel : ✅ Tokens crédités
- [ ] Test d'abonnement annuel : ✅ Tokens crédités
- [ ] Test de pack standard : ✅ Tokens ajoutés (pas remplacés)
- [ ] Test de renouvellement : ✅ Tokens remplacés (pas ajoutés)
- [ ] Les transactions sont enregistrées dans `user_credit_transactions`
- [ ] Les logs du serveur montrent les messages de succès

---

## 🔄 Passage en Production

Une fois les tests validés :

1. **Basculez vers les clés de production** dans `env.production.local`
2. **Configurez le webhook de production** dans Stripe Dashboard (mode Production)
3. **Testez avec un petit montant réel** avant de lancer en production
4. **Surveillez les logs** pour détecter les problèmes

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur
2. Vérifiez les événements dans Stripe Dashboard
3. Utilisez les scripts de diagnostic fournis
4. Consultez la documentation Stripe : https://stripe.com/docs/testing
