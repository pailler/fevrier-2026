-- Script d'initialisation de la table user_tokens
-- Cette table stocke les tokens des utilisateurs pour le système pay-per-action

-- Créer la table user_tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 0,
    package_name VARCHAR(255),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrainte unique sur user_id pour éviter les doublons
    UNIQUE(user_id)
);

-- Créer la table token_usage pour l'historique d'utilisation
CREATE TABLE IF NOT EXISTS token_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100),
    tokens_consumed INTEGER NOT NULL,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour améliorer les performances
    INDEX idx_token_usage_user_id (user_id),
    INDEX idx_token_usage_date (usage_date)
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_active ON user_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(usage_date);

-- Insérer des données de test (optionnel)
-- INSERT INTO user_tokens (user_id, tokens, package_name, is_active) 
-- VALUES ('77e8d61e-dbec-49fe-bd5a-517fc495c84a', 10, 'Welcome Package', true)
-- ON CONFLICT (user_id) DO NOTHING;
