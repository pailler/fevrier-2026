-- Script pour renommer "Contact commercial" en "Contact" dans les menus
-- Mise à jour des éléments de menu qui contiennent "Contact commercial"

UPDATE menu_items 
SET title = 'Contact',
    updated_at = NOW()
WHERE LOWER(title) LIKE '%contact commercial%' 
   OR LOWER(title) LIKE '%contact%commercial%'
   OR title = 'Contact commercial';

-- Vérifier les résultats
SELECT id, title, url, menu_id, is_active 
FROM menu_items 
WHERE LOWER(title) LIKE '%contact%' 
ORDER BY title;
