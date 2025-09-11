# 🚀 Guide d'Installation - Portfolio Photo IA

## Installation en 3 étapes seulement !

### ✅ Étape 1 : Vérifier pgvector (CRITIQUE)
1. Allez dans **Supabase Dashboard > SQL Editor**
2. Exécutez `check-pgvector-quick.sql`
3. Vérifiez que pgvector est marqué ✅
4. Si ❌, contactez le support Supabase pour activer pgvector

### ✅ Étape 2 : Exécuter le script SQL complet
1. Copiez-collez le contenu de `create-photo-portfolio-complete.sql`
2. Cliquez sur **"Run"**
3. Attendez la confirmation : `Portfolio Photo IA installé avec succès ! 🎉`

### ✅ Étape 3 : Vérifier l'installation
1. Exécutez `verify-installation.sql`
2. Vérifiez que tous les éléments sont marqués ✅

## 🎯 C'est tout ! Votre Portfolio Photo IA est prêt !

### Accès à l'application
- **URL** : `https://votre-domaine.com/photo-portfolio`
- **Fonctionnalités** : Upload, recherche IA, collections, statistiques

## 🔧 Configuration optionnelle

### Variables d'environnement (dans `.env.local`)
```env
OPENAI_API_KEY=your-openai-api-key
EMBEDDING_MODEL=text-embedding-3-small
SUPABASE_STORAGE_BUCKET=photo-portfolio
```

### Test de l'application
```bash
npm run dev
# Accédez à http://localhost:3000/photo-portfolio
```

## 📋 Ce qui est installé automatiquement

### ✅ Base de données
- 7 tables avec relations complètes
- Index optimisés pour les performances
- Extension vectorielle activée
- Politiques RLS de sécurité

### ✅ Stockage
- Bucket `photo-portfolio` créé
- Politiques de sécurité configurées
- Support des formats : JPG, PNG, WebP, TIFF

### ✅ Fonctions avancées
- Recherche sémantique par similarité
- Statistiques utilisateur
- Triggers automatiques
- Gestion des collections

### ✅ Sécurité
- Row Level Security (RLS) activé
- Politiques par utilisateur
- Validation des types de fichiers
- Authentification requise

## 🆘 Dépannage

### ❌ Erreur "Extension pgvector non disponible"
**Solution :**
1. Vérifiez votre version Supabase (doit être récente)
2. Contactez le support Supabase pour activer pgvector
3. Ou créez un nouveau projet Supabase (pgvector activé par défaut)

### ❌ Erreur "type 'vector' does not exist"
**Solution :**
1. Exécutez `check-pgvector-quick.sql` pour diagnostiquer
2. Si pgvector n'est pas installé : `CREATE EXTENSION vector;`
3. Si pgvector n'est pas disponible : contactez le support

### ❌ Erreur "Bucket non trouvé"
- Vérifiez que le script s'est exécuté complètement
- Le bucket est créé automatiquement par le script

### ❌ Erreur "Politiques RLS"
- Toutes les politiques sont créées automatiquement
- Vérifiez que vous êtes connecté en tant qu'administrateur

### 🔧 Test complet de pgvector
Exécutez `test-pgvector.sql` pour un diagnostic complet

## 🎉 Fonctionnalités disponibles

### Upload intelligent
- Glisser-déposer de photos
- Analyse automatique par l'IA
- Génération de descriptions et tags
- Support multi-formats

### Recherche sémantique
- "Photos de mariage en extérieur au coucher du soleil"
- Recherche par similarité vectorielle
- Filtres avancés
- Historique des recherches

### Gestion des collections
- Collections personnalisées
- Organisation par thème
- Collections publiques/privées
- Photos de couverture

### Statistiques et analytics
- Compteurs de vues
- Photos populaires
- Recherches récentes
- Métriques d'utilisation

---

**🎯 Installation terminée ! Profitez de votre Portfolio Photo IA !**
