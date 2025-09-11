# 🔧 Guide de Dépannage - Portfolio Photo IA

## Erreur : Extension vectorielle manquante

### ❌ Erreur
```
ERROR: 42704: type "vector" does not exist
LINE 37: embedding VECTOR(1536)
```

### ✅ Solution

#### Option 1 : Exécuter le script d'activation
1. Allez dans Supabase Dashboard > SQL Editor
2. Exécutez le fichier `enable-vector-extension.sql`
3. Puis exécutez `create-photo-portfolio-schema.sql`

#### Option 2 : Activation manuelle
1. Allez dans Supabase Dashboard > SQL Editor
2. Exécutez cette commande :
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
3. Vérifiez l'installation :
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

#### Option 3 : Via l'interface Supabase
1. Allez dans Supabase Dashboard > Database > Extensions
2. Recherchez "vector"
3. Cliquez sur "Enable"

## Autres erreurs courantes

### Erreur : Bucket de stockage non trouvé
```
Error: Bucket 'photo-portfolio' not found
```

**Solution :**
1. Allez dans Supabase Dashboard > Storage
2. Cliquez sur "New bucket"
3. Nom : `photo-portfolio`
4. Public : Non (recommandé)
5. File size limit : 50MB
6. Allowed MIME types : `image/*`

### Erreur : Politiques RLS manquantes
```
Error: new row violates row-level security policy
```

**Solution :**
Exécutez ces politiques dans Supabase SQL Editor :
```sql
-- Politiques pour le bucket de stockage
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photo-portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Erreur : Clé API OpenAI manquante
```
Error: OpenAI API key not found
```

**Solution :**
1. Ajoutez à votre `.env.local` :
```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```
2. Redémarrez le serveur de développement

### Erreur : Permissions insuffisantes
```
Error: insufficient_privilege
```

**Solution :**
1. Vérifiez que vous êtes connecté en tant qu'administrateur
2. Ou utilisez la clé de service Supabase :
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Vérification de l'installation

### Test 1 : Extension vectorielle
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Test 2 : Tables créées
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'photo_%';
```

### Test 3 : Bucket de stockage
```sql
SELECT name FROM storage.buckets WHERE name = 'photo-portfolio';
```

### Test 4 : Fonctions SQL
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%photo%';
```

## Logs utiles

### Logs du serveur Next.js
```bash
npm run dev
# Regardez les erreurs dans la console
```

### Logs Supabase
1. Allez dans Supabase Dashboard > Logs
2. Filtrez par "Database" ou "Storage"
3. Recherchez les erreurs liées aux photos

### Logs du navigateur
1. Ouvrez les outils de développement (F12)
2. Onglet "Console"
3. Recherchez les erreurs JavaScript

## Support

Si le problème persiste :
1. Vérifiez la version de Supabase (doit être récente)
2. Contactez le support Supabase si l'extension vectorielle n'est pas disponible
3. Consultez la documentation officielle : https://supabase.com/docs/guides/database/extensions

---

**💡 Conseil :** Exécutez toujours `enable-vector-extension.sql` avant `create-photo-portfolio-schema.sql` pour éviter cette erreur.
