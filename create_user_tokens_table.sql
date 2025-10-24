-- Script SQL pour créer la table user_tokens dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table user_tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 100,
    package_name TEXT DEFAULT 'Welcome Package',
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique sur user_id pour éviter les doublons
    UNIQUE(user_id)
);

-- Créer la table token_usage pour l'historique d'utilisation
CREATE TABLE IF NOT EXISTS token_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    action_type TEXT,
    tokens_consumed INTEGER NOT NULL,
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_active ON user_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(usage_date);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON user_tokens;
CREATE TRIGGER update_user_tokens_updated_at
    BEFORE UPDATE ON user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_tokens
CREATE POLICY "Allow public read access to user tokens" ON user_tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert for user tokens" ON user_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update for user tokens" ON user_tokens
    FOR UPDATE USING (true);

-- Politiques pour token_usage
CREATE POLICY "Allow public read access to token usage" ON token_usage
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert for token usage" ON token_usage
    FOR INSERT WITH CHECK (true);

-- Insérer des tokens par défaut pour l'utilisateur de test
INSERT INTO user_tokens (user_id, tokens, package_name, is_active)
VALUES ('regispailler@gmail.com', 100, 'Welcome Package', true)
ON CONFLICT (user_id) DO NOTHING;



