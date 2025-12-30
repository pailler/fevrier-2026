# Administration des Services Administratifs

Ce document explique comment utiliser l'interface d'administration pour gérer les services administratifs sur iahome.fr.

## 📋 Vue d'ensemble

Le système permet de :
- Gérer les catégories de services administratifs (CAF, Sécurité Sociale, etc.)
- Gérer les services/rubriques avec leurs URLs
- Vérifier automatiquement que les sites web sont toujours accessibles
- Suivre l'historique des vérifications d'URLs

## 🚀 Installation

### 1. Créer les tables Supabase

Exécutez le script SQL dans Supabase SQL Editor :

```bash
# Le fichier se trouve dans :
scripts/create-administration-tables.sql
```

Ou utilisez l'API route pour créer les tables :

```bash
POST /api/admin/administration/create-tables
```

### 2. Migrer les données existantes (optionnel)

Si vous avez des données existantes dans `src/app/administration/page.tsx`, vous pouvez les migrer :

```bash
node scripts/migrate-administration-data.js
```

## 🎯 Utilisation

### Accéder à l'interface admin

1. Connectez-vous en tant qu'administrateur
2. Allez dans `/admin/administration`
3. Vous verrez trois onglets :
   - **Catégories** : Gérer les catégories (CAF, Sécurité Sociale, etc.)
   - **Services** : Gérer les services/rubriques avec leurs URLs
   - **Vérification URLs** : Voir l'historique des vérifications et relancer des vérifications

### Gérer les catégories

1. Cliquez sur l'onglet "Catégories"
2. Cliquez sur "+ Nouvelle catégorie" pour créer une catégorie
3. Remplissez les champs :
   - **Nom** : Nom de la catégorie (ex: "CAF")
   - **Icône** : Emoji ou icône (ex: "👨‍👩‍👧‍👦")
   - **Couleur** : Classe Tailwind pour le gradient (ex: "from-blue-500 to-blue-600")
   - **Description** : Description optionnelle
   - **Ordre d'affichage** : Ordre dans la liste
   - **Actif** : Activer/désactiver la catégorie

4. Cliquez sur ✏️ pour modifier une catégorie existante
5. Cliquez sur 🗑️ pour supprimer une catégorie (supprime aussi tous les services associés)

### Gérer les services

1. Cliquez sur l'onglet "Services"
2. Cliquez sur "+ Nouveau service" pour créer un service
3. Remplissez les champs :
   - **Catégorie** : Sélectionnez la catégorie parente
   - **Nom** : Nom du service
   - **URL** : URL du site web (requis)
   - **Description** : Description du service
   - **Icône** : Emoji ou icône
   - **Service populaire** : Cocher si c'est un service populaire
   - **App Store URL** : URL de l'app iOS (optionnel)
   - **Play Store URL** : URL de l'app Android (optionnel)
   - **Ordre d'affichage** : Ordre dans la liste
   - **Actif** : Activer/désactiver le service

4. Cliquez sur ✏️ pour modifier un service existant
5. Cliquez sur ✅ pour vérifier l'URL du service
6. Cliquez sur 🗑️ pour supprimer un service

### Vérifier les URLs

1. Cliquez sur l'onglet "Vérification URLs"
2. Cliquez sur "✅ Vérifier toutes les URLs" pour vérifier tous les services actifs
3. Les résultats s'affichent avec :
   - ✅ Vert si l'URL est valide (status 200-399)
   - ❌ Rouge si l'URL est invalide ou en erreur
   - Le code de statut HTTP
   - Le temps de réponse
   - La date de dernière vérification

4. Cliquez sur 🔄 pour revérifier une URL spécifique

## 🔧 API Routes

### Catégories

- `GET /api/admin/administration/categories` - Liste toutes les catégories
- `POST /api/admin/administration/categories` - Créer une catégorie
- `GET /api/admin/administration/categories/[id]` - Récupérer une catégorie
- `PUT /api/admin/administration/categories/[id]` - Mettre à jour une catégorie
- `DELETE /api/admin/administration/categories/[id]` - Supprimer une catégorie

