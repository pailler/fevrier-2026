# Configuration des Clés Stripe

## 📋 Fichiers de Configuration

### 1. `.env.local` (Développement local)
- Utilisé pour le développement en local
- Contient les clés Stripe en mode **Test**
- Ne doit **JAMAIS** être commité dans Git

### 2. `env.production.local` (Production)
- Utilisé pour la production
- Contient les clés Stripe en mode **Production** (live)
- Ne doit **JAMAIS** être commité dans Git

---

## 🔑 Clés Stripe Configurées

### Mode Test (Développement)
- **STRIPE_SECRET_KEY** : `sk_test_...`
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** : `pk_test_...`
- **STRIPE_WEBHOOK_SECRET** : `whsec_...` (pour les webhooks en mode test)

### Mode Production
- **STRIPE_SECRET_KEY** : `sk_live_...`
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** : `pk_live_...`
- **STRIPE_WEBHOOK_SECRET** : `whsec_...` (pour les webhooks en production)

---

## ⚠️ Important

1. **Ne jamais partager ces clés publiquement**
2. **Utiliser des clés différentes pour Test et Production**
3. **Le webhook secret doit correspondre au webhook configuré dans Stripe Dashboard**
4. **Vérifier que `.env.local` est dans `.gitignore`**

---

## 🔧 Configuration du Webhook Secret

Le `STRIPE_WEBHOOK_SECRET` doit correspondre au secret du webhook configuré dans le Dashboard Stripe :

1. **Mode Test** :
   - Dashboard Stripe → Developers → Webhooks (mode Test activé)
   - Cliquer sur votre webhook
   - Copier le "Signing secret"
   - Mettre dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_...`

2. **Mode Production** :
   - Dashboard Stripe → Developers → Webhooks (mode Production activé)
   - Cliquer sur votre webhook
   - Copier le "Signing secret"
   - Mettre dans `env.production.local` : `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## ✅ Vérification

Pour vérifier que les clés sont bien configurées :

1. **Vérifier les variables d'environnement** :
   ```bash
   # En développement
   echo $STRIPE_SECRET_KEY
   
   # En production
   # Vérifier dans votre service d'hébergement
   ```

2. **Tester une connexion Stripe** :
   - Créer un abonnement test
   - Vérifier les logs pour voir si Stripe répond correctement

3. **Tester le webhook** :
   - Utiliser la CLI Stripe : `stripe trigger invoice.payment_succeeded`
   - Vérifier que le webhook est reçu et traité

---

## 🔄 Mise à Jour

Si vous devez mettre à jour les clés :

1. **Récupérer les nouvelles clés** depuis le Dashboard Stripe
2. **Mettre à jour le fichier approprié** (`.env.local` ou `env.production.local`)
3. **Redémarrer le serveur** pour que les nouvelles variables soient chargées
4. **Tester** que tout fonctionne correctement

---

## 📚 Ressources

- [Documentation Stripe API Keys](https://stripe.com/docs/keys)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Guide de configuration webhook](./CONFIGURATION_WEBHOOK_STRIPE.md)
