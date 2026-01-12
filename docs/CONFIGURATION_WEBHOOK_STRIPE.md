# Configuration du Webhook Stripe pour les Abonnements

## 📋 Guide étape par étape

### 1. Accéder au Dashboard Stripe

1. Connectez-vous à votre compte Stripe : https://dashboard.stripe.com
2. Assurez-vous d'être en mode **Production** (pas Test mode) pour la configuration finale
3. Pour tester, vous pouvez d'abord configurer en mode Test

### 2. Créer/Modifier le Webhook

1. **Aller dans la section Webhooks** :
   - Menu latéral → **Developers** → **Webhooks**
   - Ou directement : https://dashboard.stripe.com/webhooks

2. **Créer un nouveau webhook** (ou modifier l'existant) :
   - Cliquez sur **"Add endpoint"** (ou **"Edit"** sur un webhook existant)

3. **Configurer l'URL du webhook** :
   ```
   https://iahome.fr/api/stripe-webhook
   ```
   ⚠️ **Important** : Remplacez `iahome.fr` par votre domaine réel en production

4. **Sélectionner les événements à écouter** :

   Cliquez sur **"Select events"** et cochez les événements suivants :

   ✅ **Événements essentiels** :
   - `checkout.session.completed` - Paiement initial réussi
   - `invoice.payment_succeeded` - **CRITIQUE** : Renouvellement mensuel automatique
   - `invoice.payment_failed` - Échec de paiement
   - `customer.subscription.deleted` - Annulation d'abonnement

   ✅ **Événements optionnels** (pour un suivi complet) :
   - `customer.subscription.updated` - Modification d'abonnement
   - `customer.subscription.trial_will_end` - Fin de période d'essai
   - `payment_intent.succeeded` - Paiement unique réussi
   - `payment_intent.payment_failed` - Paiement unique échoué

5. **Sauvegarder le webhook** :
   - Cliquez sur **"Add endpoint"** (ou **"Save"**)

### 3. Récupérer le Secret du Webhook

1. **Après la création**, cliquez sur le webhook créé
2. Dans la section **"Signing secret"**, cliquez sur **"Reveal"** ou **"Click to reveal"**
3. **Copiez le secret** (commence par `whsec_...`)
4. **Ajoutez-le dans vos variables d'environnement** :

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
   ```

   ⚠️ **Important** : 
   - Ne partagez JAMAIS ce secret
   - Utilisez un secret différent pour Test et Production
   - Mettez à jour votre fichier `.env.production.local` ou votre service d'hébergement

### 4. Tester le Webhook

#### En mode Test (Stripe Dashboard)

1. Dans le Dashboard Stripe, allez dans **Developers** → **Webhooks**
2. Cliquez sur votre webhook
3. Cliquez sur **"Send test webhook"**
4. Sélectionnez l'événement `invoice.payment_succeeded`
5. Cliquez sur **"Send test webhook"**

#### Via la CLI Stripe (recommandé pour les tests)

```bash
# Installer la CLI Stripe si ce n'est pas déjà fait
# npm install -g stripe-cli

# Se connecter
stripe login

# Écouter les événements en local (pour développement)
stripe listen --forward-to http://localhost:3000/api/stripe-webhook

# Dans un autre terminal, déclencher un événement test
stripe trigger invoice.payment_succeeded
```

### 5. Vérifier que ça fonctionne

1. **Créer un abonnement test** :
   - Utilisez une carte de test Stripe : `4242 4242 4242 4242`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

2. **Vérifier les logs** :
   - Dans votre console serveur, vous devriez voir :
     ```
     🔔 Événement Stripe reçu: checkout.session.completed
     ✅ Session de paiement complétée: cs_...
     ```

3. **Vérifier les tokens** :
   - Connectez-vous à votre compte
   - Allez sur `/my-tokens` ou `/encours`
   - Vérifiez que 3000 tokens ont été crédités

4. **Simuler un renouvellement** :
   ```bash
   stripe trigger invoice.payment_succeeded
   ```
   - Vérifiez que 3000 tokens supplémentaires sont crédités

### 6. Configuration en Production

1. **Basculer en mode Production** dans le Dashboard Stripe
2. **Créer un nouveau webhook** avec l'URL de production
3. **Récupérer le secret de production**
4. **Mettre à jour les variables d'environnement** sur votre serveur
5. **Tester avec un vrai paiement** (petit montant recommandé)

---

## 🔍 Vérification du Webhook

### Dans le Dashboard Stripe

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur votre webhook
3. Onglet **"Events"** : Vous verrez tous les événements reçus
4. Cliquez sur un événement pour voir :
   - Le statut (succès ✅ ou échec ❌)
   - Les détails de la requête/réponse
   - Les logs d'erreur éventuels

### Dans vos logs serveur

Vous devriez voir des logs comme :
```
🔔 Événement Stripe reçu: invoice.payment_succeeded
✅ Paiement d'abonnement réussi: in_...
🔄 Traitement paiement abonnement: {...}
✅ 3000 tokens crédités pour user@example.com (Total: 3000)
✅ Transaction enregistrée dans user_credit_transactions
```

---

## ⚠️ Problèmes Courants

### Le webhook ne reçoit pas les événements

1. **Vérifier l'URL** : Elle doit être accessible publiquement (pas `localhost`)
2. **Vérifier le secret** : Il doit correspondre au webhook configuré
3. **Vérifier les événements** : Ils doivent être sélectionnés dans le Dashboard
4. **Vérifier les logs Stripe** : Dashboard → Webhooks → Events

### Erreur "Signature invalide"

- Le `STRIPE_WEBHOOK_SECRET` ne correspond pas au secret du webhook
- Vérifiez que vous utilisez le bon secret (Test vs Production)

### Les tokens ne sont pas crédités

1. **Vérifier les métadonnées** : Elles doivent être présentes dans l'abonnement
2. **Vérifier les logs** : Cherchez les erreurs dans la console
3. **Vérifier la base de données** : La table `user_tokens` doit exister
4. **Vérifier l'email** : L'utilisateur doit exister dans la table `profiles`

---

## 📊 Structure de la Table `user_credit_transactions`

La table `user_credit_transactions` est utilisée pour enregistrer toutes les transactions de crédit de tokens. Assurez-vous qu'elle contient au minimum ces colonnes :

```sql
-- Colonnes recommandées (ajustez selon votre structure existante)
- id (UUID ou SERIAL)
- user_id (UUID, référence vers profiles)
- transaction_type (TEXT) -- 'subscription_initial', 'subscription_renewal', 'token_purchase', etc.
- amount (DECIMAL) -- Montant en euros
- tokens (INTEGER) -- Nombre de tokens crédités
- stripe_invoice_id (TEXT) -- ID de la facture Stripe
- stripe_subscription_id (TEXT) -- ID de l'abonnement Stripe
- package_type (TEXT) -- 'subscription_monthly', 'subscription_yearly', 'pack_standard'
- description (TEXT) -- Description de la transaction
- created_at (TIMESTAMP)
```

---

## ✅ Checklist Finale

- [ ] Webhook créé dans le Dashboard Stripe
- [ ] URL du webhook configurée (https://votre-domaine.fr/api/stripe-webhook)
- [ ] Événements sélectionnés (au minimum `invoice.payment_succeeded`)
- [ ] Secret du webhook récupéré et ajouté dans les variables d'environnement
- [ ] Webhook testé en mode Test
- [ ] Vérification que les tokens sont crédités correctement
- [ ] Webhook configuré en Production
- [ ] Test avec un vrai paiement en Production

---

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Événements d'abonnement Stripe](https://stripe.com/docs/api/events/types#event_types-invoice.payment_succeeded)
- [Tester les webhooks localement](https://stripe.com/docs/stripe-cli/webhooks)