### Services

- `GET /api/admin/administration/services` - Liste tous les services
- `GET /api/admin/administration/services?category_id=[id]` - Filtrer par catégorie
- `POST /api/admin/administration/services` - Créer un service
- `GET /api/admin/administration/services/[id]` - Récupérer un service
- `PUT /api/admin/administration/services/[id]` - Mettre à jour un service
- `DELETE /api/admin/administration/services/[id]` - Supprimer un service

### Vérification URLs

- `POST /api/admin/administration/check-urls` - Vérifier une URL ou toutes les URLs
  - Body: `{ service_id: "uuid" }` ou `{ check_all: true }`
- `GET /api/admin/administration/check-urls` - Récupérer l'historique
  - Query params: `service_id`, `limit`

### Données publiques

- `GET /api/administration/data` - Récupérer toutes les catégories et services actifs (pour la page publique)

## 📊 Structure de la base de données

### Table `administration_categories`

- `id` (UUID) - Identifiant unique
- `name` (VARCHAR) - Nom de la catégorie
- `icon` (VARCHAR) - Icône/emoji
- `color` (VARCHAR) - Classe Tailwind pour le gradient
- `description` (TEXT) - Description optionnelle
- `display_order` (INTEGER) - Ordre d'affichage
- `is_active` (BOOLEAN) - Actif/inactif
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### Table `administration_services`

- `id` (UUID) - Identifiant unique
- `category_id` (UUID) - Référence vers la catégorie
- `name` (VARCHAR) - Nom du service
- `description` (TEXT) - Description
- `url` (TEXT) - URL du site web
- `icon` (VARCHAR) - Icône/emoji
- `is_popular` (BOOLEAN) - Service populaire
- `app_store_url` (TEXT) - URL App Store
- `play_store_url` (TEXT) - URL Play Store
- `display_order` (INTEGER) - Ordre d'affichage
- `is_active` (BOOLEAN) - Actif/inactif
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### Table `administration_url_checks`

- `id` (UUID) - Identifiant unique
- `service_id` (UUID) - Référence vers le service
- `url` (TEXT) - URL vérifiée
- `status_code` (INTEGER) - Code de statut HTTP
- `is_valid` (BOOLEAN) - URL valide ou non
- `error_message` (TEXT) - Message d'erreur si invalide
- `response_time_ms` (INTEGER) - Temps de réponse en ms
- `last_checked_at` (TIMESTAMP) - Date de dernière vérification
- `created_at` (TIMESTAMP) - Date de création

## 🔄 Automatisation

Pour automatiser la vérification des URLs, vous pouvez :

1. Créer un cron job qui appelle l'API de vérification
2. Utiliser un service comme Vercel Cron ou GitHub Actions
3. Configurer un webhook qui vérifie les URLs périodiquement

Exemple de cron job (Vercel) :

```json
{
  "crons": [
    {
      "path": "/api/admin/administration/check-urls",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Cela vérifiera toutes les URLs toutes les 6 heures.

## 🐛 Dépannage

### Les tables n'existent pas

Exécutez le script SQL dans Supabase SQL Editor :
```sql
-- Voir scripts/create-administration-tables.sql
```

### Les données ne s'affichent pas

1. Vérifiez que les catégories et services sont marqués comme `is_active = true`
2. Vérifiez les logs de la console pour les erreurs
3. Vérifiez que les permissions Supabase sont correctement configurées

### Les vérifications d'URL échouent

1. Vérifiez que les URLs sont valides et accessibles
2. Certains sites peuvent bloquer les requêtes HEAD - le système utilise HEAD par défaut
3. Vérifiez les logs pour voir les messages d'erreur détaillés

## 📝 Notes

- Les données sont stockées dans Supabase
- La page publique `/administration` charge les données depuis l'API `/api/administration/data`
- Seuls les administrateurs peuvent accéder à `/admin/administration`
- Les vérifications d'URL sont enregistrées dans l'historique pour suivi








