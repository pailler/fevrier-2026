-- Script pour ajouter le module Blender 3D dans la table modules
-- Ce script ajoute le module dans la base de données pour qu'il apparaisse sur le site

-- Supprimer le module s'il existe déjà (pour éviter les doublons)
DELETE FROM modules WHERE id = 'blender-3d';

-- Ajouter le module Blender 3D
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

-- Vérifier que le module a été ajouté
SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  created_at
FROM modules 
WHERE id = 'blender-3d';

-- Vérifier tous les modules disponibles
SELECT 
  id,
  title,
  category,
  price,
  url
FROM modules 
ORDER BY created_at DESC;
