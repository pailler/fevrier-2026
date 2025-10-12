-- Script pour corriger la structure de la table user_tokens
-- Supprimer la contrainte de clé étrangère incorrecte et la recréer

-- Supprimer la contrainte de clé étrangère existante (si elle existe)
ALTER TABLE user_tokens DROP CONSTRAINT IF EXISTS user_tokens_user_id_fkey;

-- Ajouter une contrainte de clé étrangère vers la table profiles
ALTER TABLE user_tokens 
ADD CONSTRAINT user_tokens_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_tokens' 
ORDER BY ordinal_position;
