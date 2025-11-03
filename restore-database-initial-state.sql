-- Script SQL pour restaurer l'état initial de la base de données
-- Supprime les utilisateurs/profils créés récemment et garde seulement les 3 utilisateurs initiaux + 1 admin
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- PARTIE 1: Supprimer le trigger de création automatique de profil
-- ==========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger handle_new_user supprimé';
END $$;

-- ==========================================
-- PARTIE 2: Identifier et supprimer les utilisateurs récemment créés
-- ==========================================

-- SUPPRIMER les utilisateurs créés aujourd'hui ou récemment
-- (À adapter selon la date de vos utilisateurs initiaux)
-- REMPLACEZ LA DATE ci-dessous par la date avant laquelle vos utilisateurs initiaux existaient

DO $$
DECLARE
  cutoff_date TIMESTAMPTZ := '2025-11-03 20:00:00'::TIMESTAMPTZ; -- Utilisateurs créés après cette date seront supprimés
  deleted_users_count INTEGER;
BEGIN
  -- Supprimer les utilisateurs auth créés après la date de coupure
  -- Cela supprimera aussi leurs profils grâce à ON DELETE CASCADE
  DELETE FROM auth.users
  WHERE created_at > cutoff_date;
  
  GET DIAGNOSTICS deleted_users_count = ROW_COUNT;
  RAISE NOTICE '🧹 % utilisateur(s) récent(s) supprimé(s) de auth.users', deleted_users_count;
  
  -- Supprimer les profils orphelins (au cas où)
  DELETE FROM public.profiles
  WHERE created_at > cutoff_date
    AND id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS deleted_users_count = ROW_COUNT;
  RAISE NOTICE '🧹 % profil(s) orphelin(s) supprimé(s)', deleted_users_count;
END $$;

-- ==========================================
-- PARTIE 3: Supprimer les tokens des utilisateurs supprimés
-- ==========================================

DELETE FROM public.user_tokens
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ==========================================
-- PARTIE 4: Supprimer la table user_sessions si elle existe
-- ==========================================

DROP TABLE IF EXISTS public.user_sessions CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Table user_sessions supprimée si elle existait';
END $$;

-- ==========================================
-- PARTIE 5: Vérifier l'état final
-- ==========================================

-- Compter les utilisateurs restants
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
  admin_email TEXT := 'formateur_tic@hotmail.com';
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO users_count FROM auth.users;
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 ÉTAT FINAL DE LA BASE DE DONNÉES:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '👥 Nombre d''utilisateurs auth: %', users_count;
  RAISE NOTICE '👤 Nombre de profils: %', profiles_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Utilisateurs restants:';
  
  -- Afficher la liste des utilisateurs restants
  FOR rec IN 
    SELECT u.id, u.email, u.created_at, p.role
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    ORDER BY u.created_at
  LOOP
    IF rec.email = admin_email THEN
      RAISE NOTICE '   👑 Admin: % (créé le %)', rec.email, rec.created_at;
    ELSE
      RAISE NOTICE '   👤 User: % (créé le %)', rec.email, rec.created_at;
    END IF;
  END LOOP;
END $$;

-- ==========================================
-- INSTRUCTIONS IMPORTANTES
-- ==========================================

-- ⚠️ AVANT D'EXÉCUTER CE SCRIPT:
-- 1. Remplacez '2025-01-01 00:00:00' par la date réelle avant laquelle vos 3 utilisateurs initiaux + admin existaient
-- 2. OU modifiez la logique pour supprimer seulement les utilisateurs spécifiques que vous voulez enlever
-- 3. Vérifiez d'abord quels utilisateurs seront supprimés avec cette requête:
--    SELECT email, created_at FROM auth.users ORDER BY created_at;

-- Pour voir tous les utilisateurs avant suppression:
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' AS full_name
FROM auth.users
ORDER BY created_at;

