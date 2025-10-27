# Vérifier les triggers Supabase

## Le problème
Erreur 500: "Database error granting user" se produit lors de la création d'un utilisateur après OAuth Google.

## Cause probable
Un trigger de la base de données essaie de créer un profil dans la table `profiles` et échoue.

## Solution

### 1. Vérifier les triggers dans Supabase SQL Editor

Connectez-vous à : https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr/editor

Exécutez cette requête pour voir tous les triggers :

```sql
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM 
  information_schema.triggers
WHERE 
  event_object_schema = 'public'
ORDER BY 
  trigger_name;
```

### 2. Chercher un trigger lié à auth.users

Recherchez un trigger qui :
- Se déclenche sur INSERT dans auth.users
- Essaie d'insérer dans la table profiles
- Utilise `auth.uid()` ou similaire

### 3. Options de correction

#### Option A : Désactiver temporairement le trigger
```sql
-- Trouver le trigger
-- Le désactiver temporairement pour tester
```

#### Option B : Corriger le trigger
```sql
-- Modifier le trigger pour gérer les erreurs
```

#### Option C : Créer manuellement le profil dans le callback
C'est ce que nous faisons déjà dans `/app/auth/callback/page.tsx`

## Test rapide

Essayez de créer un utilisateur via Google OAuth après avoir désactivé temporairement les triggers.

