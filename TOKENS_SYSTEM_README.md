# Système de Tokens IAHome

## Vue d'ensemble

Le système de tokens permet aux utilisateurs d'acheter et d'utiliser des tokens pour accéder aux modules payants d'IAHome. Chaque module payant consomme un certain nombre de tokens lors de son utilisation.

## Fonctionnalités

### 1. Achat de Tokens (`/tokens`)
- **Page d'achat** : Les utilisateurs peuvent choisir un module et un package de tokens
- **Packages disponibles** :
  - Pack Basique : 100 tokens - 9,99€
  - Pack Standard : 500 tokens - 39,99€ (populaire)
  - Pack Premium : 1000 tokens - 69,99€
  - Pack Entreprise : 5000 tokens - 299,99€
- **Paiement Stripe** : Intégration complète avec Stripe pour les paiements sécurisés

### 2. Gestion des Tokens (`/my-tokens`)
- **Solde des tokens** : Affichage du nombre de tokens disponibles
- **Historique d'utilisation** : Liste des modules utilisés et tokens consommés
- **Informations du package** : Détails du package acheté et date d'achat

### 3. Affichage dans le Header
- **Solde visible** : Le nombre de tokens est affiché dans le header pour les utilisateurs connectés
- **Navigation rapide** : Clic sur le solde pour accéder à la page de gestion

## Structure de la Base de Données

### Tables Principales

#### `user_tokens`
```sql
- id (UUID, PK)
- user_id (UUID, FK vers auth.users)
- tokens (INTEGER) - Nombre de tokens disponibles
- package_name (TEXT) - Nom du package acheté
- purchase_date (TIMESTAMP) - Date d'achat
- is_active (BOOLEAN) - Statut actif/inactif
- created_at, updated_at (TIMESTAMP)
```

#### `token_usage`
```sql
- id (UUID, PK)
- user_id (UUID, FK vers auth.users)
- module_id (TEXT) - ID du module utilisé
- module_name (TEXT) - Nom du module
- tokens_consumed (INTEGER) - Tokens consommés
- usage_date (TIMESTAMP) - Date d'utilisation
```

### Fonctions Utilitaires

#### `consume_tokens(user_id, module_id, module_name, tokens_to_consume)`
- Consomme des tokens pour un utilisateur et un module
- Vérifie la disponibilité des tokens
- Enregistre l'utilisation dans l'historique

#### `add_tokens(user_id, tokens_to_add, package_name)`
- Ajoute des tokens à un utilisateur
- Utilisé lors des achats et des ajustements manuels

## API Endpoints

### `GET /api/user-tokens?userId={userId}`
Récupère les tokens d'un utilisateur
```json
{
  "tokens": 500,
  "packageName": "Pack Standard",
  "purchaseDate": "2024-01-15T10:30:00Z",
  "isActive": true
}
```

### `POST /api/user-tokens`
Consomme des tokens
```json
{
  "userId": "uuid",
  "tokensToConsume": 50,
  "moduleId": "stablediffusion",
  "moduleName": "Stable Diffusion"
}
```

### `PUT /api/user-tokens`
Ajoute des tokens (pour les tests ou ajustements)
```json
{
  "userId": "uuid",
  "tokensToAdd": 100,
  "packageName": "Test Addition"
}
```

## Intégration Stripe

### Webhook Stripe
Le webhook `/api/stripe-webhook` gère automatiquement :
- L'ajout de tokens après paiement réussi
- La mise à jour des métadonnées de l'utilisateur
- La gestion des erreurs de paiement

### Métadonnées Stripe
```json
{
  "type": "token_purchase",
  "moduleId": "stablediffusion",
  "moduleTitle": "Stable Diffusion",
  "userId": "uuid",
  "tokenPackage": "Pack Standard",
  "tokens": "500"
}
```

## Consommation de Tokens par Module

Chaque module payant consomme un nombre différent de tokens :

- **Modules Image** (Stable Diffusion, Photo Portfolio) : 50 tokens
- **Modules Audio** (Whisper) : 25 tokens  
- **Modules Vidéo** (MeTube) : 10 tokens
- **Autres modules** : 30 tokens

## Sécurité

### Row Level Security (RLS)
- Les utilisateurs ne peuvent voir que leurs propres tokens
- Les utilisateurs ne peuvent modifier que leurs propres tokens
- L'historique d'utilisation est privé par utilisateur

### Validation
- Vérification de la disponibilité des tokens avant consommation
- Validation des paramètres d'entrée
- Gestion des erreurs et rollback des transactions

## Installation

1. **Exécuter le script SQL** :
   ```bash
   # Exécuter database-schema-tokens.sql dans Supabase
   ```

2. **Variables d'environnement** :
   ```env
   STRIPE_SECRET_KEY=sk_...
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Configuration Stripe** :
   - Configurer le webhook vers `/api/stripe-webhook`
   - Événements à écouter : `checkout.session.completed`

## Utilisation dans le Code

### Vérifier les tokens avant utilisation d'un module
```typescript
const response = await fetch('/api/user-tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    tokensToConsume: 50,
    moduleId: 'stablediffusion',
    moduleName: 'Stable Diffusion'
  })
});

const result = await response.json();
if (!result.success) {
  // Rediriger vers la page d'achat de tokens
  router.push('/tokens');
  return;
}
```

### Afficher le solde de tokens
```tsx
import TokenBalance from '@/components/TokenBalance';

<TokenBalance userId={user.id} />
```

## Monitoring et Analytics

### Métriques importantes
- Nombre total de tokens vendus
- Modules les plus utilisés
- Taux de conversion des achats
- Utilisation moyenne des tokens par utilisateur

### Logs
- Tous les achats de tokens sont loggés
- L'historique d'utilisation est conservé
- Les erreurs sont trackées dans les logs Stripe

## Maintenance

### Nettoyage des données
- L'historique d'utilisation peut être archivé après 1 an
- Les tokens inactifs peuvent être purgés après 2 ans

### Sauvegarde
- Les données de tokens sont critiques et doivent être sauvegardées
- Utiliser les sauvegardes automatiques de Supabase

## Support

Pour toute question ou problème :
1. Vérifier les logs Stripe
2. Contrôler les logs de l'API
3. Vérifier la configuration RLS
4. Tester avec des utilisateurs de test

