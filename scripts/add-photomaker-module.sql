-- Script SQL pour ajouter le module PhotoMaker dans la table modules
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
  'photomaker',
  'PhotoMaker',
  'PhotoMaker est une technologie révolutionnaire développée par Tencent ARC Lab qui permet de personnaliser des photos réalistes via Stacked ID Embedding. Créez des portraits personnalisés en quelques secondes sans entraînement LoRA supplémentaire, avec une fidélité d''identité impressionnante, diversité et contrôle textuel.',
  'AI GENERATION',
  100,
  '/card/photomaker',
  '/images/photomaker.jpg',
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
WHERE id = 'photomaker';
