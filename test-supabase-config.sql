-- =====================================================
-- Test de la configuration Supabase
-- =====================================================

-- 1. Vérifier que la table user_applications existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_applications';

-- 3. Vérifier les fonctions créées
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_last_login', 'get_user_role', 'get_user_info');

-- 4. Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'on_auth_user_login');

-- 5. Tester la fonction get_user_role (remplacer par un UUID valide)
-- SELECT public.get_user_role('00000000-0000-0000-0000-000000000000'::uuid);

-- 6. Vérifier les utilisateurs existants
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
LIMIT 5;

-- 7. Vérifier les enregistrements dans user_applications
SELECT 
    id,
    user_id,
    email,
    full_name,
    provider,
    role,
    is_active,
    created_at
FROM public.user_applications 
LIMIT 5;

-- 8. Vérifier la configuration des providers
SELECT 
    provider_id,
    provider_name,
    enabled
FROM auth.providers;

-- 9. Vérifier les configurations d'URL
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN ('SITE_URL', 'REDIRECT_URLS');
