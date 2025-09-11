-- Script de test complet pour pgvector
-- Exécuter ce script dans Supabase SQL Editor pour vérifier pgvector

-- =====================================================
-- TEST 1: Vérification de la disponibilité
-- =====================================================
SELECT 
    'Test 1: Extension disponible' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector')
        THEN '✅ pgvector est disponible'
        ELSE '❌ pgvector n''est pas disponible - Contactez le support Supabase'
    END as result;

-- =====================================================
-- TEST 2: Vérification de l'installation
-- =====================================================
SELECT 
    'Test 2: Extension installée' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
        THEN '✅ pgvector est installé'
        ELSE '❌ pgvector n''est pas installé - Exécutez: CREATE EXTENSION vector;'
    END as result;

-- =====================================================
-- TEST 3: Test de création de vecteurs
-- =====================================================
DO $$
BEGIN
    -- Tenter de créer une table avec des vecteurs
    BEGIN
        CREATE TEMP TABLE test_vector_table (
            id SERIAL PRIMARY KEY,
            embedding VECTOR(1536) -- Même dimension que OpenAI
        );
        
        RAISE NOTICE '✅ Test 3: Création de table vectorielle réussie';
        
        -- Nettoyer
        DROP TABLE test_vector_table;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 3: Erreur lors de la création de table vectorielle: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- TEST 4: Test d'insertion de vecteurs
-- =====================================================
DO $$
BEGIN
    BEGIN
        -- Créer une table temporaire
        CREATE TEMP TABLE test_insert (
            id SERIAL PRIMARY KEY,
            embedding VECTOR(3)
        );
        
        -- Insérer des vecteurs de test
        INSERT INTO test_insert (embedding) VALUES 
            ('[1,2,3]'),
            ('[4,5,6]'),
            ('[7,8,9]');
        
        RAISE NOTICE '✅ Test 4: Insertion de vecteurs réussie';
        
        -- Nettoyer
        DROP TABLE test_insert;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 4: Erreur lors de l''insertion de vecteurs: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- TEST 5: Test de recherche par similarité
-- =====================================================
DO $$
BEGIN
    BEGIN
        -- Créer une table temporaire
        CREATE TEMP TABLE test_search (
            id SERIAL PRIMARY KEY,
            embedding VECTOR(3)
        );
        
        -- Insérer des vecteurs de test
        INSERT INTO test_search (embedding) VALUES 
            ('[1,1,1]'),
            ('[2,2,2]'),
            ('[3,3,3]');
        
        -- Tester la recherche par similarité
        PERFORM id, embedding, embedding <-> '[1,1,1]' as distance
        FROM test_search
        ORDER BY embedding <-> '[1,1,1]'
        LIMIT 1;
        
        RAISE NOTICE '✅ Test 5: Recherche par similarité réussie';
        
        -- Nettoyer
        DROP TABLE test_search;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 5: Erreur lors de la recherche par similarité: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- TEST 6: Test des opérateurs vectoriels
-- =====================================================
DO $$
DECLARE
    v1 VECTOR(3) := '[1,2,3]';
    v2 VECTOR(3) := '[4,5,6]';
    distance FLOAT;
    similarity FLOAT;
BEGIN
    BEGIN
        -- Test de distance cosinus
        distance := v1 <-> v2;
        
        -- Test de similarité cosinus
        similarity := 1 - (v1 <=> v2);
        
        RAISE NOTICE '✅ Test 6: Opérateurs vectoriels fonctionnels';
        RAISE NOTICE '   Distance cosinus: %', distance;
        RAISE NOTICE '   Similarité cosinus: %', similarity;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 6: Erreur avec les opérateurs vectoriels: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- TEST 7: Test de performance (optionnel)
-- =====================================================
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
BEGIN
    BEGIN
        start_time := clock_timestamp();
        
        -- Créer une table avec plus de données
        CREATE TEMP TABLE test_performance (
            id SERIAL PRIMARY KEY,
            embedding VECTOR(1536)
        );
        
        -- Insérer plusieurs vecteurs
        FOR i IN 1..100 LOOP
            INSERT INTO test_performance (embedding) 
            VALUES (array_fill(random(), ARRAY[1536])::VECTOR(1536));
        END LOOP;
        
        -- Test de recherche
        PERFORM id, embedding <-> array_fill(random(), ARRAY[1536])::VECTOR(1536) as distance
        FROM test_performance
        ORDER BY embedding <-> array_fill(random(), ARRAY[1536])::VECTOR(1536)
        LIMIT 10;
        
        end_time := clock_timestamp();
        duration := end_time - start_time;
        
        RAISE NOTICE '✅ Test 7: Test de performance réussi';
        RAISE NOTICE '   Durée: %', duration;
        
        -- Nettoyer
        DROP TABLE test_performance;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 7: Erreur lors du test de performance: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================
SELECT 
    '🎯 RÉSUMÉ DES TESTS PGVECTOR' as summary,
    'Vérifiez les messages ci-dessus pour les résultats' as details;

-- Afficher la version de pgvector si disponible
SELECT 
    'Version pgvector' as info,
    extversion as version
FROM pg_extension 
WHERE extname = 'vector';

-- Afficher les fonctions vectorielles disponibles
SELECT 
    'Fonctions vectorielles disponibles' as info,
    COUNT(*) as count
FROM pg_proc 
WHERE proname LIKE '%vector%' 
OR proname LIKE '%cosine%'
OR proname LIKE '%distance%';
