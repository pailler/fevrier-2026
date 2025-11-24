# Workflow Automatique LinkedIn

Ce document décrit le système d'automatisation pour partager automatiquement les nouveaux articles et formations sur LinkedIn.

## 📋 Vue d'ensemble

Le système crée automatiquement un post LinkedIn dans la base de données chaque fois qu'un nouvel article de blog ou une nouvelle formation est publié. Les posts peuvent ensuite être publiés manuellement ou automatiquement via l'API LinkedIn.

## 🏗️ Architecture

### Tables de base de données

Le système utilise 3 tables LinkedIn existantes :

1. **`linkedin_posts`** : Stocke les posts LinkedIn créés
   - `id` : Identifiant unique
   - `title` : Titre du post
   - `content` : Contenu du post (généré automatiquement)
   - `url` : URL de l'article/formation
   - `image_url` : Image associée (optionnel)
   - `type` : 'blog' ou 'formation'
   - `source_id` : ID de l'article ou de la formation source
   - `is_published` : Statut de publication
   - `published_at` : Date de publication
   - `linkedin_post_id` : ID du post sur LinkedIn (après publication)
   - `engagement` : Engagement total
   - `created_at` : Date de création

2. **`linkedin_config`** : Configuration LinkedIn
   - `access_token` : Token d'accès LinkedIn API
   - `linkedin_person_id` : ID de la personne LinkedIn
   - `is_active` : Configuration active ou non

3. **`linkedin_analytics`** : Statistiques des posts
   - `post_id` : Référence au post
   - `linkedin_post_id` : ID LinkedIn du post
   - `views`, `likes`, `comments`, `shares` : Métriques
   - `engagement` : Engagement total

## 🚀 Utilisation

### 1. Création automatique de posts

#### Articles de blog

Lors de la création d'un article via `/api/insert-blog-article`, un post LinkedIn est automatiquement créé si l'article est publié (`status: 'published'`).

```typescript
POST /api/insert-blog-article
{
  "title": "Mon nouvel article",
  "content": "...",
  "excerpt": "...",
  "status": "published"  // ← Important : doit être "published"
}
```

#### Articles de formation

Lors de la création d'une formation via `/api/insert-formation-article`, un post LinkedIn est automatiquement créé si la formation est publiée (`is_published: true`).

```typescript
POST /api/insert-formation-article
{
  "title": "Ma nouvelle formation",
  "content": "...",
  "excerpt": "...",
  "is_published": true  // ← Important : doit être true
}
```

### 2. Gestion des posts LinkedIn

#### Lister les posts

```typescript
GET /api/linkedin/posts?status=pending&limit=10&offset=0
```

Paramètres :
- `status` : `all` | `published` | `pending` (défaut: `all`)
- `limit` : Nombre de résultats (défaut: 50)
- `offset` : Offset pour la pagination (défaut: 0)

#### Publier un post spécifique

```typescript
POST /api/linkedin/publish
{
  "postId": "uuid-du-post",
  "autoPublish": false  // Optionnel
}
```

#### Publier tous les posts en attente

```typescript
POST /api/linkedin/publish-all
{
  "autoPublish": false  // Optionnel
}
```

#### Récupérer les informations d'un post

```typescript
GET /api/linkedin/publish?postId=uuid-du-post
```

## 🔧 Configuration LinkedIn API

Pour activer la publication automatique sur LinkedIn, vous devez configurer l'API LinkedIn :

1. **Créer une application LinkedIn** :
   - Aller sur [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Créer une nouvelle application
   - Obtenir les credentials (Client ID, Client Secret)

2. **Configurer OAuth** :
   - Configurer les redirect URIs
   - Obtenir un access token avec les permissions nécessaires :
     - `w_member_social` : Pour publier des posts

3. **Mettre à jour la table `linkedin_config`** :
   ```sql
   INSERT INTO linkedin_config (
     access_token,
     linkedin_person_id,
     is_active
   ) VALUES (
     'votre-access-token',
     'votre-person-id',
     true
   );
   ```

## 📝 Format des posts LinkedIn

Les posts sont générés automatiquement avec le format suivant :

```
🎓 Nouveau formation disponible !

📌 [Titre de la formation]

[Extrait de 200 caractères max...]

🔗 Découvrez-en plus : https://iahome.fr/formation/[slug]

#IA #IntelligenceArtificielle #Tech #Formation #Apprentissage
```

Pour les articles de blog, l'emoji est 📝 et le hashtag final est `#Blog` au lieu de `#Apprentissage`.

## 🔄 Workflow complet

1. **Création d'un article/formation** → Post LinkedIn créé automatiquement dans `linkedin_posts` avec `is_published: false`
2. **Publication manuelle ou automatique** → Appel à `/api/linkedin/publish` ou `/api/linkedin/publish-all`
3. **Si configuré** → Publication via l'API LinkedIn
4. **Suivi** → Analytics enregistrés dans `linkedin_analytics`

## 🛠️ Fonctions utilitaires

### `createLinkedInPost(data)`

Crée un post LinkedIn dans la base de données.

```typescript
import { createLinkedInPost } from '@/utils/linkedinHelper';

const result = await createLinkedInPost({
  title: "Mon article",
  content: "...",
  excerpt: "...",
  url: "/blog/mon-article",
  image_url: "https://...",
  type: "blog",
  source_id: "article-id"
});
```

### `publishLinkedInPost(postId)`

Publie un post LinkedIn (marque comme publié et crée les analytics).

```typescript
import { publishLinkedInPost } from '@/utils/linkedinHelper';

const result = await publishLinkedInPost("post-id");
```

### `generateLinkedInContent(data)`

Génère le contenu d'un post LinkedIn à partir des données.

```typescript
import { generateLinkedInContent } from '@/utils/linkedinHelper';

const content = generateLinkedInContent({
  title: "Mon article",
  excerpt: "...",
  url: "/blog/mon-article",
  type: "blog"
});
```

## 📊 Monitoring

Les statistiques sont disponibles via :
- La table `linkedin_analytics` pour les métriques détaillées
- L'API `/api/admin/statistics` pour les statistiques globales

## ⚠️ Notes importantes

1. **Publication automatique** : Par défaut, les posts sont créés avec `is_published: false` pour permettre une révision avant publication.

2. **Gestion des erreurs** : Si la création du post LinkedIn échoue, l'insertion de l'article/formation n'est pas affectée.

3. **Configuration requise** : Pour publier réellement sur LinkedIn, la configuration dans `linkedin_config` est nécessaire.

4. **Rate limiting** : LinkedIn a des limites de taux. Assurez-vous de ne pas publier trop de posts en peu de temps.

## 🔐 Sécurité

- Les tokens LinkedIn doivent être stockés de manière sécurisée
- Utilisez des variables d'environnement pour les credentials sensibles
- Implémentez une rotation régulière des tokens d'accès

## 📚 Ressources

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)





