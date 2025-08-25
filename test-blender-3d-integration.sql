-- Script de test pour vérifier l'intégration complète du module Blender 3D
-- Exécutez ce script après avoir configuré le module

-- 1. Vérifier que le module existe dans la table modules
SELECT 
  '✅ Module dans la table modules:' as status,
  id,
  title,
  category,
  price,
  url
FROM modules 
WHERE id = 'blender-3d';

-- 2. Vérifier les accès utilisateurs au module
SELECT 
  '✅ Accès utilisateurs:' as status,
  ua.user_id,
  u.email,
  ua.module_id,
  ua.module_title,
  ua.is_active,
  ua.access_level
FROM user_applications ua
JOIN auth.users u ON ua.user_id = u.id
WHERE ua.module_id = 'blender-3d'
ORDER BY ua.created_at DESC;

-- 3. Vérifier que le module apparaît dans la liste des modules
SELECT 
  '✅ Tous les modules disponibles:' as status,
  id,
  title,
  category,
  price,
  url
FROM modules 
ORDER BY created_at DESC;

-- 4. Compter le nombre total de modules
SELECT 
  '📊 Statistiques:' as info,
  COUNT(*) as total_modules,
  COUNT(CASE WHEN category = '3D GENERATION' THEN 1 END) as modules_3d
FROM modules;

-- 5. Vérifier les modules par catégorie
SELECT 
  '📋 Modules par catégorie:' as info,
  category,
  COUNT(*) as count,
  STRING_AGG(title, ', ') as modules
FROM modules 
GROUP BY category
ORDER BY count DESC;

