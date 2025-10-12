-- Script SQL pour créer la table user_tokens_new dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer une nouvelle table user_tokens_new qui référence profiles
CREATE TABLE user_tokens_new (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    tokens INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insérer 10 tokens par défaut pour tous les utilisateurs existants
INSERT INTO user_tokens_new (user_id, tokens)
SELECT id, 10 FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tokens_new_user_id ON user_tokens_new(user_id);

-- Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_tokens_new_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_tokens_new_updated_at
BEFORE UPDATE ON user_tokens_new
FOR EACH ROW
EXECUTE FUNCTION update_user_tokens_new_updated_at();

-- Vérifier que la table a été créée correctement
SELECT 
    'Table user_tokens_new créée avec succès' as status,
    COUNT(*) as total_users,
    SUM(tokens) as total_tokens
FROM user_tokens_new;
