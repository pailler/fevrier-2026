-- Script SQL pour ajouter le module Détecteur de Contenu IA dans la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier si le module existe déjà et l'insérer s'il n'existe pas
INSERT INTO modules (
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
)
VALUES (
  'ai-detector',
  'Détecteur de Contenu IA',
  'Analysez vos documents texte, PDF, DOCX et images pour détecter la proportion de contenu généré par l''intelligence artificielle. Détection précise avec scores détaillés et analyse phrase par phrase.',
  'OUTILS IA',
  100,
  '/ai-detector',
  '/images/ai-detector.jpg',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier que l'insertion a réussi
SELECT 
  id,
  title,
  category,
  price,
  url,
  is_active,
  created_at
FROM modules
WHERE id = 'ai-detector';

