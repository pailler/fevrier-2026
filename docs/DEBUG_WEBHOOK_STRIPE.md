# Débogage du Webhook Stripe

## 🔍 Problème : Aucune activité sur le webhook Stripe (0 événements)

### ✅ Diagnostic

Si Stripe Dashboard montre **0 événements envoyés**, cela signifie que :
1. Le webhook n'est **pas appelé** par Stripe
2. Ou le webhook est appelé mais **échoue silencieusement**

### 🔧 Solutions

#### 1. Vérifier que le paiement est complété

Dans Stripe Dashboard → **Paiements** :
- Vérifiez que le paiement est bien **"Complété"** (succeeded)
- Si le paiement est en attente ou échoué, le webhook ne sera pas appelé

#### 2. Vérifier l'accessibilité de l'endpoint

Testez l'endpoint manuellement :
```bash
# Test GET
curl https://home.regispailler.fr/api/webhooks/stripe/test

# Test POST
curl -X POST https://home.regispailler.fr/api/webhooks/stripe/test
```

Si ces tests échouent, le serveur n'est pas accessible publiquement.

#### 3. Vérifier les événements dans Stripe Dashboard

Dans Stripe Dashboard → **Webhooks** → **Votre webhook** → **Événements envoyés** :
- Cliquez sur l'onglet **"Événements envoyés"**
- Vérifiez s'il y a des événements en échec
- Si oui, cliquez sur l'événement pour voir l'erreur

#### 4. Tester manuellement le webhook

Dans Stripe Dashboard → **Webhooks** → **Votre webhook** :
1. Cliquez sur **"Envoyer un webhook de test"**
2. Sélectionnez `checkout.session.completed`
3. Cliquez sur **"Envoyer un webhook de test"**
4. Vérifiez les logs du serveur pour voir si l'événement est reçu

#### 5. Vérifier l'URL du webhook

L'URL doit être exactement : `https://home.regispailler.fr/api/webhooks/stripe`
- Pas de slash à la fin
- HTTPS obligatoire
- Le domaine doit être accessible publiquement

#### 6. Vérifier Cloudflare Tunnel

Si vous utilisez Cloudflare Tunnel :
- Vérifiez que le tunnel est actif
- Vérifiez que le tunnel pointe vers `http://localhost:3000`
- Vérifiez que le domaine `home.regispailler.fr` est bien configuré

---

## 🔍 Problème : Prix de test non appliqué (9,90€ au lieu de 0,50€)

### ✅ Solution rapide : Mode test forcé

**Ajoutez dans `env.production.local` ou `.env.local` :**
```env
STRIPE_FORCE_TEST_PRICE=true
```

**Puis redémarrez le serveur** pour que la variable soit prise en compte.

### 🔍 Diagnostic étape par étape

1. **Vérifier les logs du serveur** :
   - Cliquez sur "S'abonner" depuis la page `/pricing2`
   - Cherchez dans les logs serveur :
     ```
     🔄 Création session Stripe V2: { packageType, userId, userEmail }
     🔍 Vérification prix test: { userEmail, emailLower, isTestEmail }
     📦 Package sélectionné: { useTestPrice, actualPrice }
     ✅ Session abonnement créée: ... avec prix: 0.50€
     ```

2. **Vérifier l'email de connexion** :
   - Ouvrez la console navigateur (F12)
   - Cliquez sur "S'abonner"
   - Cherchez : `🔄 Début du paiement: { userEmail: "..." }`
   - Vérifiez que l'email est exactement `regispailler@gmail.com` (sans espaces, minuscules)

3. **Si l'email n'est pas détecté** :
   - Utilisez `STRIPE_FORCE_TEST_PRICE=true` pour forcer le mode test
   - Ou vérifiez que vous êtes connecté avec `regispailler@gmail.com`

4. **Vérifier que le serveur a été redémarré** :
   - Après avoir ajouté/modifié les variables d'environnement, **redémarrez toujours le serveur**
   - Les variables d'environnement sont chargées au démarrage

---

## 🔍 Problème : Aucune trace du paiement

### ✅ Solution appliquée

L'endpoint webhook a été créé à l'URL correcte :
- **URL configurée dans Stripe** : `https://home.regispailler.fr/api/webhooks/stripe`
- **Endpoint créé** : `src/app/api/webhooks/stripe/route.ts`

---

## 📋 Vérifications à effectuer

### 1. Vérifier dans Stripe Dashboard

1. **Aller sur** : https://dashboard.stripe.com/webhooks
2. **Cliquer sur votre webhook**
3. **Onglet "Events"** :
   - Vérifiez si l'événement `checkout.session.completed` apparaît
   - Vérifiez le statut (✅ succès ou ❌ échec)
   - Cliquez sur l'événement pour voir les détails

4. **Si l'événement est en échec** :
   - Regardez le message d'erreur
   - Vérifiez le code de statut HTTP
   - Vérifiez les logs de réponse

### 2. Vérifier les logs du serveur

Dans les logs de votre serveur Next.js, vous devriez voir :

