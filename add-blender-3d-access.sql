-- Script pour ajouter l'accès au module Blender 3D
-- Remplacez 'votre_user_id' par l'ID de votre utilisateur

-- Vérifier si l'utilisateur existe
SELECT id, email FROM auth.users WHERE email = 'votre_email@example.com';

-- Ajouter l'accès au module blender-3d
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
) ON CONFLICT (user_id, module_id) 
DO UPDATE SET 
  is_active = true,
  access_level = 'paid',
  max_usage = 100,
  expires_at = '2025-12-31 23:59:59',
  updated_at = NOW();

-- Vérifier que l'accès a été ajouté
SELECT 
  ua.*,
  u.email
FROM user_applications ua
JOIN auth.users u ON ua.user_id = u.id
WHERE ua.module_id = 'blender-3d'
ORDER BY ua.created_at DESC;
