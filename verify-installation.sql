-- Script de vérification de l'installation du Portfolio Photo IA
-- Exécuter ce script après create-photo-portfolio-complete.sql

-- =====================================================
-- VÉRIFICATION COMPLÈTE DE L'INSTALLATION
-- =====================================================

-- 1. Vérifier l'extension vectorielle
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') 
        THEN '✅ Extension vectorielle installée'
        ELSE '❌ Extension vectorielle manquante'
    END as extension_status;

-- 2. Vérifier les tables créées
SELECT 
    'Tables créées' as category,
    COUNT(*) as count,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'photo_%';

-- 3. Vérifier les fonctions créées
SELECT 
    'Fonctions créées' as category,
    COUNT(*) as count,
    STRING_AGG(routine_name, ', ' ORDER BY routine_name) as functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%photo%';

-- 4. Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as category,
    COUNT(*) as count,
    STRING_AGG(DISTINCT tablename, ', ' ORDER BY tablename) as tables_with_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'photo_%';

-- 5. Vérifier le bucket de stockage
SELECT 
    'Bucket de stockage' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photo-portfolio')
        THEN '✅ Bucket photo-portfolio créé'
        ELSE '❌ Bucket photo-portfolio manquant'
    END as bucket_status;

-- 6. Vérifier les index vectoriels
SELECT 
    'Index vectoriels' as category,
    COUNT(*) as count,
    STRING_AGG(indexname, ', ' ORDER BY indexname) as vector_indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexdef LIKE '%vector%';

-- 7. Test de la fonction de recherche
SELECT 
    'Fonction de recherche' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'search_photos_by_similarity'
        )
        THEN '✅ Fonction de recherche disponible'
        ELSE '❌ Fonction de recherche manquante'
    END as search_function_status;

-- 8. Test de la fonction de statistiques
SELECT 
    'Fonction de statistiques' as category,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_user_photo_stats'
        )
        THEN '✅ Fonction de statistiques disponible'
        ELSE '❌ Fonction de statistiques manquante'
    END as stats_function_status;

-- 9. Vérifier les triggers
SELECT 
    'Triggers' as category,
    COUNT(*) as count,
    STRING_AGG(trigger_name, ', ' ORDER BY trigger_name) as triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%photo%';

-- 10. Résumé final
SELECT 
    '🎉 RÉSUMÉ DE L''INSTALLATION' as summary,
    'Portfolio Photo IA' as system_name,
    'LangChain + Supabase' as technology,
    'Prêt à l''utilisation' as status;
