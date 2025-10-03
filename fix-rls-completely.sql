-- Script de correction complète des politiques RLS
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Désactiver complètement RLS sur profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticat0ed users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable delete for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON profiles;

-- 3. Donner TOUTES les permissions nécessaires
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Vérifier que la table profiles existe et a la bonne structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Tester l'insertion directe
INSERT INTO profiles (id, email, full_name, role, is_active, email_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'test-rls-fix@example.com',
    'Test RLS Fix',
    'user',
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 6. Vérifier l'insertion
SELECT * FROM profiles WHERE email = 'test-rls-fix@example.com';

-- 7. Nettoyer le test
DELETE FROM profiles WHERE email = 'test-rls-fix@example.com';

-- 8. Vérifier les permissions sur auth.users
SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 9. Vérifier que les triggers existent
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth';


