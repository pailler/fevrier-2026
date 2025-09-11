-- Script pour activer l'extension vectorielle dans Supabase
-- Exécuter ce script AVANT create-photo-portfolio-schema.sql

-- Activer l'extension vectorielle (requis pour les embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Vérifier que l'extension est bien installée
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Message de confirmation
SELECT 'Extension vectorielle activée avec succès!' as status;
