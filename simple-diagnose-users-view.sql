-- =====================================================
-- Diagnostic simplifié de la table users_view
-- =====================================================

-- 1. Vérifier que la table existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users_view' 
            AND table_schema = 'public'
        ) 
        THEN '✅ Table users_view existe'
        ELSE '❌ Table users_view n''existe pas'
    END as table_status;

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier les données existantes
SELECT COUNT(*) as total_users FROM public.users_view;

-- 4. Afficher un échantillon des données
SELECT * FROM public.users_view LIMIT 3;

-- 5. Vérifier les colonnes importantes pour l'auth
SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'email', 'full_name', 'role') 
        THEN '✅ Requis pour l''auth'
        ELSE 'ℹ️ Optionnel'
    END as importance
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY 
    CASE 
        WHEN column_name IN ('id', 'user_id', 'email', 'full_name', 'role') 
        THEN 1 
        ELSE 2 
    END,
    column_name;
