-- Script pour mettre à jour le prix de StableDiffusion à 10 centimes
-- Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- Mettre à jour le prix de StableDiffusion à 0.10 euros (10 centimes)
UPDATE modules 
SET price = 0.10, 
    updated_at = NOW()
WHERE id = 'stablediffusion';

-- Vérifier la mise à jour
SELECT id, title, price, updated_at 
FROM modules 
WHERE id = 'stablediffusion';

-- Afficher tous les modules pour vérification
SELECT id, title, price, category 
FROM modules 
ORDER BY title;
