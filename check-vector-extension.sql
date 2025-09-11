-- Script de vérification de l'extension vectorielle
-- Exécuter ce script pour vérifier si l'extension est disponible

-- Vérifier si l'extension vectorielle est installée
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') 
        THEN '✅ Extension vectorielle installée'
        ELSE '❌ Extension vectorielle manquante'
    END as status;

-- Lister toutes les extensions disponibles
SELECT extname, extversion, extrelocatable 
FROM pg_extension 
WHERE extname LIKE '%vector%' OR extname LIKE '%pgvector%';

-- Vérifier si le type VECTOR existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') 
        THEN '✅ Type VECTOR disponible'
        ELSE '❌ Type VECTOR non disponible'
    END as vector_type_status;

-- Informations sur la base de données
SELECT 
    current_database() as database_name,
    version() as postgresql_version,
    current_setting('server_version') as server_version;
