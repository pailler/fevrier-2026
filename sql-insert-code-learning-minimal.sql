-- Version minimale - Colonnes essentielles uniquement
-- À exécuter dans Supabase SQL Editor

INSERT INTO modules (
  id,
  title,
  description,
  category,
  price,
  url
) VALUES (
  'code-learning',
  'Apprendre le Code',
  'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans !',
  'ÉDUCATION',
  10,
  '/code-learning'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  url = EXCLUDED.url;





