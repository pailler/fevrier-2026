-- Script SQL pour ajouter le module voice-isolation dans la table modules
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
  'voice-isolation',
  'Isolation Vocale par IA',
  'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Basé sur Demucs v4, un modèle d''IA de pointe pour la séparation de sources audio.',
  'IA Audio',
  100,
  '/voice-isolation',
  '/images/voice-isolation.jpg',
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
