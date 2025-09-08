-- =====================================================
-- Vérifier la définition de la vue users_view
-- =====================================================

-- 1. Vérifier que c'est bien une vue
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'users_view' 
AND table_schema = 'public';

-- 2. Voir la définition de la vue
SELECT 
    view_definition
FROM information_schema.views 
WHERE table_name = 'users_view' 
AND table_schema = 'public';

-- 3. Voir les colonnes de la vue
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier s'il existe une table de base
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema = 'public'
ORDER BY table_name;
