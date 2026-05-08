-- Ajoute le module Photo Vivante (animation photo realiste) pour IAHome.
-- Executer dans Supabase SQL Editor.

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
  'photo-vivante',
  'Photo Vivante',
  'Animation photo realiste : donnez du mouvement a une image fixe avec une interface locale rapide et un acces securise par token.',
  'AI PHOTO',
  100,
  '/card/photo-vivante',
  '/images/iaphoto.jpg',
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

SELECT id, title, category, price, url FROM modules WHERE id = 'photo-vivante';
