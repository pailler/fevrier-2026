-- Script pour vérifier et corriger les images des formations
-- Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- 1. Vérifier les formations existantes et leurs images
SELECT 
    id,
    title,
    slug,
    image_url,
    CASE 
        WHEN image_url IS NULL OR image_url = '' THEN '❌ Pas d\'image'
        ELSE '✅ Image présente'
    END as image_status
FROM formation_articles
ORDER BY published_at DESC;

-- 2. Ajouter une image par défaut pour les formations sans image
UPDATE formation_articles 
SET image_url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center'
WHERE image_url IS NULL OR image_url = '';

-- 3. Vérifier spécifiquement l'article "assistant-ia"
SELECT 
    id,
    title,
    slug,
    image_url,
    content,
    excerpt
FROM formation_articles 
WHERE slug = 'assistant-ia';

-- 4. Si l'article "assistant-ia" n'existe pas, le créer
INSERT INTO formation_articles (
    title,
    slug,
    content,
    excerpt,
    category,
    author,
    read_time,
    published_at,
    image_url,
    difficulty,
    duration,
    price,
    is_published
) 
SELECT 
    'Assistant IA : Guide Complet',
    'assistant-ia',
    '<h2>Introduction à l''Assistant IA</h2><p>Découvrez comment utiliser efficacement les assistants IA pour améliorer votre productivité...</p>',
    'Maîtrisez l''utilisation des assistants IA pour optimiser votre workflow et augmenter votre productivité.',
    'ia',
    'Équipe IAHome',
    15,
    NOW(),
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
    'Débutant',
    '2 heures',
    0,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM formation_articles WHERE slug = 'assistant-ia'
);

-- 5. Vérification finale
SELECT 
    COUNT(*) as total_formations,
    COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as formations_avec_images,
    COUNT(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 END) as formations_sans_images
FROM formation_articles;
