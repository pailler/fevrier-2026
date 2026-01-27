-- Script SQL pour ajouter le module Florence-2 dans la table modules
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
  'florence-2',
  'Florence-2',
  'Florence-2 est un modèle vision-language révolutionnaire développé par Microsoft qui permet d''exécuter plus de 10 tâches de vision par ordinateur avec un seul modèle. Entraîné sur le dataset FLD-5B (5,4 milliards d''annotations sur 126 millions d''images), Florence-2 peut effectuer du captioning, de la détection d''objets, de la segmentation, de l''OCR et bien plus encore, le tout avec un modèle compact de 0,23B ou 0,77B paramètres.',
  'AI VISION',
  100,
  '/card/florence-2',
  '/images/florence-2.jpg',
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
WHERE id = 'florence-2';
