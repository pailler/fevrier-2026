-- Script pour vérifier la structure de la table modules
-- Exécutez ce script dans Supabase pour voir les colonnes disponibles

-- 1. Vérifier la structure de la table modules
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- 2. Voir un exemple de module existant
SELECT * FROM modules LIMIT 1;

-- 3. Voir tous les modules existants
SELECT 
  id,
  title,
  description,
  category,
  price,
  youtube_url,
  url,
  created_at,
  updated_at
FROM modules 
ORDER BY created_at DESC;

