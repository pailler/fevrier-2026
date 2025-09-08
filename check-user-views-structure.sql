-- =====================================================
-- Vérifier la structure de user_views
-- =====================================================

-- 1. Structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les données existantes
SELECT COUNT(*) as total_users FROM public.user_views;
SELECT * FROM public.user_views LIMIT 3;

-- 3. Vérifier les politiques RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_views';

-- 4. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_views' 
AND schemaname = 'public';
