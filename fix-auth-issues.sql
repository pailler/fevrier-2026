-- Script de correction des problèmes d'authentification Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier et corriger les politiques RLS de la table profiles
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

-- 2. Vérifier que la table auth.users existe et est accessible
-- Cette requête ne fait que vérifier, elle ne modifie rien
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 3. Créer un trigger pour synchroniser automatiquement les profils
-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer la fonction de gestion des nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Vérifier les permissions sur la table profiles
-- Cette requête montre les permissions actuelles
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'profiles';

-- 6. Donner les permissions nécessaires au rôle authenticated
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Vérifier que la fonction est bien créée
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';



