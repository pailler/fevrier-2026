-- =====================================================
-- Test simple pour Google OAuth avec user_views
-- =====================================================

-- 1. Vérifier que la table user_views a bien une colonne email
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_views' 
            AND column_name = 'email'
            AND table_schema = 'public'
        ) 
        THEN '✅ Colonne email existe dans user_views'
        ELSE '❌ Colonne email manquante dans user_views'
    END as email_status;

-- 2. Vérifier les colonnes nécessaires pour l'auth
SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'email', 'full_name', 'role') 
        THEN '✅ Requis'
        ELSE 'ℹ️ Optionnel'
    END as importance
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY 
    CASE 
        WHEN column_name IN ('id', 'user_id', 'email', 'full_name', 'role') 
        THEN 1 
        ELSE 2 
    END,
    column_name;

-- 3. Vérifier les utilisateurs existants
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role
FROM public.user_views;

-- 4. Afficher un échantillon
SELECT 
    id,
    user_id,
    email,
    full_name,
    role,
    created_at
FROM public.user_views 
LIMIT 5;
