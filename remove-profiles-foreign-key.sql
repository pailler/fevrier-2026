-- Script SQL pour supprimer la contrainte FOREIGN KEY de la table profiles
-- Si la contrainte empêche la création de profils comme dans le code original
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- PARTIE 1: Vérifier la contrainte actuelle
-- ==========================================

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'profiles'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'id';

-- ==========================================
-- PARTIE 2: Supprimer la contrainte FOREIGN KEY
-- ==========================================

-- Supprimer la contrainte FOREIGN KEY si elle existe
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DO $$
BEGIN
  RAISE NOTICE '✅ Contrainte FOREIGN KEY profiles_id_fkey supprimée (si elle existait)';
  RAISE NOTICE '📋 La table profiles peut maintenant être utilisée sans référence à auth.users';
  RAISE NOTICE '⚠️ Note: Les profils ne seront plus automatiquement supprimés lors de la suppression d''un utilisateur auth';
END $$;

