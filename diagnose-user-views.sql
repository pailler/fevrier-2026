-- =====================================================
-- Diagnostic de la table user_views existante
-- =====================================================

-- 1. Vérifier la structure actuelle de la table user_views
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_views' 
AND tc.table_schema = 'public';

-- 3. Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_views' 
AND schemaname = 'public';

-- 4. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_views';

-- 5. Vérifier les données existantes
SELECT COUNT(*) as total_users FROM public.user_views;
SELECT * FROM public.user_views LIMIT 5;
