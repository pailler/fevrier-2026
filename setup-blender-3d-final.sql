-- Script final pour configurer le module Blender 3D
-- Exécutez ce script dans Supabase

-- 1. Trouver votre user_id
SELECT 'Votre user_id:' as info, id, email FROM auth.users WHERE email = 'formateur_tic@hotmail.com';

-- 2. Ajouter le module Blender 3D
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

-- 3. Ajouter l'accès utilisateur (remplacez 'VOTRE_USER_ID' par l'ID trouvé à l'étape 1)
-- Exemple: si votre user_id est 'abc123', remplacez 'VOTRE_USER_ID' par 'abc123'
DELETE FROM user_applications WHERE user_id = 'VOTRE_USER_ID' AND module_id = 'blender-3d';

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
  'VOTRE_USER_ID', -- Remplacez par votre vrai user_id
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

-- 4. Vérifications
SELECT '✅ Module ajouté:' as status, id, title, category, price FROM modules WHERE id = 'blender-3d';
SELECT '✅ Accès utilisateur:' as status, ua.module_id, ua.module_title, ua.is_active, u.email 
FROM user_applications ua 
JOIN auth.users u ON ua.user_id = u.id 
WHERE ua.module_id = 'blender-3d';
SELECT '✅ Tous les modules:' as status, id, title, category, price FROM modules ORDER BY created_at DESC;

