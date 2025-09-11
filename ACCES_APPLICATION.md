# 🚀 Comment Accéder à l'Application Portfolio Photo IA

## 🌐 URLs d'accès

### Développement local
```
http://localhost:3000/photo-portfolio
```

### Production (après déploiement)
```
https://votre-domaine.com/photo-portfolio
```

## 🚀 Démarrage de l'application

### 1. Démarrer le serveur de développement
```bash
# Dans le terminal, à la racine du projet
npm run dev
```

### 2. Ouvrir dans le navigateur
- Ouvrez votre navigateur
- Allez à l'adresse : `http://localhost:3000/photo-portfolio`

## 🔐 Authentification requise

### Connexion obligatoire
L'application nécessite une authentification Supabase :
- **Connexion Google** (recommandée)
- **Connexion email/mot de passe**
- **Inscription** si nouveau compte

### Page de connexion
Si vous n'êtes pas connecté, vous serez redirigé vers :
```
http://localhost:3000/auth/login
```

## 📱 Interface de l'application

### Onglets principaux
1. **📸 Galerie** - Affichage de toutes vos photos
2. **🔍 Recherche** - Recherche intelligente par IA
3. **⬆️ Upload** - Téléchargement de nouvelles photos

### Fonctionnalités disponibles
- **Upload intelligent** : Glisser-déposer de photos
- **Recherche sémantique** : "Photos de mariage en extérieur"
- **Collections** : Organisation par albums
- **Statistiques** : Métriques d'utilisation
- **Téléchargement** : Export des photos

## ⚙️ Configuration requise

### Variables d'environnement
Vérifiez que `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### Base de données
- **pgvector** doit être activé dans Supabase
- **Tables** créées avec le script SQL
- **Bucket de stockage** configuré

## 🔧 Dépannage

### Erreur "Page non trouvée"
```bash
# Vérifier que le serveur est démarré
npm run dev

# Vérifier l'URL exacte
http://localhost:3000/photo-portfolio
```

### Erreur d'authentification
```bash
# Vérifier les variables d'environnement
cat .env.local

# Vérifier la configuration Supabase
```

### Erreur de base de données
```bash
# Vérifier pgvector
# Exécuter check-pgvector-quick.sql dans Supabase

# Vérifier les tables
# Exécuter verify-installation.sql dans Supabase
```

## 📋 Checklist d'accès

- [ ] Serveur de développement démarré (`npm run dev`)
- [ ] Variables d'environnement configurées
- [ ] pgvector activé dans Supabase
- [ ] Tables créées dans Supabase
- [ ] Bucket de stockage configuré
- [ ] Authentification Supabase fonctionnelle
- [ ] Accès à `http://localhost:3000/photo-portfolio`

## 🎯 Première utilisation

### 1. Se connecter
- Cliquez sur "Se connecter avec Google" ou "Se connecter"
- Créez un compte si nécessaire

### 2. Uploader une photo
- Allez dans l'onglet "Upload"
- Glissez-déposez une photo
- Attendez l'analyse IA

### 3. Rechercher des photos
- Allez dans l'onglet "Recherche"
- Tapez : "Photos de nature" ou "Portraits"
- Découvrez la recherche intelligente !

### 4. Organiser en collections
- Créez des collections thématiques
- Ajoutez des photos aux collections
- Partagez vos collections

## 🚀 Déploiement en production

### Build de production
```bash
npm run build
npm start
```

### Configuration du domaine
- Mettre à jour les URLs dans Supabase
- Configurer le domaine dans Next.js
- Déployer sur Vercel/Netlify

---

**🎉 Votre Portfolio Photo IA est prêt à l'utilisation !**
