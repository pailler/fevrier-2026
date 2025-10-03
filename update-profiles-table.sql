-- Script pour mettre à jour la table profiles avec les nouveaux champs
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes manquantes à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- 2. Créer un index sur l'email pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Créer un index sur le token de vérification d'email
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token ON profiles(email_verification_token);

-- 4. Créer un index sur le token de réinitialisation de mot de passe
CREATE INDEX IF NOT EXISTS idx_profiles_password_reset_token ON profiles(password_reset_token);

-- 5. Mettre à jour les politiques RLS pour permettre l'insertion et la lecture
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable delete for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON profiles;

-- Créer des politiques plus permissives pour le développement
-- Politique pour la lecture : tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Politique pour l'insertion : tous les utilisateurs authentifiés peuvent insérer
CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Politique pour la mise à jour : les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Enable update for own profile" ON profiles
    FOR UPDATE
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Politique pour la suppression : les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Enable delete for own profile" ON profiles
    FOR DELETE
    USING (auth.uid()::text = id);

-- Politique spéciale pour le service role (pour les API routes)
CREATE POLICY "Enable all for service role" ON profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- 6. Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;



