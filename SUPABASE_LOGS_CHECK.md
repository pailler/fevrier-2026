# Vérifier les logs Supabase

## Le problème
Erreur 500: "Database error granting user" lors de la connexion Google.

## À vérifier dans Supabase

### 1. Logs d'authentification
Allez dans https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr/logs/explorer

Cherchez les logs avec le type "auth" qui montrent l'erreur exacte.

### 2. Vérifier la table profiles
Dans le SQL Editor, exécutez :
```sql
SELECT * FROM profiles LIMIT 5;
```

### 3. Structure de la table profiles
```sql
\d profiles
```

### 4. Vérifier les contraintes
```sql
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    a.attname AS column_name
FROM 
    pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey)
    JOIN pg_class t ON t.oid = c.conrelid
WHERE 
    t.relname = 'profiles';
```

## Cause probable

Si la table `profiles` a des contraintes NOT NULL sur des colonnes qui ne sont pas fournies automatiquement lors de la création via OAuth, cela peut causer l'erreur.

## Solution

Montrez-moi la structure de la table `profiles` et ses contraintes pour que je puisse corriger le problème.

