# 🔧 Configuration pgvector pour Portfolio Photo IA

## ⚠️ CRITIQUE : L'extension pgvector est OBLIGATOIRE !

L'extension **pgvector** est essentielle pour le fonctionnement de la recherche sémantique. Sans elle, l'application ne peut pas fonctionner.

## 🚀 Vérification rapide

### 1. Vérifier si pgvector est disponible
Exécutez ce script dans **Supabase SQL Editor** :

```sql
-- Vérifier si pgvector est disponible
SELECT * FROM pg_available_extensions WHERE name = 'vector';
```

**Résultat attendu :**
- Si `vector` apparaît dans la liste → ✅ pgvector est disponible
- Si la liste est vide → ❌ pgvector n'est pas disponible

### 2. Vérifier si pgvector est déjà installé
```sql
-- Vérifier si pgvector est installé
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Résultat attendu :**
- Si `vector` apparaît → ✅ pgvector est déjà installé
- Si la liste est vide → pgvector n'est pas installé

## 🔧 Installation de pgvector

### Option 1 : Installation automatique (recommandée)
Le script `create-photo-portfolio-complete.sql` installe automatiquement pgvector :

```sql
-- Cette ligne est incluse dans le script complet
CREATE EXTENSION IF NOT EXISTS vector;
```

### Option 2 : Installation manuelle
Si l'installation automatique échoue :

```sql
-- Installer pgvector manuellement
CREATE EXTENSION vector;

-- Vérifier l'installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## ❌ pgvector non disponible ?

### Solutions possibles :

#### 1. Mettre à jour Supabase
- Les versions récentes de Supabase incluent pgvector
- Vérifiez votre version dans le dashboard Supabase

#### 2. Contacter le support Supabase
- Ouvrir un ticket de support
- Demander l'activation de pgvector
- Fournir l'ID de votre projet

#### 3. Utiliser une instance Supabase récente
- Créer un nouveau projet Supabase
- pgvector est activé par défaut sur les nouveaux projets

## ✅ Test de fonctionnement

### Script de test complet
```sql
-- Test complet de pgvector
DO $$
BEGIN
    -- Vérifier l'extension
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION '❌ Extension pgvector non installée !';
    END IF;
    
    -- Tester la création d'un vecteur
    CREATE TEMP TABLE test_vector (
        id SERIAL PRIMARY KEY,
        embedding VECTOR(3)
    );
    
    -- Insérer un vecteur de test
    INSERT INTO test_vector (embedding) VALUES ('[1,2,3]');
    
    -- Tester la recherche par similarité
    SELECT id, embedding, embedding <-> '[1,2,3]' as distance
    FROM test_vector
    ORDER BY embedding <-> '[1,2,3]';
    
    RAISE NOTICE '✅ pgvector fonctionne correctement !';
    
    -- Nettoyer
    DROP TABLE test_vector;
    
END $$;
```

## 🔍 Dépannage

### Erreur : "type 'vector' does not exist"
```sql
-- Solution : Installer pgvector
CREATE EXTENSION vector;
```

### Erreur : "extension 'vector' does not exist"
```sql
-- Vérifier la disponibilité
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Si vide, contacter le support Supabase
```

### Erreur : "permission denied for schema public"
```sql
-- Vérifier les permissions
SELECT current_user, session_user;

-- Utiliser un compte administrateur
```

## 📊 Vérification finale

### Script de vérification complète
```sql
-- Vérification complète de pgvector
SELECT 
    'Extension installée' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
        THEN '✅ OUI'
        ELSE '❌ NON'
    END as result
UNION ALL
SELECT 
    'Version disponible' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector')
        THEN '✅ OUI'
        ELSE '❌ NON'
    END as result
UNION ALL
SELECT 
    'Fonctionnalités vectorielles' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'vector_dims')
        THEN '✅ OUI'
        ELSE '❌ NON'
    END as result;
```

## 🎯 Prochaines étapes

Une fois pgvector installé et fonctionnel :

1. ✅ Exécuter `create-photo-portfolio-complete.sql`
2. ✅ Vérifier avec `verify-installation.sql`
3. ✅ Configurer les variables d'environnement
4. ✅ Démarrer l'application

---

**⚠️ IMPORTANT : Sans pgvector, l'application ne peut pas fonctionner !**
