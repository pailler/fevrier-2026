-- Vérification rapide de pgvector
-- Exécuter ce script dans Supabase SQL Editor

-- Vérification en une seule requête
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
        THEN '✅ pgvector est installé et prêt'
        ELSE '❌ pgvector n''est pas installé'
    END as pgvector_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector')
        THEN '✅ pgvector est disponible'
        ELSE '❌ pgvector n''est pas disponible - Contactez le support Supabase'
    END as pgvector_available,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'vector_dims')
        THEN '✅ Fonctions vectorielles disponibles'
        ELSE '❌ Fonctions vectorielles manquantes'
    END as vector_functions;

-- Test rapide de fonctionnement
DO $$
BEGIN
    -- Test de création de vecteur
    CREATE TEMP TABLE quick_test (v VECTOR(3));
    INSERT INTO quick_test VALUES ('[1,2,3]');
    PERFORM v <-> '[1,2,3]' FROM quick_test;
    DROP TABLE quick_test;
    RAISE NOTICE '✅ Test de fonctionnement pgvector réussi !';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test de fonctionnement pgvector échoué: %', SQLERRM;
END $$;
