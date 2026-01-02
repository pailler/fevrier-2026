# Guide de Démarrage Rapide - Recherche Immobilière

## 🚀 Installation en 5 minutes

### 1. Installer les dépendances

```bash
npm install
```

Cela installera :
- `leaflet` et `@types/leaflet` - Pour la carte
- `recharts` - Pour les graphiques

### 2. Créer les tables dans Supabase

**Option A : Via le Dashboard Supabase (Recommandé)**

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu de `scripts/create-real-estate-tables.sql`
4. Exécutez le script

**Option B : Via l'API**

```bash
curl -X POST http://localhost:3000/api/real-estate/create-tables
```

### 3. Lancer l'application

```bash
npm run dev
```

### 4. Accéder à l'application

- **Recherche** : http://localhost:3000/real-estate
- **Dashboard** : http://localhost:3000/real-estate/dashboard

## 📋 Configuration initiale

### Critères par défaut

L'application crée automatiquement des critères de recherche pour :
- **Prix** : 150 000 € - 200 000 €
- **Superficie** : 100 m² minimum
- **Région** : Vendée
- **Type** : Maison
- **Style** : Moderne et campagne

Vous pouvez les modifier via l'interface.

## 🔍 Première recherche

1. Connectez-vous à votre compte
2. Allez sur `/real-estate`
3. Cliquez sur "Rechercher"
4. Les résultats s'affichent dans la liste et sur la carte

## ⚙️ Recherche automatique (Optionnel)

Pour automatiser les recherches toutes les 6 heures :

### Avec un service de cron en ligne

Utilisez un service comme :
- **cron-job.org**
- **EasyCron**
- **Cronitor**

Configurez :
- **URL** : `https://votre-domaine.com/api/real-estate/scheduled-search`
- **Méthode** : POST
- **Headers** : `Authorization: Bearer YOUR_CRON_SECRET`
- **Fréquence** : Toutes les 6 heures

### Avec un cron local (Linux/Mac)

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (toutes les 6 heures)
0 */6 * * * curl -X POST https://votre-domaine.com/api/real-estate/scheduled-search -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Définir le secret cron

Ajoutez dans votre `.env.local` :

```env
CRON_SECRET=votre-secret-tres-securise
```

### Activer la recherche IA (Optionnel)

Pour utiliser la recherche par IA, ajoutez dans votre `.env.local` :

```env
OPENAI_API_KEY=votre_cle_api_openai
```

L'IA peut :
- Analyser vos critères et suggérer des stratégies
- Analyser des biens avec score de correspondance
- Détecter des opportunités cachées

## 📊 Utilisation du Dashboard

Le dashboard affiche :
- Nombre total de biens trouvés
- Nouveaux biens
- Favoris
- Prix moyen
- Statistiques par source
- Évolution mensuelle

## 🎯 Fonctionnalités principales

### Filtres
- Afficher uniquement les nouveaux biens
- Afficher uniquement les favoris

### Sources de recherche
- 🤖 Recherche par IA (nécessite OPENAI_API_KEY)
- 🔨 Ventes aux enchères (Interencheres, Drouot, Adjudic)
- 📜 Notaires
- ⚖️ Saisies immobilières

### Actions sur les biens
- ❤️ Ajouter aux favoris
- 👁️ Marquer comme vu
- 🔗 Ouvrir l'annonce originale
- 🤖 Analyser avec l'IA (score, points forts, recommandations)

### Carte
- Cliquez sur un marqueur pour voir les détails
- Les nouveaux biens sont en vert
- Les favoris sont en rouge
- Les autres biens sont en bleu

## ⚠️ Notes importantes

### Intégration des sites immobiliers

Les fonctions de recherche sont créées mais nécessitent une intégration spécifique :

1. **Leboncoin** - Nécessite une API ou scraping
2. **SeLoger** - Nécessite une intégration API
3. **PAP** - Nécessite une intégration API ou scraping
4. **Sites locaux** - Nécessite une intégration par site

Pour l'instant, les fonctions retournent des structures vides. Vous devrez :
- Soit utiliser des APIs officielles
- Soit implémenter du scraping (avec respect des robots.txt)
- Soit utiliser des services tiers (ScraperAPI, Apify, etc.)

### Géocodage

L'application utilise Nominatim (OpenStreetMap) gratuitement. Pour un usage intensif, considérez :
- Google Geocoding API
- Mapbox Geocoding API

## 🐛 Dépannage

### Les tables ne se créent pas

Vérifiez que vous avez les droits admin sur Supabase et que le service role key est correctement configuré.

### La carte ne s'affiche pas

Vérifiez que Leaflet est bien installé :
```bash
npm list leaflet
```

### Les recherches ne retournent rien

C'est normal ! Les fonctions de recherche nécessitent une intégration avec les sites immobiliers. Consultez la section "Intégration des sites immobiliers" ci-dessus.

## 📚 Documentation complète

Consultez `docs/REAL_ESTATE_SEARCH.md` pour la documentation complète.
