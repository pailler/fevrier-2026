-- Script SQL pour corriger les politiques RLS de la table profiles
-- À exécuter dans Supabase SQL Editor
-- Permet l'insertion de profils depuis les API routes (service role)

-- ==========================================
-- PARTIE 1: Vérifier l'état actuel des politiques
-- ==========================================

SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- ==========================================
-- PARTIE 2: Supprimer toutes les anciennes politiques
-- ==========================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert via trigger" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert via trigger" ON public.profiles;

-- ==========================================
-- PARTIE 3: Créer les nouvelles politiques (avec vérification)
-- ==========================================

-- Politique pour permettre l'insertion depuis le service role (API routes)
-- Cette politique permet l'insertion sans restriction pour le service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Service role can insert profiles'
  ) THEN
    CREATE POLICY "Service role can insert profiles"
      ON public.profiles
      FOR INSERT
      WITH CHECK (true);
    RAISE NOTICE '✅ Politique "Service role can insert profiles" créée';
  ELSE
    RAISE NOTICE 'ℹ️ Politique "Service role can insert profiles" existe déjà';
  END IF;
END $$;

-- Politique pour permettre la lecture par les utilisateurs de leur propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
    RAISE NOTICE '✅ Politique "Users can view own profile" créée';
  ELSE
    RAISE NOTICE 'ℹ️ Politique "Users can view own profile" existe déjà';
  END IF;
END $$;

-- Politique pour permettre la mise à jour par les utilisateurs de leur propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    RAISE NOTICE '✅ Politique "Users can update own profile" créée';
  ELSE
    RAISE NOTICE 'ℹ️ Politique "Users can update own profile" existe déjà';
  END IF;
END $$;

-- Politique pour permettre au service role de tout faire (bypass RLS)
-- Cette politique permet au service role de lire/écrire/modifier tous les profils
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access"
      ON public.profiles
      FOR ALL
      USING (true)
      WITH CHECK (true);
    RAISE NOTICE '✅ Politique "Service role full access" créée';
  ELSE
    RAISE NOTICE 'ℹ️ Politique "Service role full access" existe déjà';
  END IF;
END $$;

-- ==========================================
-- PARTIE 4: Vérifier les politiques créées
-- ==========================================

SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual IS NOT NULL AS has_using,
  with_check IS NOT NULL AS has_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS configurées pour la table profiles';
  RAISE NOTICE '📋 Le service role peut maintenant insérer des profils depuis les API routes';
END $$;

