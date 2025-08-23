-- Migration script pour ajouter le champ status à la table blog_articles
-- Ce script doit être exécuté dans Supabase SQL Editor

-- 1. Ajouter la colonne status si elle n'existe pas
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 2. Mettre à jour les articles existants basés sur is_published
UPDATE blog_articles 
SET status = CASE 
    WHEN is_published = true THEN 'published'
    ELSE 'draft'
END
WHERE status IS NULL OR status = 'draft';

-- 3. Optionnel : Supprimer l'ancienne colonne is_published après vérification
-- ALTER TABLE blog_articles DROP COLUMN IF EXISTS is_published;

-- 4. Ajouter une contrainte pour s'assurer que status ne peut être que 'draft' ou 'published'
ALTER TABLE blog_articles 
ADD CONSTRAINT check_status 
CHECK (status IN ('draft', 'published'));

-- 5. Créer un index pour améliorer les performances des requêtes par statut
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);

-- 6. Afficher les résultats de la migration
SELECT 
    status,
    COUNT(*) as count
FROM blog_articles 
GROUP BY status;
