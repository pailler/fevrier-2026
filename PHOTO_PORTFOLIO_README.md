# 📸 Portfolio Photo Intelligent - LangChain + Supabase

Un système de portfolio photo intelligent utilisant LangChain et Supabase pour iAhome, permettant la recherche sémantique de photos grâce à l'intelligence artificielle.

## 🎯 Fonctionnalités

### 🔍 Recherche Intelligente
- **Recherche sémantique** : Trouvez vos photos avec des descriptions naturelles
- **Exemples de requêtes** :
  - "Montre-moi les photos de mariage en extérieur au coucher du soleil"
  - "Portraits en noir et blanc avec une ambiance dramatique"
  - "Paysages montagneux avec des couleurs automnales"
  - "Photos de famille joyeuses en intérieur"

### 🤖 Analyse IA Automatique
- **Description automatique** : L'IA analyse chaque photo et génère une description détaillée
- **Tags intelligents** : Génération automatique de tags pertinents
- **Catégorisation** : Classification automatique par type de photo
- **Métadonnées** : Extraction des paramètres techniques estimés

### 📁 Gestion des Collections
- **Collections personnalisées** : Organisez vos photos par thème
- **Collections publiques/privées** : Contrôlez la visibilité
- **Photos de couverture** : Sélectionnez une photo représentative

### 📊 Statistiques Avancées
- **Compteurs de vues** : Suivez la popularité de vos photos
- **Recherches récentes** : Historique de vos recherches
- **Photos les plus vues** : Top des photos populaires

## 🚀 Installation

### 1. Prérequis
- Node.js 18+
- Compte Supabase
- Clé API OpenAI

### 2. Installation des dépendances
```bash
npm install langchain@^0.3.7
npm install langchain-openai@^0.2.7
npm install openai@^4.67.3
npm install react-dropzone@^14.3.5
npm install uuid@^11.0.3
npm install @types/uuid@^10.0.0
```

### 3. Configuration Supabase
1. Exécuter le script `create-photo-portfolio-schema.sql` dans Supabase SQL Editor
2. Créer le bucket `photo-portfolio` dans Supabase Storage
3. Configurer les politiques RLS pour le bucket

### 4. Variables d'environnement
Ajouter dans `.env.local` :
```env
# Configuration OpenAI
OPENAI_API_KEY=your-openai-api-key

# Configuration des embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Configuration du stockage
SUPABASE_STORAGE_BUCKET=photo-portfolio
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/tiff
```

## 📖 Utilisation

### Upload de Photos
1. Accédez à `/photo-portfolio`
2. Cliquez sur l'onglet "Upload"
3. Glissez-déposez votre photo ou cliquez pour sélectionner
4. L'IA analyse automatiquement la photo et génère une description

### Recherche Intelligente
1. Cliquez sur l'onglet "Recherche IA"
2. Tapez votre requête en langage naturel
3. Ajustez les filtres si nécessaire (seuil de similarité, nombre de résultats)
4. Consultez les résultats avec les scores de similarité

### Gestion des Collections
1. Cliquez sur "Nouvelle collection"
2. Donnez un nom et une description
3. Sélectionnez la collection lors de l'upload
4. Filtrez vos photos par collection

## 🔧 API Endpoints

### Upload de Photo
```http
POST /api/photo-portfolio/upload
Content-Type: multipart/form-data

{
  "file": File,
  "userId": string,
  "collectionId": string (optionnel),
  "customDescription": string (optionnel),
  "customTags": string (optionnel)
}
```

### Recherche Sémantique
```http
POST /api/photo-portfolio/search
Content-Type: application/json

{
  "query": string,
  "userId": string,
  "limit": number (défaut: 10),
  "threshold": number (défaut: 0.7)
}
```

### Récupération des Photos
```http
GET /api/photo-portfolio/search?userId=string&page=number&limit=number&collectionId=string
```

### Gestion des Collections
```http
GET /api/photo-portfolio/collections?userId=string
POST /api/photo-portfolio/collections
```

### Statistiques
```http
GET /api/photo-portfolio/stats?userId=string
```

## 🗄️ Structure de la Base de Données

### Tables Principales
- `photo_metadata` : Métadonnées des fichiers
- `photo_descriptions` : Descriptions et tags générés par l'IA
- `photo_embeddings` : Vecteurs d'embedding pour la recherche sémantique
- `photo_collections` : Collections de photos
- `collection_photos` : Liaison collections-photos
- `saved_searches` : Historique des recherches
- `photo_analytics` : Statistiques d'utilisation

### Fonctions SQL
- `search_photos_by_similarity()` : Recherche par similarité vectorielle
- `get_user_photo_stats()` : Statistiques utilisateur

## 🎨 Personnalisation

### Thèmes et Styles
Les composants utilisent Tailwind CSS et peuvent être facilement personnalisés :
- `PhotoUpload.tsx` : Interface d'upload
- `PhotoSearch.tsx` : Barre de recherche
- `PhotoGrid.tsx` : Grille d'affichage

### Modèles d'IA
- **Vision** : `gpt-4-vision-preview` pour l'analyse d'images
- **Embeddings** : `text-embedding-3-small` pour la recherche sémantique

## 🔒 Sécurité

### Row Level Security (RLS)
- Toutes les tables sont protégées par RLS
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Politiques configurées pour chaque table

### Validation des Fichiers
- Types de fichiers autorisés : JPG, PNG, WebP, TIFF
- Taille maximale : 10MB
- Validation côté client et serveur

## 🚀 Déploiement

```bash
# Exécuter le script de déploiement
chmod +x deploy-photo-portfolio.sh
./deploy-photo-portfolio.sh
```

## 📈 Performance

### Optimisations
- Index vectoriels pour la recherche sémantique
- Pagination des résultats
- Lazy loading des images
- Cache des embeddings

### Monitoring
- Statistiques d'utilisation
- Logs des erreurs
- Métriques de performance

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Upload de photos avec analyse IA
- ✅ Recherche sémantique intelligente
- ✅ Gestion des collections
- ✅ Statistiques et analytics
- ✅ Interface utilisateur moderne
- ✅ Sécurité RLS complète

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les logs d'erreur
3. Contactez l'équipe de développement

---

**Développé avec ❤️ pour iAhome**
