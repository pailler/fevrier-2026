# Application de Recherche Immobilière Privée

Application privée pour rechercher des biens immobiliers selon des critères définis, avec recherche multi-sites et suivi sur plusieurs mois.

## Fonctionnalités

### 🏠 Recherche Multi-Sites
- **Leboncoin** - Recherche sur le site principal
- **SeLoger** - Recherche sur les annonces professionnelles
- **PAP** - Recherche sur Particulier à Particulier
- **Sites locaux Vendée** - Recherche sur les agences immobilières locales

### 🤖 Recherche par Intelligence Artificielle
- **Analyse intelligente** - Suggestions de zones, types de biens, mots-clés
- **Analyse de biens** - Score de correspondance, points forts, recommandations
- **Opportunités cachées** - Détection d'opportunités non évidentes

### 🔨 Ventes aux Enchères
- **Interencheres** - Ventes aux enchères immobilières
- **Drouot** - Ventes aux enchères prestigieuses
- **Adjudic** - Ventes aux enchères judiciaires

### 📜 Autres Sources
- **Notaires** - Biens exclusifs des notaires
- **Saisies immobilières** - Biens saisis par les banques
- **Mandats de vente** - Mandats exclusifs

### 🗺️ Carte Interactive
- Carte intégrée avec Leaflet/OpenStreetMap
- Affichage des biens sur la carte avec marqueurs colorés
- Navigation vers les détails depuis la carte
- Géocodage automatique des adresses

### 📊 Dashboard de Suivi
- Statistiques détaillées par source
- Évolution mensuelle des biens trouvés
- Graphiques de répartition par site
- Suivi des recherches effectuées

### 🔔 Notifications
- Notifications automatiques pour les nouveaux biens
- Alertes par email (à configurer)
- Historique des notifications

### 💾 Base de Données
- Stockage de tous les biens trouvés
- Historique des recherches
- Critères de recherche sauvegardés
- Système de favoris et notes

## Installation

### 1. Créer les tables Supabase

Exécutez le script SQL dans le dashboard Supabase :

```sql
-- Fichier: scripts/create-real-estate-tables.sql
```

Ou utilisez l'API pour créer les tables :

```bash
POST /api/real-estate/create-tables
```

### 2. Installer les dépendances

```bash
npm install
```

Les dépendances nécessaires :
- `leaflet` - Pour la carte interactive
- `recharts` - Pour les graphiques du dashboard
- `@supabase/supabase-js` - Pour la base de données

### 3. Configuration

Assurez-vous que les variables d'environnement Supabase sont configurées :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (pour les opérations admin)

## Utilisation

### Accès à l'application

1. Connectez-vous à votre compte
2. Accédez à `/real-estate` pour la recherche
3. Accédez à `/real-estate/dashboard` pour les statistiques

### Configuration des critères de recherche

Par défaut, l'application crée des critères pour :
- **Prix** : 150 000 € - 200 000 €
- **Superficie** : 100 m² minimum
- **Région** : Vendée
- **Type** : Maison
- **Style** : Moderne et campagne

Vous pouvez modifier ces critères via l'interface.

### Lancement d'une recherche

1. Cliquez sur le bouton "Rechercher"
2. L'application recherche sur tous les sites configurés
3. Les résultats s'affichent dans la liste et sur la carte
4. Les nouveaux biens sont marqués automatiquement

### Recherche automatique programmée

Pour automatiser les recherches, configurez un cron job qui appelle :

```bash
POST /api/real-estate/scheduled-search
Authorization: Bearer YOUR_CRON_SECRET
```

Exemple avec cron (toutes les 6 heures) :

```bash
0 */6 * * * curl -X POST https://votre-domaine.com/api/real-estate/scheduled-search -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Structure de la Base de Données

### Tables principales

1. **real_estate_search_criteria** - Critères de recherche
2. **real_estate_properties** - Biens immobiliers trouvés
3. **real_estate_search_history** - Historique des recherches
4. **real_estate_notifications** - Notifications

### Sécurité (RLS)

Toutes les tables utilisent Row Level Security (RLS) pour que chaque utilisateur ne voie que ses propres données.

## API Endpoints

### Critères de recherche
- `GET /api/real-estate/criteria` - Liste des critères
- `POST /api/real-estate/criteria` - Créer/modifier des critères
- `DELETE /api/real-estate/criteria?id=...` - Supprimer des critères

### Propriétés
- `GET /api/real-estate/properties` - Liste des propriétés
- `PATCH /api/real-estate/properties` - Mettre à jour une propriété

### Recherche
- `POST /api/real-estate/search` - Lancer une recherche

### Statistiques
- `GET /api/real-estate/statistics` - Obtenir les statistiques

### Notifications
- `GET /api/real-estate/notifications` - Liste des notifications
- `PATCH /api/real-estate/notifications` - Marquer comme lues

## Intégration des Sites Immobiliers

### État actuel

Les fonctions de recherche sont créées mais nécessitent une intégration spécifique pour chaque site :

1. **Leboncoin** - Nécessite une API officielle ou un service de scraping
2. **SeLoger** - Nécessite une intégration API
3. **PAP** - Nécessite une intégration API ou scraping
4. **Sites locaux** - Nécessite une intégration par site
5. **Ventes aux enchères** (Interencheres, Drouot, Adjudic) - Nécessite une intégration API ou scraping
6. **Notaires** - Nécessite une intégration spécifique
7. **Saisies immobilières** - Nécessite une intégration spécifique

### Recherche IA

La recherche par IA est **fonctionnelle** si vous avez une clé API OpenAI configurée :
```env
OPENAI_API_KEY=votre_cle_api
```

L'IA peut :
- Analyser vos critères et suggérer des stratégies
- Analyser des biens individuels avec score et recommandations
- Détecter des opportunités cachées

### Prochaines étapes pour l'intégration

1. **Option 1 : APIs officielles**
   - Contacter chaque site pour obtenir un accès API
   - Implémenter l'authentification et les appels API

2. **Option 2 : Scraping (avec respect des robots.txt)**
   - Utiliser des bibliothèques comme Puppeteer ou Playwright
   - Respecter les délais entre requêtes
   - Gérer les CAPTCHAs si nécessaire

3. **Option 3 : Services tiers**
   - Utiliser des services comme ScraperAPI, Apify, etc.
   - Intégrer leurs APIs dans les fonctions de recherche

## Fonctionnalités Avancées

### Géocodage

L'application utilise Nominatim (OpenStreetMap) pour géocoder les adresses gratuitement. Pour un usage intensif, considérez :
- Google Geocoding API
- Mapbox Geocoding API
- Here Geocoding API

### Notifications Email

Pour activer les notifications par email, configurez :
- SendGrid (déjà dans les dépendances)
- Ou un autre service d'email

Modifiez le code dans `/api/real-estate/scheduled-search/route.ts` pour envoyer des emails.

## Maintenance

### Nettoyage des anciens biens

Les biens peuvent être archivés mais ne sont pas supprimés automatiquement. Créez un script de nettoyage si nécessaire.

### Optimisation

- Index sur les colonnes fréquemment recherchées (déjà créés)
- Cache des résultats de recherche
- Pagination pour les grandes listes

## Support

Pour toute question ou problème, consultez :
- La documentation Supabase
- La documentation Leaflet
- La documentation Next.js
