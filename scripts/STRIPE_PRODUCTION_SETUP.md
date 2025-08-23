# 🚀 Configuration Stripe en Mode Production

## 📋 Prérequis

### 1. Compte Stripe Production
- ✅ Compte Stripe vérifié et approuvé
- ✅ Informations bancaires configurées
- ✅ Documents légaux fournis

### 2. Clés API Production
- **Clé secrète de production** : `sk_live_...`
- **Clé publique de production** : `pk_live_...`
- **Webhook secret** : `whsec_...`

## 🔧 Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.production.local` :

```bash
# Mode Stripe (test ou production)
STRIPE_MODE=production

# Clés Stripe de production
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_production

# Webhook secret
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

### 2. Configuration des Webhooks

Dans votre dashboard Stripe, configurez un webhook vers :
```
https://iahome.fr/api/stripe-webhook
```

**Événements à écouter :**
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

### 3. Sécurité

#### Variables d'environnement sécurisées
```bash
# Ne jamais commiter ces clés dans Git
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Validation des paiements
- ✅ Vérification du statut de paiement
- ✅ Validation des montants
- ✅ Vérification des métadonnées

## 🧪 Tests en Production

### 1. Cartes de test Stripe
Utilisez ces cartes pour tester sans vrais paiements :

| Numéro | Résultat | Description |
|--------|----------|-------------|
| `4242 4242 4242 4242` | ✅ Succès | Paiement réussi |
| `4000 0000 0000 0002` | ❌ Échec | Paiement refusé |
| `4000 0000 0000 9995` | ❌ Insuffisant | Fonds insuffisants |

### 2. Test du processus complet
1. **Créer un paiement** avec une carte de test
2. **Vérifier l'activation** du module
3. **Contrôler les logs** de l'API
4. **Vérifier les webhooks**

## 🔒 Sécurité et Conformité

### 1. PCI DSS
- ✅ Stripe gère la conformité PCI DSS
- ✅ Aucune donnée de carte stockée localement
- ✅ Chiffrement SSL/TLS obligatoire

### 2. RGPD
- ✅ Collecte minimale des données
- ✅ Consentement explicite
- ✅ Droit à l'effacement

### 3. Audit Trail
- ✅ Logs de tous les paiements
- ✅ Traçabilité complète
- ✅ Sauvegarde des métadonnées

## 📊 Monitoring

### 1. Dashboard Stripe
- **Paiements** : Suivi en temps réel
- **Erreurs** : Alertes automatiques
- **Performance** : Métriques de conversion

### 2. Logs applicatifs
```bash
# Suivre les logs en temps réel
docker-compose -f docker-compose.prod.yml logs iahome-app -f
```

### 3. Métriques importantes
- **Taux de conversion** : Paiements réussis / Tentatives
- **Temps de traitement** : Durée moyenne des paiements
- **Erreurs** : Types et fréquences

## 🚨 Gestion des Erreurs

### 1. Erreurs courantes
```javascript
// Paiement refusé
if (error.code === 'card_declined') {
  // Gérer le refus de carte
}

// Fonds insuffisants
if (error.code === 'insufficient_funds') {
  // Informer l'utilisateur
}

// Carte expirée
if (error.code === 'expired_card') {
  // Demander une nouvelle carte
}
```

### 2. Récupération automatique
- ✅ Retry automatique pour les erreurs temporaires
- ✅ Notification à l'utilisateur
- ✅ Support client disponible

## 🔄 Activation du Mode Production

### 1. Checklist de sécurité
- [ ] Clés de production configurées
- [ ] Webhooks configurés et testés
- [ ] SSL/TLS activé
- [ ] Logs de sécurité activés
- [ ] Monitoring configuré

### 2. Test final
```bash
# 1. Test avec carte de test
# 2. Vérification de l'activation
# 3. Contrôle des logs
# 4. Validation des webhooks
```

### 3. Activation
```bash
# Modifier la variable d'environnement
STRIPE_MODE=production

# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart
```

## 📞 Support

### En cas de problème :
1. **Vérifier les logs** : `docker-compose logs iahome-app`
2. **Dashboard Stripe** : Vérifier les paiements
3. **Support Stripe** : Documentation officielle
4. **Contact admin** : Pour les problèmes spécifiques

## ⚠️ Avertissements

### Important :
- **Ne jamais utiliser** les clés de production en développement
- **Toujours tester** avec des cartes de test avant
- **Sauvegarder** les clés de manière sécurisée
- **Monitorer** les paiements en temps réel

### En cas d'urgence :
1. **Désactiver** le mode production
2. **Vérifier** les logs d'erreur
3. **Contacter** le support Stripe
4. **Restauration** si nécessaire

---

**Note** : Ce guide doit être mis à jour selon les évolutions de Stripe et de votre application.
