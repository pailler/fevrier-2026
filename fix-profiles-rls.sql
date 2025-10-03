-- Script pour corriger les politiques RLS de la table profiles
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Activer RLS sur la table profiles si ce n'est pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 3. Créer les nouvelles politiques RLS

-- Politique pour la lecture : les utilisateurs peuvent voir leur propre profil
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (auth.uid()::text = id);

-- Politique pour l'insertion : les utilisateurs peuvent créer leur propre profil
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid()::text = id);

-- Politique pour la mise à jour : les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Politique pour la suppression : les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (auth.uid()::text = id);

-- 4. Politique spéciale pour le service role (pour les API routes)
CREATE POLICY "profiles_service_role_policy" ON profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- 5. Vérifier que la table a bien les bonnes colonnes
-- (Cette requête ne fait que vérifier, elle ne modifie rien)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Créer un index sur l'email pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 7. Créer un index sur l'id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);


