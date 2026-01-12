# Renouvellement Automatique Mensuel - Abonnements Stripe

## 📋 Vue d'ensemble

Ce document explique comment fonctionne le renouvellement automatique mensuel des abonnements Stripe et comment s'assurer qu'il fonctionne correctement chaque mois.

---

## 🔄 Fonctionnement du Renouvellement Automatique

### Processus Mensuel

Chaque mois, Stripe effectue automatiquement les actions suivantes :

1. **Prélèvement automatique** : Stripe prélève 9,90€ sur la carte de l'utilisateur
2. **Génération de facture** : Stripe crée une facture (`invoice`) pour le renouvellement
3. **Envoi du webhook** : Stripe envoie l'événement `invoice.payment_succeeded` avec `billing_reason: 'subscription_cycle'`
4. **Crédit des tokens** : Le webhook remplace les tokens de l'utilisateur par 3000 tokens (quota mensuel)
5. **Enregistrement** : La transaction est enregistrée dans `user_credit_transactions`

### Détails Techniques

- **Montant** : 9,90€ (990 centimes)
- **Tokens crédités** : 3000 tokens
- **Type de crédit** : REMPLACEMENT (pas d'accumulation)
- **Fréquence** : Mensuelle (chaque mois à la même date)

---

## ✅ Configuration Actuelle

### 1. Webhook Stripe

**URL** : `https://iahome.fr/api/stripe-webhook`

**Événements configurés** :
- ✅ `checkout.session.completed` - Premier paiement
- ✅ `invoice.payment_succeeded` - **CRITIQUE** : Renouvellement mensuel
- ✅ `invoice.payment_failed` - Échec de paiement
- ✅ `customer.subscription.deleted` - Annulation

### 2. Code de Renouvellement

**Fichier** : `src/app/api/stripe-webhook/route.ts`

**Fonction** : `handleInvoicePaymentSucceeded()`

**Logique** :
```typescript
// Vérifie si c'est un renouvellement
const isRenewal = invoice.billing_reason === 'subscription_cycle';

if (isRenewal) {
  // REMPLACE les tokens par 3000 (quota mensuel)
  await supabase
    .from('user_tokens')
    .upsert({
      user_id: userData.id,
      tokens: 3000, // REMPLACEMENT
      updated_at: new Date().toISOString()
    });
  
  // Enregistre la transaction
  await supabase
    .from('user_credit_transactions')
    .insert({
      transaction_type: 'subscription_renewal',
      amount: 9.90,
      tokens: 3000,
      ...
    });
}
```

---

## 🔍 Vérification Mensuelle (À faire chaque mois)

### Checklist de Vérification

#### 1. Vérifier les Renouvellements dans Stripe Dashboard

**Date** : Le jour du renouvellement (chaque mois)

**Actions** :
1. Allez sur https://dashboard.stripe.com/subscriptions
2. Vérifiez que les abonnements actifs sont renouvelés
3. Vérifiez que les paiements de 9,90€ sont réussis
4. Vérifiez que les factures sont générées

**Indicateurs de succès** :
- ✅ Statut de l'abonnement : `active`
- ✅ Dernier paiement : `succeeded`
- ✅ Montant : 9,90€
- ✅ Date de renouvellement : Mise à jour automatique

#### 2. Vérifier les Webhooks dans Stripe Dashboard

**Actions** :
1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur votre webhook (`https://iahome.fr/api/stripe-webhook`)
3. Vérifiez les "Recent deliveries"
4. Cherchez les événements `invoice.payment_succeeded`

**Indicateurs de succès** :
- ✅ Événement : `invoice.payment_succeeded`
- ✅ Statut : `200 OK`
- ✅ `billing_reason` : `subscription_cycle`
- ✅ Temps de réponse : < 2 secondes

#### 3. Vérifier les Logs du Serveur

**Actions** :
1. Consultez les logs du serveur Next.js
2. Cherchez les messages suivants :

```
✅ Paiement d'abonnement réussi: in_...
🔄 Traitement paiement abonnement: { billingReason: 'subscription_cycle', ... }
🔄 Mise à jour quota mensuel (REMPLACEMENT): { tokenQuota: 3000, ... }
✅ Quota mensuel de 3000 tokens crédité pour [email]
✅ Transaction enregistrée dans user_credit_transactions
```

**Indicateurs de succès** :
- ✅ Logs présents pour chaque renouvellement
- ✅ Tokens crédités : 3000
- ✅ Transaction enregistrée

#### 4. Vérifier dans la Base de Données

**Table `user_tokens`** :
```sql
SELECT 
  u.email,
  ut.tokens,
  ut.updated_at
FROM user_tokens ut
JOIN profiles u ON u.id = ut.user_id
WHERE u.email = 'email_utilisateur@example.com';
```

**Vérifications** :
- ✅ `tokens` = 3000 (quota mensuel)
- ✅ `updated_at` = Date du renouvellement

**Table `user_credit_transactions`** :
```sql
SELECT 
  transaction_type,
  amount,
  tokens,
  created_at,
  description
FROM user_credit_transactions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'email_utilisateur@example.com')
ORDER BY created_at DESC
LIMIT 10;
```

**Vérifications** :
- ✅ `transaction_type` = `subscription_renewal`
- ✅ `amount` = 9.90
- ✅ `tokens` = 3000
- ✅ `created_at` = Date du renouvellement

---

## 🛠️ Scripts de Vérification

### Script PowerShell : Vérifier les Renouvellements

Créez un script `scripts/verify-monthly-renewals.ps1` :

```powershell
# Script pour vérifier les renouvellements mensuels
param(
    [string]$Email = "regispailler@gmail.com"
)

$apiUrl = "https://iahome.fr/api/verify-subscription-tokens"
$body = @{
    email = $Email
} | ConvertTo-Json

Write-Host "`n🔍 Vérification des renouvellements pour : $Email" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Résultat :" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## ⚠️ Problèmes Potentiels et Solutions

### Problème 1 : Les tokens ne sont pas crédités

**Symptômes** :
- Le paiement est réussi dans Stripe
- Mais les tokens ne sont pas crédités dans la base de données

**Solutions** :
1. Vérifiez les logs du serveur pour voir si le webhook est reçu
2. Vérifiez que `invoice.payment_succeeded` est configuré dans Stripe
3. Vérifiez que `billing_reason === 'subscription_cycle'`
4. Utilisez le script `verify-stripe-session.ps1` pour vérifier manuellement

### Problème 2 : Le webhook n'est pas reçu

**Symptômes** :
- Aucun événement dans Stripe Dashboard → Webhooks → Logs
- Aucun log dans le serveur

**Solutions** :
1. Vérifiez que l'URL du webhook est correcte : `https://iahome.fr/api/stripe-webhook`
2. Vérifiez que le serveur est accessible publiquement
3. Vérifiez que Cloudflare Tunnel est actif
4. Testez l'endpoint : `https://iahome.fr/api/webhooks/stripe/test`

### Problème 3 : Double crédit de tokens

**Symptômes** :
- Les tokens sont crédités deux fois (6000 au lieu de 3000)

**Solutions** :
1. Vérifiez que `isFirstPayment` est bien détecté et évite le double crédit
2. Vérifiez que `billing_reason === 'subscription_create'` ne crédite pas les tokens
3. Vérifiez les logs pour voir si `checkout.session.completed` et `invoice.payment_succeeded` sont tous deux appelés

---

## 📅 Calendrier de Vérification

### Vérification Hebdomadaire (Optionnel)

- Vérifier que les webhooks sont actifs
- Vérifier que le serveur répond correctement

### Vérification Mensuelle (Recommandé)

**Date** : Le jour du renouvellement (ex: le 12 de chaque mois)

**Actions** :
1. ✅ Vérifier les renouvellements dans Stripe Dashboard
2. ✅ Vérifier les webhooks dans Stripe Dashboard
3. ✅ Vérifier les logs du serveur
4. ✅ Vérifier dans la base de données que les tokens sont crédités

### Vérification Trimestrielle (Recommandé)

**Actions** :
1. Vérifier que tous les renouvellements des 3 derniers mois ont fonctionné
2. Vérifier les statistiques dans Stripe Dashboard
3. Vérifier les transactions dans `user_credit_transactions`

---

## 📊 Statistiques à Surveiller

### Dans Stripe Dashboard

- **Taux de réussite des paiements** : Doit être > 95%
- **Taux d'échec** : Doit être < 5%
- **Montant moyen par renouvellement** : 9,90€
- **Nombre de renouvellements par mois** : Suivre l'évolution

### Dans la Base de Données

- **Nombre de transactions `subscription_renewal` par mois**
- **Montant total des renouvellements par mois**
- **Tokens crédités par mois** : Devrait être = nombre d'abonnements × 3000

---

## 🔧 Maintenance Préventive

### Actions à Effectuer Régulièrement

1. **Vérifier la configuration du webhook** (mensuellement)
   - URL correcte
   - Événements sélectionnés
   - Secret webhook à jour

2. **Vérifier les logs** (hebdomadairement)
   - Aucune erreur récurrente
   - Temps de réponse acceptable

3. **Vérifier la base de données** (mensuellement)
   - Cohérence des données
   - Pas de doublons
   - Tokens correctement crédités

4. **Tester le système** (trimestriellement)
   - Utiliser le mode test Stripe
   - Simuler un renouvellement
   - Vérifier que tout fonctionne

---

## 📝 Notes Importantes

### Comportement des Tokens

- **Remplacés, pas additionnés** : Les tokens sont remplacés par 3000 chaque mois
- **Pas d'accumulation** : Si l'utilisateur a 500 tokens, après le renouvellement il aura 3000 (pas 3500)
- **Quota mensuel** : Chaque utilisateur a exactement 3000 tokens par mois

### Dates de Renouvellement

- **Date fixe** : Le renouvellement a lieu le même jour chaque mois
- **Exemple** : Si l'abonnement commence le 12 janvier, il sera renouvelé le 12 de chaque mois
- **Heure** : Dépend de la configuration Stripe (généralement à minuit UTC)

### Gestion des Échecs

- **Premier échec** : Stripe réessaie automatiquement
- **Échecs répétés** : L'abonnement peut être annulé
- **Notification** : L'événement `invoice.payment_failed` est envoyé
- **Action** : Vérifier les logs et contacter l'utilisateur si nécessaire

---

## ✅ Checklist de Vérification Mensuelle

- [ ] Vérifier les renouvellements dans Stripe Dashboard
- [ ] Vérifier les webhooks dans Stripe Dashboard (événements `invoice.payment_succeeded`)
- [ ] Vérifier les logs du serveur (messages de crédit de tokens)
- [ ] Vérifier dans `user_tokens` que les tokens = 3000
- [ ] Vérifier dans `user_credit_transactions` que les transactions sont enregistrées
- [ ] Vérifier que le montant prélevé = 9,90€
- [ ] Vérifier qu'aucune erreur n'est présente dans les logs
- [ ] Documenter les résultats dans un fichier de suivi

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez les logs du serveur
2. Vérifiez les événements dans Stripe Dashboard
3. Utilisez les scripts de diagnostic fournis
4. Consultez la documentation Stripe : https://stripe.com/docs/billing/subscriptions/overview

---

## 🔗 Fichiers de Référence

- `src/app/api/stripe-webhook/route.ts` - Handler principal du webhook
- `src/app/api/webhooks/stripe/route.ts` - Handler alternatif
- `docs/CONFIGURATION_WEBHOOK_STRIPE.md` - Configuration du webhook
- `docs/DEBUG_WEBHOOK_STRIPE.md` - Guide de débogage
- `docs/VERIFICATION_TOKENS_ABONNEMENT.md` - Vérification des tokens

---

**Dernière mise à jour** : 12 janvier 2026
