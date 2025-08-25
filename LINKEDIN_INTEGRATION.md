# Intégration LinkedIn - Documentation

## Vue d'ensemble

L'intégration LinkedIn permet de gérer et publier automatiquement du contenu sur LinkedIn depuis la plateforme IAHome. Cette fonctionnalité est accessible via l'interface d'administration.

## Fonctionnalités

### 1. Gestion des Posts LinkedIn
- **Création de posts** : Rédigez et créez des posts LinkedIn
- **Programmation** : Planifiez la publication de vos posts
- **Statuts** : Suivez l'état de vos posts (brouillon, programmé, publié, échec)
- **Modification** : Éditez vos posts existants

### 2. Configuration des Credentials
- **Authentification** : Configurez vos tokens d'accès LinkedIn
- **Gestion des profils** : Gérez plusieurs profils LinkedIn
- **Sécurité** : Stockage sécurisé des credentials avec RLS

### 3. Analytics et Statistiques
- **Engagement** : Suivez les likes, commentaires et partages
- **Performances** : Analysez vos posts les plus performants
- **Métriques** : Vues totales et engagement moyen

## Installation

### 1. Création des Tables

Exécutez le script SQL pour créer les tables nécessaires :

```sql
-- Exécuter le fichier create-linkedin-tables.sql
```

### 2. Configuration des Permissions

Assurez-vous que l'utilisateur a le rôle 'admin' dans la table `profiles` :

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'votre_user_id';
```

## Utilisation

### Accès à l'Interface

1. Connectez-vous avec un compte administrateur
2. Naviguez vers `/admin/linkedin`
3. Ou utilisez le lien depuis la page d'administration principale

### Configuration des Credentials LinkedIn

#### Étape 1 : Créer une Application LinkedIn
1. Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Créez une nouvelle application
3. Configurez les permissions OAuth 2.0 :
   - `r:emailaddress` - Lecture de l'email
   - `w:member_social` - Publication de contenu

#### Étape 2 : Obtenir les Tokens
1. Générez un access token avec les bonnes permissions
2. Notez l'access token et le refresh token
3. Récupérez l'ID de votre profil LinkedIn

#### Étape 3 : Configuration dans l'Interface
1. Allez dans l'onglet "Configuration"
2. Cliquez sur "Ajouter des credentials"
3. Remplissez les champs :
   - Access Token
   - Refresh Token
   - ID du profil
   - Nom du profil

### Création et Gestion des Posts

#### Créer un Post
1. Allez dans l'onglet "Posts"
2. Cliquez sur "Créer un post"
3. Remplissez :
   - Titre du post
   - Contenu
   - Date de programmation (optionnel)
4. Cliquez sur "Créer"

#### Publier un Post
1. Dans la liste des posts, trouvez un post en brouillon
2. Cliquez sur "Publier"
3. Le post sera publié sur LinkedIn

#### Programmer un Post
1. Lors de la création, ajoutez une date de programmation
2. Le post sera automatiquement publié à la date/heure spécifiée

## Structure de la Base de Données

### Table `linkedin_posts`
```sql
CREATE TABLE linkedin_posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    linkedin_post_id VARCHAR(255),
    engagement_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table `linkedin_credentials`
```sql
CREATE TABLE linkedin_credentials (
    id UUID PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    profile_id VARCHAR(255) NOT NULL,
    profile_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Sécurité

### Row Level Security (RLS)
- Seuls les utilisateurs avec le rôle 'admin' peuvent accéder aux tables LinkedIn
- Les credentials sont protégés par des politiques RLS strictes

### Chiffrement des Tokens
- Les access tokens et refresh tokens sont stockés de manière sécurisée
- Utilisation de champs de type password dans l'interface

## API LinkedIn

### Endpoints Utilisés
- **Publication** : `POST /v2/ugcPosts`
- **Récupération des métriques** : `GET /v2/socialMetrics`
- **Refresh token** : `POST /oauth/v2/accessToken`

### Permissions Requises
- `r:emailaddress` - Lecture de l'email
- `w:member_social` - Publication de contenu social

## Développement

### Structure des Fichiers
```
src/app/admin/linkedin/
├── page.tsx                    # Page principale LinkedIn
└── components/                 # Composants spécifiques (si nécessaire)

create-linkedin-tables.sql      # Script de création des tables
LINKEDIN_INTEGRATION.md         # Cette documentation
```

### Composants Utilisés
- `Breadcrumb` : Navigation
- `Header` : En-tête de l'application
- Modals personnalisés pour la création/édition

### États de l'Application
- `activeTab` : Onglet actif (posts, credentials, analytics)
- `linkedinPosts` : Liste des posts
- `credentials` : Configuration des credentials
- `stats` : Statistiques calculées

## Dépannage

### Erreurs Courantes

#### "Accès refusé"
- Vérifiez que l'utilisateur a le rôle 'admin'
- Vérifiez les politiques RLS

#### "Erreur lors de la publication"
- Vérifiez que les credentials sont valides
- Vérifiez les permissions de l'application LinkedIn
- Vérifiez que l'access token n'a pas expiré

#### "Aucun credential configuré"
- Configurez vos credentials LinkedIn dans l'onglet "Configuration"

### Logs et Debug
- Les erreurs sont loggées dans la console du navigateur
- Vérifiez les logs Supabase pour les erreurs de base de données

## Évolutions Futures

### Fonctionnalités Prévues
- [ ] Intégration avec l'API LinkedIn pour publication automatique
- [ ] Gestion de plusieurs profils LinkedIn
- [ ] Templates de posts prédéfinis
- [ ] Analytics avancées avec graphiques
- [ ] Intégration avec le système de notifications
- [ ] Export des données LinkedIn

### Améliorations Techniques
- [ ] Cache des métriques d'engagement
- [ ] Système de retry pour les publications échouées
- [ ] Validation avancée des contenus
- [ ] Support des médias (images, vidéos)

## Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs d'erreur
3. Contactez l'équipe de développement

---

**Note** : Cette intégration LinkedIn est actuellement en phase de développement. Certaines fonctionnalités comme la publication automatique via l'API LinkedIn nécessitent une implémentation complète de l'intégration API.
