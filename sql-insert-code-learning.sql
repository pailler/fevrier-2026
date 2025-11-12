-- SQL pour ajouter le module Code Learning dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Option 1: INSERT simple (si le module n'existe pas)
INSERT INTO modules (
  id,
  title,
  description,
  subtitle,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
) VALUES (
  'code-learning',
  'Apprendre le Code',
  'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans !',
  'Apprentissage du code pour enfants',
  'ÉDUCATION',
  10,
  '/code-learning',
  '/images/code-learning.jpg',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subtitle = EXCLUDED.subtitle,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Option 2: INSERT avec vérification préalable (alternative)
-- D'abord vérifier si le module existe
-- SELECT * FROM modules WHERE id = 'code-learning';

-- Si le module n'existe pas, exécuter :
INSERT INTO modules (
  id,
  title,
  description,
  subtitle,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
) VALUES (
  'code-learning',
  'Apprendre le Code',
  'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans !',
  'Apprentissage du code pour enfants',
  'ÉDUCATION',
  10,
  '/code-learning',
  '/images/code-learning.jpg',
  NOW(),
  NOW()
)
WHERE NOT EXISTS (
  SELECT 1 FROM modules WHERE id = 'code-learning'
);

-- Option 3: UPDATE si le module existe déjà
UPDATE modules
SET
  title = 'Apprendre le Code',
  description = 'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans !',
  subtitle = 'Apprentissage du code pour enfants',
  category = 'ÉDUCATION',
  price = 10,
  url = '/code-learning',
  image_url = '/images/code-learning.jpg',
  updated_at = NOW()
WHERE id = 'code-learning';


