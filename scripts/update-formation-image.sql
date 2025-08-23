-- Script pour mettre à jour l'image de l'article "assistant-ia"
-- Exécuté le: 2025-08-23 22:40:00

-- 1. Vérifier l'image actuelle
SELECT 
    id,
    title,
    slug,
    image_url
FROM formation_articles 
WHERE slug = 'assistant-ia';

-- 2. Mettre à jour l'image avec une image locale
UPDATE formation_articles 
SET image_url = '/images/iaphoto.jpg'
WHERE slug = 'assistant-ia';

-- 3. Vérification finale
SELECT 
    id,
    title,
    slug,
    image_url,
    is_published
FROM formation_articles 
WHERE slug = 'assistant-ia';

-- 4. Afficher tous les articles de formation pour vérification
SELECT 
    id,
    title,
    slug,
    image_url,
    is_published,
    category,
    author,
    read_time,
    published_at
FROM formation_articles 
ORDER BY published_at DESC;
