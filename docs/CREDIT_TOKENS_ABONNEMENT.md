# Crédit manuel des tokens d'abonnement

## 🔧 Problème

Si un utilisateur a payé un abonnement mais n'a pas reçu ses 3000 tokens, vous pouvez les créditer manuellement.

## ✅ Solution : API de crédit manuel

### Endpoint

```
POST /api/credit-subscription-tokens
```

### Body (JSON)

```json
{
  "userEmail": "regispailler@gmail.com",
  "tokens": 3000,
  "packageType": "subscription_monthly",
  "subscriptionId": "sub_xxxxx" // Optionnel
}
```

### Exemple avec curl

```bash
curl -X POST https://iahome.fr/api/credit-subscription-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "regispailler@gmail.com",
    "tokens": 3000,
    "packageType": "subscription_monthly"
  }'
```

### Exemple avec PowerShell

```powershell
$body = @{
    userEmail = "regispailler@gmail.com"
    tokens = 3000
    packageType = "subscription_monthly"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://iahome.fr/api/credit-subscription-tokens" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 📋 Comportement

- **REMPLACEMENT** : Les tokens sont **remplacés** (pas ajoutés)
- Si l'utilisateur avait 500 tokens, il aura maintenant **3000 tokens** (pas 3500)
- Une transaction est enregistrée dans `user_credit_transactions`

## 🔍 Vérification

Après le crédit, vérifiez dans Supabase :

1. **Table `user_tokens`** :
   ```sql
   SELECT * FROM user_tokens WHERE user_id = 'UUID_UTILISATEUR';
   ```
   → Le champ `tokens` doit être à 3000

2. **Table `user_credit_transactions`** :
   ```sql
   SELECT * FROM user_credit_transactions 
   WHERE user_id = 'UUID_UTILISATEUR' 
   ORDER BY created_at DESC;
   ```
   → Une nouvelle transaction de type `subscription_initial` doit apparaître

## 🚀 Corrections appliquées au webhook

Le webhook a été corrigé pour :

1. ✅ **Créditer immédiatement** les tokens lors de `checkout.session.completed` pour les abonnements
2. ✅ **Éviter le double crédit** dans `invoice.payment_succeeded` pour le premier paiement
3. ✅ **Créditer automatiquement** lors des renouvellements mensuels

Les prochains abonnements créditeront automatiquement les tokens sans intervention manuelle.
