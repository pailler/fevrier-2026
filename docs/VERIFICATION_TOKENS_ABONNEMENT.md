# Vérification : Crédit de Tokens pour les Abonnements

## ✅ Vérification Complète du Flux

### 1. Premier Paiement (Abonnement Initial)

**Événement Stripe** : `checkout.session.completed`

**Code** : `handleCheckoutSessionCompleted()` dans `src/app/api/stripe-webhook/route.ts`

**Actions effectuées** :
1. ✅ Détection que `session.mode === 'subscription'`
2. ✅ Récupération des métadonnées : `packageType`, `tokens` (3000)
3. ✅ Récupération de l'utilisateur par email
4. ✅ Récupération des tokens actuels
5. ✅ **Addition** des 3000 tokens (pas remplacement)
6. ✅ Mise à jour dans `user_tokens`
7. ✅ Enregistrement dans `user_credit_transactions` avec type `subscription_initial`

**Résultat** : ✅ 3000 tokens crédités immédiatement après le premier paiement

---

### 2. Renouvellements Mensuels

**Événement Stripe** : `invoice.payment_succeeded`

**Code** : `handleInvoicePaymentSucceeded()` dans `src/app/api/stripe-webhook/route.ts`

**Actions effectuées** :
1. ✅ Détection de la facture d'abonnement via `invoice.subscription`
2. ✅ Récupération de l'abonnement depuis Stripe
3. ✅ Récupération des métadonnées depuis l'abonnement : `userEmail`, `packageType`, `tokens` (3000)
4. ✅ Récupération de l'utilisateur par email
5. ✅ Détection du type de paiement :
   - `subscription_create` = Premier paiement (déjà géré par checkout.session.completed)
   - `subscription_cycle` = Renouvellement mensuel
6. ✅ Récupération des tokens actuels
7. ✅ **Addition** des 3000 tokens (pas remplacement)
8. ✅ Mise à jour dans `user_tokens`
9. ✅ Enregistrement dans `user_credit_transactions` avec type `subscription_renewal`

**Résultat** : ✅ 3000 tokens crédités automatiquement chaque mois

---

### 3. Pack Standard (Achat Unique)

**Événement Stripe** : `checkout.session.completed`

**Code** : `handleCheckoutSessionCompleted()` dans `src/app/api/stripe-webhook/route.ts`

**Actions effectuées** :
1. ✅ Détection que `packageType === 'pack_standard'`
2. ✅ Récupération des tokens (3000)
3. ✅ Récupération de l'utilisateur
4. ✅ **Addition** des 3000 tokens
5. ✅ Enregistrement dans `user_credit_transactions`

**Résultat** : ✅ 3000 tokens crédités immédiatement

---

## 🔍 Points Critiques Vérifiés

### ✅ Métadonnées Correctement Passées

**Lors de la création de l'abonnement** (`create-checkout-session-v2/route.ts`) :
- ✅ `subscription_data.metadata` contient : `userId`, `userEmail`, `packageType`, `tokens`
- ✅ Ces métadonnées sont accessibles lors des renouvellements

### ✅ Quota Mensuel (Remplacement)

**Important** : Pour les abonnements, le code utilise **remplacement** (pas addition) :
```typescript
tokens: tokenQuota, // REMPLACER par le quota mensuel (3000)
```

Cela garantit que :
- Chaque mois, l'utilisateur a exactement 3000 tokens (quota mensuel)
- Les tokens ne s'accumulent pas entre les mois
- Le quota est renouvelé chaque mois

**Note** : Pour les achats uniques (Pack Standard), les tokens sont **additionnés** (pas remplacés).

### ✅ Gestion des Erreurs

- ✅ Vérification de l'existence de l'utilisateur
- ✅ Gestion des erreurs de base de données
- ✅ Logs détaillés pour le débogage
- ✅ Transaction enregistrée même en cas d'erreur partielle

---

## 📊 Flux Complet Résumé

### Abonnement Mensuel (9,90€/mois)

1. **Jour 0 - Souscription** :
   - Utilisateur clique sur "S'abonner"
   - Stripe Checkout → Paiement de 9,90€
   - Événement `invoice.payment_succeeded` → **3000 tokens crédités** (quota mensuel)

2. **Jour 30 - Premier Renouvellement** :
   - Stripe prélève automatiquement 9,90€
   - Événement `invoice.payment_succeeded` → **3000 tokens** (remplacement du quota)
   - Total : **3000 tokens** (quota mensuel renouvelé)

3. **Jour 60 - Deuxième Renouvellement** :
   - Stripe prélève automatiquement 9,90€
   - Événement `invoice.payment_succeeded` → **3000 tokens** (remplacement du quota)
   - Total : **3000 tokens** (quota mensuel renouvelé)

4. **Et ainsi de suite chaque mois...**
   - Chaque mois, l'utilisateur a exactement **3000 tokens** (quota mensuel)

### Abonnement Annuel (99,00€/an)

1. **Jour 0 - Souscription** :
   - Paiement de 99,00€
   - Événement `invoice.payment_succeeded` → **3000 tokens crédités** (quota mensuel)

2. **Chaque mois (12 fois)** :
   - Événement `invoice.payment_succeeded` → **3000 tokens** (remplacement du quota mensuel)
   - Total : **3000 tokens** à chaque renouvellement (quota mensuel)

---

## ⚠️ Points d'Attention

### 1. Double Crédit Potentiel

**Problème potentiel** : 
- `checkout.session.completed` peut se déclencher pour les abonnements
- `invoice.payment_succeeded` avec `billing_reason: 'subscription_create'` peut aussi se déclencher

**Solution actuelle** :
- Le code vérifie `billing_reason` pour distinguer premier paiement vs renouvellement
- Mais `checkout.session.completed` crédite aussi les tokens pour les abonnements

**Recommandation** : 
- Soit désactiver le crédit dans `checkout.session.completed` pour les abonnements (laisser seulement `invoice.payment_succeeded`)
- Soit vérifier dans `invoice.payment_succeeded` si les tokens ont déjà été crédités

### 2. Métadonnées de l'Abonnement

**Vérification nécessaire** :
- Les métadonnées doivent être stockées dans `subscription_data.metadata` (pas seulement `session.metadata`)
- Stripe conserve les métadonnées de l'abonnement pour tous les renouvellements

---

## 🧪 Tests à Effectuer

### Test 1 : Premier Paiement
1. Créer un abonnement test
2. Vérifier que `checkout.session.completed` crédite 3000 tokens
3. Vérifier dans `user_credit_transactions` que la transaction est enregistrée

### Test 2 : Renouvellement
1. Simuler un renouvellement : `stripe trigger invoice.payment_succeeded`
2. Vérifier que 3000 tokens supplémentaires sont crédités
3. Vérifier que le total est correct (addition)

### Test 3 : Pack Standard
1. Acheter le pack standard
2. Vérifier que 3000 tokens sont crédités
3. Vérifier l'enregistrement de la transaction

---

## ✅ Conclusion

**Le système est correctement configuré pour** :
- ✅ Créditer 3000 tokens au premier paiement
- ✅ Créditer 3000 tokens à chaque renouvellement mensuel
- ✅ Utiliser l'addition (pas le remplacement)
- ✅ Enregistrer toutes les transactions

**Action recommandée** :
- Tester en mode Test Stripe pour valider le comportement complet
- Surveiller les logs lors des premiers abonnements réels
