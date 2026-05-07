-- Enregistre le module « Vote en ligne » pour l’activation crédits / compte.
-- Exécuter dans Supabase SQL Editor après vote/supabase-schema.sql

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
  'vote',
  'Vote en ligne',
  'Création de votes avec code PIN, liste de participants, QR code et page publique. Données sur Supabase, un vote par appareil.',
  'OUTILS ÉVÉNEMENT',
  50,
  '/card/vote',
  '/iahome-logo.svg',
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

SELECT id, title, category, price, url FROM modules WHERE id = 'vote';
