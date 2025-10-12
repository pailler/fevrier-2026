-- Script SQL pour corriger la table user_tokens existante
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer la contrainte de clé étrangère existante (qui référence "users")
ALTER TABLE user_tokens DROP CONSTRAINT IF EXISTS user_tokens_user_id_fkey;

-- 2. Ajouter une nouvelle contrainte de clé étrangère qui référence "profiles"
ALTER TABLE user_tokens ADD CONSTRAINT user_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Insérer 10 tokens par défaut pour tous les utilisateurs existants
INSERT INTO user_tokens (user_id, tokens)
SELECT id, 10 FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- 4. Vérifier que la correction a fonctionné
SELECT 
    'Table user_tokens corrigée avec succès' as status,
    COUNT(*) as total_users,
    SUM(tokens) as total_tokens
FROM user_tokens;
