# 📸 Configuration Portfolio Photo IA

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Configuration OpenAI (pour l'analyse d'images et les embeddings)
OPENAI_API_KEY=your-openai-api-key-here

# Configuration des embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Configuration du stockage des photos
SUPABASE_STORAGE_BUCKET=photo-portfolio
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/tiff

# Configuration LangChain (optionnel)
LANGCHAIN_API_KEY=your-langchain-api-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=iahome-photo-portfolio

# Configuration des modèles d'IA
VISION_MODEL=gpt-4-vision-preview
EMBEDDING_MODEL=text-embedding-3-small

# Configuration des limites
MAX_PHOTOS_PER_USER=1000
MAX_COLLECTIONS_PER_USER=50
MAX_SEARCH_RESULTS=100

# Configuration de la sécurité
ENABLE_AI_ANALYSIS=true
ENABLE_SEMANTIC_SEARCH=true
ENABLE_AUTO_TAGGING=true
```

## Configuration Supabase

### 1. Activer l'extension vectorielle (OBLIGATOIRE)
**⚠️ IMPORTANT :** Cette étape est requise avant de créer les tables.

Exécutez le fichier `enable-vector-extension.sql` dans Supabase SQL Editor.

### 2. Exécuter le script SQL principal
Exécutez le fichier `create-photo-portfolio-schema.sql` dans Supabase SQL Editor.

### 3. Créer le bucket de stockage
1. Allez dans Supabase Dashboard > Storage
2. Créez un nouveau bucket nommé `photo-portfolio`
3. Configurez les politiques RLS :

```sql
-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la lecture des photos
CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la suppression des photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Vérifier l'installation
Exécutez le fichier `check-vector-extension.sql` pour vérifier que tout est correctement installé.

## Test de l'installation

1. Démarrez le serveur de développement :
```bash
npm run dev
```

2. Accédez à `/photo-portfolio`

3. Testez l'upload d'une photo

4. Testez la recherche sémantique

## Dépannage

### Erreur "Module not found"
- Vérifiez que toutes les dépendances sont installées
- Redémarrez le serveur de développement

### Erreur "OpenAI API key not found"
- Vérifiez que `OPENAI_API_KEY` est définie dans `.env.local`
- Redémarrez le serveur

### Erreur "Bucket not found"
- Vérifiez que le bucket `photo-portfolio` existe dans Supabase
- Vérifiez les politiques RLS du bucket

### Erreur "Vector extension not found"
- Exécutez `CREATE EXTENSION IF NOT EXISTS vector;` dans Supabase

## Support

Pour toute question ou problème :
1. Consultez les logs du serveur
2. Vérifiez la console du navigateur
3. Contactez l'équipe de développement
