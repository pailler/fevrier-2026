-- Script SQL pour ajouter le module BiRefNet dans la table modules
-- À exécuter dans Supabase SQL Editor ou via l'interface admin

INSERT INTO modules (
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
) VALUES (
  'birefnet',
  'BiRefNet',
  'BiRefNet est un modèle de segmentation d''images dichotomique haute résolution (High-Resolution Dichotomous Image Segmentation) développé par Peng Zheng et son équipe. Ce modèle permet de séparer efficacement le premier plan du fond dans les images avec une précision exceptionnelle. BiRefNet a atteint des performances SOTA (State of the Art) sur plusieurs tâches : DIS (Dichotomous Image Segmentation), COD (Camouflaged Object Detection), et HRSOD (High-Resolution Salient Object Detection).',
  'AI VISION',
  100,
  '/card/birefnet',
  '/images/birefnet.jpg',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Vérifier que l'insertion a réussi
SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
FROM modules
WHERE id = 'birefnet';
