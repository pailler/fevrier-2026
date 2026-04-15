-- Ajoute le module MuseTalk (lip-sync video) pour IAHome.
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
  'musetalk',
  'MuseTalk',
  'Lip-sync haute fidélité : animez une vidéo de référence avec une piste audio (doublage, avatars, marketing). Interface Gradio locale, GPU NVIDIA recommandé.',
  'AI VIDEO',
  100,
  '/card/musetalk',
  '/images/musetalk.jpg',
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

SELECT id, title, category, price, url FROM modules WHERE id = 'musetalk';
