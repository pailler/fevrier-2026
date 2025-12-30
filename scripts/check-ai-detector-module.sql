-- Script SQL pour vérifier si le module ai-detector existe dans la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si le module existe dans la table modules
SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  is_active,
  created_at,
  updated_at
FROM modules
WHERE id = 'ai-detector'
   OR id ILIKE '%ai-detector%'
   OR title ILIKE '%détecteur%'
   OR title ILIKE '%detecteur%'
   OR title ILIKE '%ai detector%';

-- 2. Vérifier tous les modules avec "detect" ou "detector" dans le nom
SELECT 
  id,
  title,
  category,
  price,
  is_active
FROM modules
WHERE title ILIKE '%detect%'
   OR id ILIKE '%detect%'
ORDER BY created_at DESC;

-- 3. Lister tous les modules pour voir la structure
SELECT 
  id,
  title,
  category,
  price,
  is_active
FROM modules
ORDER BY created_at DESC
LIMIT 20;

