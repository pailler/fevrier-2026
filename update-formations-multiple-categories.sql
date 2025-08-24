-- Script pour ajouter le champ categories et mettre à jour les formations
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Ajouter le champ categories à la table formation_articles
ALTER TABLE formation_articles 
ADD COLUMN IF NOT EXISTS categories TEXT;

-- 2. Mettre à jour les formations existantes avec des catégories multiples
-- Formation Assistant IA : Intelligence artificielle + Intermédiaire
UPDATE formation_articles 
SET categories = '["Intelligence artificielle", "Intermédiaire"]'
WHERE slug = 'assistant-ia';

-- Formation Impression 3D : Impression 3D + Intermédiaire
UPDATE formation_articles 
SET categories = '["Impression 3D", "Intermédiaire"]'
WHERE slug = 'impression-3d';

-- 3. Ajouter de nouvelles formations avec des catégories multiples (seulement si elles n'existent pas)
-- Formation Photographie : Photographie + Débutant
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation Photographie : Les bases de la prise de vue',
  'photographie-bases',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation Photographie</title></head><body><h1>Formation Photographie : Les bases de la prise de vue</h1><p>Découvrez les fondamentaux de la photographie et apprenez à maîtriser votre appareil photo.</p></body></html>',
  'Découvrez les fondamentaux de la photographie et apprenez à maîtriser votre appareil photo.',
  'Photographie',
  '["Photographie", "Débutant"]',
  'IAhome Team',
  15,
  NOW(),
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  'Débutant',
  '15 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'photographie-bases'
);

-- Formation Développement Web : Développement Web + Intermédiaire
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation Développement Web : Créer des sites modernes',
  'developpement-web',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation Développement Web</title></head><body><h1>Formation Développement Web : Créer des sites modernes</h1><p>Maîtrisez les technologies web modernes : HTML5, CSS3, JavaScript, React et Node.js.</p></body></html>',
  'Maîtrisez les technologies web modernes : HTML5, CSS3, JavaScript, React et Node.js.',
  'Développement Web',
  '["Développement Web", "Intermédiaire"]',
  'IAhome Team',
  20,
  NOW(),
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
  'Intermédiaire',
  '20 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'developpement-web'
);

-- Formation Logiciels : Logiciels + Avancé
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation Logiciels : Maîtriser les outils professionnels',
  'logiciels-professionnels',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation Logiciels</title></head><body><h1>Formation Logiciels : Maîtriser les outils professionnels</h1><p>Découvrez les logiciels professionnels essentiels : suite Adobe, outils de productivité, logiciels de gestion.</p></body></html>',
  'Découvrez les logiciels professionnels essentiels : suite Adobe, outils de productivité, logiciels de gestion.',
  'Logiciels',
  '["Logiciels", "Avancé"]',
  'IAhome Team',
  18,
  NOW(),
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
  'Avancé',
  '18 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'logiciels-professionnels'
);

-- Formation Assistance : Assistance + Débutant
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation Assistance : Soutien technique et relation client',
  'assistance-technique',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation Assistance</title></head><body><h1>Formation Assistance : Soutien technique et relation client</h1><p>Apprenez les fondamentaux de l''assistance technique et de la relation client.</p></body></html>',
  'Apprenez les fondamentaux de l''assistance technique et de la relation client.',
  'Assistance',
  '["Assistance", "Débutant"]',
  'IAhome Team',
  12,
  NOW(),
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
  'Débutant',
  '12 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'assistance-technique'
);

-- Formation IA Avancée : Intelligence artificielle + Avancé
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation IA Avancée : Modèles et architectures complexes',
  'ia-avancee',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation IA Avancée</title></head><body><h1>Formation IA Avancée : Modèles et architectures complexes</h1><p>Plongez dans les architectures avancées d''intelligence artificielle et les modèles complexes.</p></body></html>',
  'Plongez dans les architectures avancées d''intelligence artificielle et les modèles complexes.',
  'Intelligence artificielle',
  '["Intelligence artificielle", "Avancé"]',
  'IAhome Team',
  30,
  NOW(),
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'Avancé',
  '30 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'ia-avancee'
);

-- Formation Impression 3D Débutant : Impression 3D + Débutant
INSERT INTO formation_articles (
  title,
  slug,
  content,
  excerpt,
  category,
  categories,
  author,
  read_time,
  published_at,
  image_url,
  difficulty,
  duration,
  price,
  is_published,
  created_at,
  updated_at
) 
SELECT 
  'Formation Impression 3D : Premiers pas',
  'impression-3d-debutant',
  '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Formation Impression 3D Débutant</title></head><body><h1>Formation Impression 3D : Premiers pas</h1><p>Découvrez l''impression 3D de manière simple et accessible pour débuter.</p></body></html>',
  'Découvrez l''impression 3D de manière simple et accessible pour débuter.',
  'Impression 3D',
  '["Impression 3D", "Débutant"]',
  'IAhome Team',
  10,
  NOW(),
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
  'Débutant',
  '10 heures',
  0,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM formation_articles WHERE slug = 'impression-3d-debutant'
);

-- 4. Vérifier toutes les formations après mise à jour
SELECT 
  title,
  slug,
  category,
  categories,
  difficulty,
  duration,
  price,
  is_published
FROM formation_articles 
ORDER BY created_at DESC;
