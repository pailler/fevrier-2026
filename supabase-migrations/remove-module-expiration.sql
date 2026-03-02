-- =============================================================================
-- Migration : suppression de la notion d'expiration / durée de module
-- Base de données : Supabase
-- =============================================================================
-- Exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- =============================================================================

-- Table user_applications uniquement (access_tokens n'existe pas dans cette base)
-- Colonne expires_at : date d'expiration de l'accès module
-- Colonne max_usage : quota maximal d'utilisations
ALTER TABLE user_applications DROP COLUMN IF EXISTS expires_at;
ALTER TABLE user_applications DROP COLUMN IF EXISTS max_usage;
