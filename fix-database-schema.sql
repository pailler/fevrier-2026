-- Script de correction complète du schéma de base de données
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes manquantes pour l'authentification alternative
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token ON profiles(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_profiles_password_reset_token ON profiles(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 3. Configurer les politiques RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
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

-- Créer des politiques permissives pour le développement
CREATE POLICY "Enable read access for all users" ON profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON profiles
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON profiles
    FOR UPDATE
    USING (true);

CREATE POLICY "Enable delete for all users" ON profiles
    FOR DELETE
    USING (true);

-- Politique spéciale pour le service role
CREATE POLICY "Enable all for service role" ON profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- 4. Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;



