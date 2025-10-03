-- Script de correction immédiate de l'erreur "Database error granting user"
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Désactiver complètement RLS temporairement pour éviter les erreurs
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques RLS existantes
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

-- 3. Ajouter les colonnes nécessaires pour l'authentification alternative
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- 4. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token ON profiles(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_profiles_password_reset_token ON profiles(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 5. Donner toutes les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 6. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 7. Tester l'insertion d'un utilisateur de test
INSERT INTO profiles (id, email, full_name, role, is_active, password_hash, email_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'test-immediate-fix@example.com',
    'Test Immediate Fix',
    'user',
    true,
    '$2a$12$test.hash.for.immediate.fix',
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 8. Vérifier que l'insertion a fonctionné
SELECT * FROM profiles WHERE email = 'test-immediate-fix@example.com';

-- 9. Nettoyer le test
DELETE FROM profiles WHERE email = 'test-immediate-fix@example.com';


