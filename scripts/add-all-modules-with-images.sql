-- Script pour ajouter tous les modules avec leurs images JPG appropriées
-- Ce script élimine les zones noires en utilisant des images JPG simples

-- 1. Ajouter le module Librespeed
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'Librespeed',
    'Testez votre connexion en toute liberté – sans pub, sans pistage!',
    'WEB TOOLS',
    0.00,
    '/images/librespeed.jpg',
    '/api/proxy-librespeed'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Ajouter le module PDF+ (mise à jour avec image JPG)
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'PDF+',
    'Un seul outil pour signer, modifier, convertir et sécuriser vos PDF',
    'WEB TOOLS',
    0.00,
    '/images/pdf-plus.jpg',
    '/api/proxy-pdf'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Ajouter le module Metube (mise à jour avec image JPG)
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'Metube',
    'Téléchargement de vidéos YouTube et autres plateformes',
    'WEB TOOLS',
    0.00,
    '/images/iatube.jpg',
    '/api/proxy-metube'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Ajouter le module PSitransfer
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'PSitransfer',
    'Transfert de fichiers sécurisé et simple',
    'WEB TOOLS',
    0.00,
    '/images/psitransfer.jpg',
    '/api/proxy-psitransfer'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Ajouter le module Stable Diffusion (IA Photo)
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'Stable Diffusion',
    'Génération d\'images par IA avec Stable Diffusion',
    'IA PHOTO',
    15.00,
    '/images/stablediffusion.jpg',
    '/api/proxy-stablediffusion'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 6. Ajouter le module Stable Diffusion (IA Video)
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'Stable diffusion',
    'Génération de vidéos par IA avec Stable Diffusion',
    'IA VIDEO',
    9.90,
    '/images/stablediffusion.jpg',
    '/api/proxy-stablediffusion-video'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 7. Ajouter le module Canvas Building Framework
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'Canvas Building Framework',
    'Framework de construction d\'applications avec Canvas',
    'BUILDING BLOCKS',
    0.00,
    '/images/canvas-framework.jpg',
    '/api/proxy-canvas'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 8. Ajouter le module ChatGPT
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'ChatGPT',
    'Assistant IA conversationnel avancé',
    'IA ASSISTANT',
    0.00,
    '/images/chatgpt.jpg',
    '/api/proxy-chatgpt'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 9. Ajouter le module IA Photo
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'IA Photo',
    'Édition et génération d\'images par IA',
    'IA PHOTO',
    0.00,
    '/images/iaphoto.jpg',
    '/api/proxy-iaphoto'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 10. Ajouter le module IA Tube
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'IA Tube',
    'Gestion et téléchargement de vidéos avec IA',
    'IA VIDEO',
    0.00,
    '/images/iatube.jpg',
    '/api/proxy-iatube'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- Vérifier le résultat
SELECT 
    id,
    title,
    category,
    price,
    image_url,
    CASE 
        WHEN price = 0.00 THEN 'Free'
        ELSE CONCAT(price::text, ' €')
    END as display_price
FROM modules
ORDER BY title;

-- Afficher le nombre total de modules
SELECT 'Total modules:' as info, COUNT(*) as count FROM modules;






