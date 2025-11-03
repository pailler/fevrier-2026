-- Script SQL SIMPLE pour restaurer l'état initial de la base de données
-- Supprime les utilisateurs/profils créés récemment
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- ÉTAPE 1: Voir d'abord quels utilisateurs existent
-- ==========================================
-- Exécutez d'abord cette requête pour voir tous les utilisateurs:
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' AS full_name
FROM auth.users
ORDER BY created_at;

-- ==========================================
-- ÉTAPE 2: Supprimer le trigger si créé
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger handle_new_user supprimé';
END $$;

-- ==========================================
-- ÉTAPE 3: Supprimer la table user_sessions si créée
-- ==========================================
DROP TABLE IF EXISTS public.user_sessions CASCADE;

-- ==========================================
-- ÉTAPE 4: Supprimer les utilisateurs récents (ADAPTEZ LA DATE CI-DESSOUS)
-- ==========================================
-- ⚠️ IMPORTANT: Remplacez la date ci-dessous par la date avant laquelle vos 4 utilisateurs initiaux existaient
-- Exemple: Si vos 3 users + admin existaient avant le 1er janvier 2025, mettez '2025-01-01'

DELETE FROM auth.users
WHERE created_at > '2025-11-03 20:00:00'::TIMESTAMPTZ;
-- ↑ MODIFIEZ CETTE DATE selon vos besoins

-- Les profils seront supprimés automatiquement grâce à ON DELETE CASCADE

-- ==========================================
-- ÉTAPE 5: Nettoyer les tokens orphelins
-- ==========================================
DELETE FROM public.user_tokens
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ==========================================
-- ÉTAPE 6: Vérifier l'état final
-- ==========================================
SELECT 
  COUNT(*) AS total_users_count,
  'Utilisateurs restants' AS description
FROM auth.users;

-- Afficher les utilisateurs restants
SELECT 
  email,
  created_at,
  (SELECT role FROM public.profiles WHERE profiles.id = auth.users.id) AS role
FROM auth.users
ORDER BY created_at;

