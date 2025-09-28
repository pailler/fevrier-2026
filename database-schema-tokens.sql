-- Script SQL pour créer les tables nécessaires au système de tokens
-- À exécuter dans votre base de données Supabase

-- Table pour stocker les tokens des utilisateurs
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens INTEGER NOT NULL DEFAULT 0,
    package_name TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table pour enregistrer l'historique d'utilisation des tokens
CREATE TABLE IF NOT EXISTS token_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    tokens_consumed INTEGER NOT NULL,
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_usage_date ON token_usage(usage_date);

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_tokens
CREATE POLICY "Users can view their own tokens" ON user_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON user_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON user_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour token_usage
CREATE POLICY "Users can view their own token usage" ON token_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token usage" ON token_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour user_tokens
CREATE TRIGGER update_user_tokens_updated_at 
    BEFORE UPDATE ON user_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vue pour faciliter les requêtes sur les tokens des utilisateurs
CREATE OR REPLACE VIEW user_token_summary AS
SELECT 
    ut.user_id,
    ut.tokens,
    ut.package_name,
    ut.purchase_date,
    ut.is_active,
    ut.updated_at,
    COALESCE(SUM(tu.tokens_consumed), 0) as total_tokens_consumed,
    COUNT(tu.id) as total_usage_count
FROM user_tokens ut
LEFT JOIN token_usage tu ON ut.user_id = tu.user_id
GROUP BY ut.user_id, ut.tokens, ut.package_name, ut.purchase_date, ut.is_active, ut.updated_at;

-- Fonction pour consommer des tokens
CREATE OR REPLACE FUNCTION consume_tokens(
    p_user_id UUID,
    p_module_id TEXT,
    p_module_name TEXT,
    p_tokens_to_consume INTEGER
)
RETURNS JSON AS $$
DECLARE
    current_tokens INTEGER;
    new_token_count INTEGER;
    result JSON;
BEGIN
    -- Récupérer les tokens actuels
    SELECT tokens INTO current_tokens
    FROM user_tokens
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Vérifier si l'utilisateur a assez de tokens
    IF current_tokens IS NULL OR current_tokens < p_tokens_to_consume THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tokens insuffisants',
            'current_tokens', COALESCE(current_tokens, 0),
            'required_tokens', p_tokens_to_consume
        );
    END IF;
    
    -- Calculer le nouveau nombre de tokens
    new_token_count := current_tokens - p_tokens_to_consume;
    
    -- Mettre à jour les tokens
    UPDATE user_tokens
    SET tokens = new_token_count, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Enregistrer l'utilisation
    INSERT INTO token_usage (user_id, module_id, module_name, tokens_consumed)
    VALUES (p_user_id, p_module_id, p_module_name, p_tokens_to_consume);
    
    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'tokens_remaining', new_token_count,
        'tokens_consumed', p_tokens_to_consume
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des tokens
CREATE OR REPLACE FUNCTION add_tokens(
    p_user_id UUID,
    p_tokens_to_add INTEGER,
    p_package_name TEXT DEFAULT 'Manual Addition'
)
RETURNS JSON AS $$
DECLARE
    current_tokens INTEGER;
    new_token_count INTEGER;
    result JSON;
BEGIN
    -- Récupérer ou créer l'enregistrement de tokens
    INSERT INTO user_tokens (user_id, tokens, package_name, is_active)
    VALUES (p_user_id, 0, p_package_name, true)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Récupérer les tokens actuels
    SELECT tokens INTO current_tokens
    FROM user_tokens
    WHERE user_id = p_user_id;
    
    -- Calculer le nouveau nombre de tokens
    new_token_count := current_tokens + p_tokens_to_add;
    
    -- Mettre à jour les tokens
    UPDATE user_tokens
    SET tokens = new_token_count, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'tokens_added', p_tokens_to_add,
        'total_tokens', new_token_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les tables
COMMENT ON TABLE user_tokens IS 'Stockage des tokens des utilisateurs';
COMMENT ON TABLE token_usage IS 'Historique de l''utilisation des tokens';
COMMENT ON FUNCTION consume_tokens IS 'Consomme des tokens pour un utilisateur et un module';
COMMENT ON FUNCTION add_tokens IS 'Ajoute des tokens à un utilisateur';

