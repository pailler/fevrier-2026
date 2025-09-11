# 🔧 Solution : Erreur Extension Vectorielle

## ❌ Problème
```
ERROR: 42704: type "vector" does not exist
LINE 37: embedding VECTOR(1536)
```

## ✅ Solution Rapide

### Étape 1 : Activer l'extension vectorielle
1. Allez dans **Supabase Dashboard > SQL Editor**
2. Exécutez le fichier `enable-vector-extension.sql`
3. Ou copiez-collez cette commande :
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Étape 2 : Vérifier l'installation
Exécutez le fichier `check-vector-extension.sql` pour confirmer.

### Étape 3 : Créer le schéma
Maintenant vous pouvez exécuter `create-photo-portfolio-schema.sql` sans erreur.

## 📁 Fichiers de Solution

- `enable-vector-extension.sql` - Active l'extension vectorielle
- `check-vector-extension.sql` - Vérifie l'installation
- `create-photo-portfolio-schema.sql` - Script principal (mis à jour)

## 🔍 Pourquoi cette erreur ?

L'extension `vector` (pgvector) n'est pas activée par défaut dans Supabase. Elle est nécessaire pour :
- Stocker les embeddings vectoriels
- Effectuer des recherches de similarité
- Utiliser les types de données `VECTOR(1536)`

## ⚡ Solution Alternative

Si l'extension n'est pas disponible dans votre instance Supabase :

1. **Contactez le support Supabase** pour activer pgvector
2. **Ou utilisez une version récente** de Supabase (l'extension est disponible dans les versions récentes)
3. **Ou migrez vers un projet Supabase** qui supporte pgvector

## ✅ Vérification

Après activation, vous devriez voir :
```
✅ Extension vectorielle installée
✅ Type VECTOR disponible
```

---

**💡 Conseil :** Exécutez toujours `enable-vector-extension.sql` en premier !
