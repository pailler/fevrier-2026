# Guide de Test - Activation des Modules IAHOME

## 🎯 **Objectif**
Vérifier que les modules souscrits apparaissent correctement dans la page `/encours` après un paiement Stripe.

## ✅ **État Actuel**
- ✅ **Application fonctionnelle** : https://iahome.fr
- ✅ **SSL sécurisé** : Certificat HTTPS valide
- ✅ **URLs de redirection** : Configurées pour `https://iahome.fr`
- ✅ **Webhook Stripe** : Configuré et fonctionnel
- ✅ **APIs d'activation** : Prêtes et testées

## 🧪 **Processus de Test Complet**

### 1. **Création d'un Compte Utilisateur**
1. Allez sur https://iahome.fr
2. Cliquez sur "S'inscrire" ou "Créer un compte"
3. Utilisez un email valide (ex: `test@example.com`)
4. Créez un mot de passe sécurisé
5. Confirmez votre compte

### 2. **Connexion**
1. Connectez-vous avec votre compte créé
2. Vérifiez que vous êtes bien connecté

### 3. **Test de Paiement**
1. Utilisez cette URL de paiement Stripe (générée automatiquement) :
   ```
   https://checkout.stripe.com/c/pay/cs_test_a1B3NTmJmMEc1s7rnaIfBAUB1yksWWFDjTJFuv5CCmDgGCB9GcjeiXDFQp
   ```

2. **Carte de test Stripe** :
   - Numéro : `4242 4242 4242 4242`
   - Date : `12/25`
   - CVC : `123`

3. **Complétez le paiement**

### 4. **Vérification de la Redirection**
1. Après le paiement, vous devez être redirigé vers :
   ```
   https://iahome.fr/stripe-return?session_id=cs_test_...
   ```

### 5. **Vérification de l'Activation**
1. Allez sur https://iahome.fr/encours
2. Vérifiez que le module **RuinedFooocus** apparaît dans la liste
3. Vérifiez que vous pouvez accéder au module

## 🔍 **Vérification des Logs**

### Commandes pour vérifier les logs :
```bash
# Voir les logs en temps réel
docker logs iahome-app --tail=20

# Voir les logs du webhook Stripe
docker logs iahome-app | grep "Webhook reçu"

# Voir les logs d'activation de module
docker logs iahome-app | grep "Accès module créé"
```

### Logs attendus après un paiement réussi :
```
🔍 Webhook reçu: checkout.session.completed
🔍 Debug - Paiement réussi pour la session: cs_test_...
✅ Accès module créé avec succès: [ID]
✅ Token d'accès créé: [ID]
✅ Paiement enregistré avec succès
```

## 🛠️ **APIs Disponibles**

### 1. **API de Création de Paiement**
- **URL** : `POST https://iahome.fr/api/create-payment-intent`
- **Fonction** : Crée une session de paiement Stripe

### 2. **API de Force Activation**
- **URL** : `POST https://iahome.fr/api/force-activate-module`
- **Fonction** : Active un module pour un utilisateur (par email)

### 3. **API d'Activation**
- **URL** : `POST https://iahome.fr/api/activate-module`
- **Fonction** : Active un module pour un utilisateur (par ID)

### 4. **API de Debug**
- **URL** : `POST https://iahome.fr/api/debug-payment`
- **Fonction** : Affiche les détails d'un utilisateur et ses modules

## 📋 **Scripts de Test Disponibles**

1. **`scripts/test-production.ps1`** - Test général de l'application
2. **`scripts/test-real-payment.ps1`** - Test de création de session de paiement
3. **`scripts/test-module-activation.ps1`** - Test d'activation de module
4. **`scripts/force-activate-module.ps1`** - Force l'activation d'un module
5. **`scripts/test-complete-flow.ps1`** - Test du processus complet

## 🔧 **Configuration Webhook Stripe**

### URL du Webhook :
```
https://iahome.fr/api/webhooks/stripe
```

### Événements à écouter :
- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.payment_succeeded`

## 📊 **Tables de Base de Données**

### 1. **profiles** - Utilisateurs
- `id` : ID unique de l'utilisateur
- `email` : Email de l'utilisateur
- `role` : Rôle (user, admin)

### 2. **user_applications** - Accès aux modules
- `user_id` : ID de l'utilisateur
- `module_id` : ID du module
- `module_title` : Titre du module
- `is_active` : Statut actif
- `expires_at` : Date d'expiration

### 3. **access_tokens** - Tokens d'accès
- `created_by` : ID de l'utilisateur créateur
- `module_id` : ID du module
- `module_name` : Nom du module
- `is_active` : Statut actif
- `expires_at` : Date d'expiration

### 4. **payments** - Historique des paiements
- `session_id` : ID de session Stripe
- `customer_email` : Email du client
- `amount` : Montant du paiement
- `status` : Statut du paiement

## 🎉 **Résultat Attendu**

Après un paiement réussi, l'utilisateur doit voir :
1. ✅ **Redirection** vers `https://iahome.fr/stripe-return`
2. ✅ **Module activé** dans la page `/encours`
3. ✅ **Accès au module** fonctionnel
4. ✅ **Token d'accès** créé automatiquement

## 🚨 **En Cas de Problème**

1. **Vérifiez les logs** : `docker logs iahome-app --tail=50`
2. **Testez l'API de debug** : Utilisez `scripts/list-users.ps1`
3. **Forcez l'activation** : Utilisez `scripts/force-activate-module.ps1`
4. **Vérifiez la base de données** : Connectez-vous à Supabase

---

**L'application IAHOME est maintenant prête pour les tests de production !** 🚀






