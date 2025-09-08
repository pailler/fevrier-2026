-- =====================================================
-- Diagnostic de la table users_view existante
-- =====================================================

-- 1. Vérifier la structure actuelle de la table users_view
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users_view' 
AND tc.table_schema = 'public';

-- 3. Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users_view' 
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
WHERE tablename = 'users_view';

-- 5. Vérifier les données existantes
SELECT COUNT(*) as total_users FROM public.users_view;
SELECT * FROM public.users_view LIMIT 5;

-- 6. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users_view' 
AND schemaname = 'public';
