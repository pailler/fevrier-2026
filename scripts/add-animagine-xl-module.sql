-- Script SQL pour ajouter le module Animagine XL dans la table modules
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
  'animagine-xl',
  'Animagine XL',
  'Animagine XL 3.1 est un modèle Stable Diffusion XL super-optimisé pour la génération d''images de type anime et manga. Développé par Cagliostro Research Lab, ce modèle a été entraîné avec plus de 1,25 million d''images et 500+ heures d''entraînement. Il connaît près de 5000 personnages d''anime et peut générer des images de haute qualité sans nécessiter de LoRA supplémentaires.',
  'AI GENERATION',
  100,
  '/card/animagine-xl',
  '/images/animagine-xl.jpg',
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
WHERE id = 'animagine-xl';
