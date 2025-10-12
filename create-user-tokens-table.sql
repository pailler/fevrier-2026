-- Créer la table user_tokens pour stocker les tokens des utilisateurs
CREATE TABLE IF NOT EXISTS user_tokens (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    tokens INTEGER NOT NULL DEFAULT 10,
    package_name TEXT DEFAULT 'Welcome Package',
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances des requêtes par user_id
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);

-- Trigger pour mettre à jour `updated_at`
CREATE OR REPLACE FUNCTION update_user_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_tokens_updated_at
BEFORE UPDATE ON user_tokens
FOR EACH ROW
EXECUTE FUNCTION update_user_tokens_updated_at();

-- Créer la table token_usage pour enregistrer l'historique d'utilisation
CREATE TABLE IF NOT EXISTS token_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    action_type TEXT,
    tokens_consumed INTEGER NOT NULL,
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances des requêtes par user_id
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(usage_date);

-- Insérer 10 tokens par défaut pour tous les utilisateurs existants qui n'en ont pas
INSERT INTO user_tokens (user_id, tokens, package_name, purchase_date, is_active)
SELECT 
    p.id,
    10,
    'Welcome Package',
    CURRENT_TIMESTAMP,
    true
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_tokens ut WHERE ut.user_id = p.id
);