```
🔔 Webhook Stripe reçu sur /api/webhooks/stripe
🔔 Événement Stripe reçu: checkout.session.completed
✅ Session de paiement complétée: cs_...
```

**Si vous ne voyez pas ces logs** :
- Le webhook n'atteint pas votre serveur
- Vérifiez que le serveur est accessible publiquement
- Vérifiez que l'URL est correcte

### 3. Vérifier l'URL du webhook

**Dans Stripe Dashboard → Webhooks** :
- L'URL doit être exactement : `https://home.regispailler.fr/api/webhooks/stripe`
- Pas de slash à la fin
- Vérifiez que le domaine est correct

### 4. Vérifier le secret webhook

**Dans votre fichier `env.production.local`** :
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Dans Stripe Dashboard → Webhooks → Signing secret** :
- Le secret doit correspondre exactement
- Vérifiez qu'il n'y a pas d'espaces avant/après

### 5. Tester manuellement le webhook

**Option A : Via Stripe Dashboard**
1. Allez dans **Webhooks** → Votre webhook
2. Cliquez sur **"Send test webhook"**
3. Sélectionnez `checkout.session.completed`
4. Cliquez sur **"Send test webhook"**
5. Vérifiez les logs de votre serveur

**Option B : Via Stripe CLI**
```bash
# Installer Stripe CLI
npm install -g stripe-cli

# Se connecter
stripe login

# Écouter les événements
stripe listen --forward-to https://home.regispailler.fr/api/webhooks/stripe

# Dans un autre terminal, déclencher un événement test
stripe trigger checkout.session.completed
```

---

## 🐛 Problèmes courants

### Problème 1 : "Signature invalide"

**Cause** : Le `STRIPE_WEBHOOK_SECRET` ne correspond pas

**Solution** :
1. Allez dans Stripe Dashboard → Webhooks
2. Cliquez sur votre webhook
3. Copiez le "Signing secret" (commence par `whsec_`)
4. Mettez à jour `STRIPE_WEBHOOK_SECRET` dans vos variables d'environnement
5. Redémarrez le serveur

### Problème 2 : "404 Not Found"

**Cause** : L'endpoint n'existe pas ou l'URL est incorrecte

**Solution** :
- Vérifiez que l'endpoint `/api/webhooks/stripe` existe
- Vérifiez que l'URL dans Stripe est correcte
- Vérifiez que le serveur est accessible publiquement

### Problème 3 : "500 Internal Server Error"

**Cause** : Erreur dans le code du webhook

**Solution** :
- Vérifiez les logs du serveur pour voir l'erreur exacte
- Vérifiez que la base de données est accessible
- Vérifiez que les variables d'environnement sont correctes

### Problème 4 : L'événement n'apparaît pas dans Stripe

**Cause** : L'événement n'a pas été sélectionné dans la configuration du webhook

**Solution** :
1. Allez dans Stripe Dashboard → Webhooks
2. Cliquez sur votre webhook → **"Edit"**
3. Vérifiez que `checkout.session.completed` est sélectionné
4. Vérifiez que `invoice.payment_succeeded` est sélectionné
5. Sauvegardez

---

## 📊 Vérifier que le paiement a été traité

### 1. Vérifier dans la base de données

**Table `user_tokens`** :
```sql
SELECT * FROM user_tokens 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'formateur_tic@hotmail.com');
```

**Table `user_credit_transactions`** :
```sql
SELECT * FROM user_credit_transactions 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'formateur_tic@hotmail.com')
ORDER BY created_at DESC;
```

### 2. Vérifier via l'API

```bash
# Vérifier les tokens de l'utilisateur
curl "https://home.regispailler.fr/api/verify-subscription-tokens?email=formateur_tic@hotmail.com"
```

---

## 🔄 Relancer le traitement d'un paiement

Si un paiement n'a pas été traité, vous pouvez :

1. **Dans Stripe Dashboard** :
   - Allez dans **Payments** → Trouvez le paiement
   - Cliquez sur **"Send test webhook"** → Sélectionnez `checkout.session.completed`

2. **Via l'API Stripe** :
   - Récupérez l'ID de la session de paiement
   - Utilisez l'API Stripe pour récupérer les détails
   - Traitez manuellement si nécessaire

---

## ✅ Checklist de vérification

- [ ] L'endpoint `/api/webhooks/stripe` existe
- [ ] L'URL dans Stripe est correcte : `https://home.regispailler.fr/api/webhooks/stripe`
- [ ] Le `STRIPE_WEBHOOK_SECRET` correspond au secret dans Stripe
- [ ] Les événements sont sélectionnés dans Stripe (`checkout.session.completed`, etc.)
- [ ] Le serveur est accessible publiquement
- [ ] Les logs du serveur montrent que le webhook est reçu
- [ ] Les tokens sont crédités dans la base de données
- [ ] Les transactions sont enregistrées dans `user_credit_transactions`

---

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs complets du serveur
2. Vérifiez les événements dans Stripe Dashboard
3. Contactez le support si nécessaire
