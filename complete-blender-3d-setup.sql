-- Script complet pour configurer le module Blender 3D
-- Ce script ajoute le module dans la base de données et configure l'accès utilisateur

-- 1. Ajouter le module Blender 3D dans la table modules
-- Supprimer le module s'il existe déjà (pour éviter les doublons)
DELETE FROM modules WHERE id = 'blender-3d';

INSERT INTO modules (
  id,
  title,
  description,
  category,
  price,
  youtube_url,
  url,
  created_at,
  updated_at
) VALUES (
  'blender-3d',
  'Générateur 3D Blender',
  'Créez des objets 3D complexes à partir de descriptions textuelles avec l''intelligence artificielle et Blender. Utilisez le protocole MCP pour une communication intelligente entre l''IA et Blender.',
  '3D GENERATION',
  19.99,
  'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1',
  '/card/blender-3d',
  NOW(),
  NOW()
);

-- 2. Ajouter l'accès au module pour l'utilisateur
-- D'abord, trouvez votre user_id
SELECT id, email FROM auth.users WHERE email = 'formateur_tic@hotmail.com';

-- Ensuite, ajoutez l'accès (remplacez 'votre_user_id' par l'ID trouvé ci-dessus)
-- Supprimer l'accès existant s'il y en a un
DELETE FROM user_applications WHERE user_id = 'votre_user_id' AND module_id = 'blender-3d';

INSERT INTO user_applications (
  user_id,
  module_id,
  module_title,
  is_active,
  access_level,
  usage_count,
  max_usage,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'votre_user_id', -- Remplacez par votre user_id
  'blender-3d',
  'Générateur 3D Blender',
  true,
  'paid',
  0,
  100,
  '2025-12-31 23:59:59',
  NOW(),
  NOW()
);

-- 3. Vérifications

-- Vérifier que le module a été ajouté
SELECT 
  'Module ajouté:' as info,
  id,
  title,
  category,
  price,
  url
FROM modules 
WHERE id = 'blender-3d';

-- Vérifier l'accès utilisateur
SELECT 
  'Accès utilisateur:' as info,
  ua.module_id,
  ua.module_title,
  ua.is_active,
  ua.access_level,
  u.email
FROM user_applications ua
JOIN auth.users u ON ua.user_id = u.id
WHERE ua.module_id = 'blender-3d'
ORDER BY ua.created_at DESC;

-- Vérifier tous les modules disponibles
SELECT 
  'Tous les modules:' as info,
  id,
  title,
  category,
  price
FROM modules 
ORDER BY created_at DESC;
