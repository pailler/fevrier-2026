-- Script SQL pour donner les droits admin à l'utilisateur formateur_tic@hotmail.com
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- PARTIE 1: Vérifier l'utilisateur actuel
-- ==========================================

SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.profiles
WHERE email = 'formateur_tic@hotmail.com';

-- ==========================================
-- PARTIE 2: Mettre à jour le rôle à 'admin'
-- ==========================================

UPDATE public.profiles
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'formateur_tic@hotmail.com';

-- ==========================================
-- PARTIE 3: Vérifier que la mise à jour a réussi
-- ==========================================

SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  updated_at
FROM public.profiles
WHERE email = 'formateur_tic@hotmail.com';

-- Message de confirmation
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE '✅ Droits admin accordés à formateur_tic@hotmail.com';
    RAISE NOTICE '👑 Rôle mis à jour: admin';
  ELSE
    RAISE WARNING '⚠️ Aucun utilisateur trouvé avec l''email formateur_tic@hotmail.com';
    RAISE NOTICE '💡 Vérifiez que l''email est correct dans la table profiles';
  END IF;
END $$;

