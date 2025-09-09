-- Création de la table pour les tokens d'accès temporaires LibreSpeed
CREATE TABLE IF NOT EXISTS librespeed_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_token ON librespeed_tokens(token);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_user_id ON librespeed_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_expires_at ON librespeed_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_is_used ON librespeed_tokens(is_used);

-- Politique RLS pour la sécurité
ALTER TABLE librespeed_tokens ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres tokens
CREATE POLICY "Users can view their own tokens" ON librespeed_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de tokens (pour l'API)
CREATE POLICY "Allow token creation" ON librespeed_tokens
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour des tokens (marquer comme utilisé)
CREATE POLICY "Allow token updates" ON librespeed_tokens
    FOR UPDATE USING (true);

-- Fonction pour nettoyer les tokens expirés (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_librespeed_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM librespeed_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE librespeed_tokens IS 'Tokens d''accès temporaires pour LibreSpeed - valides 5 minutes';
COMMENT ON COLUMN librespeed_tokens.token IS 'Token unique généré aléatoirement';
COMMENT ON COLUMN librespeed_tokens.user_id IS 'ID de l''utilisateur propriétaire du token';
COMMENT ON COLUMN librespeed_tokens.user_email IS 'Email de l''utilisateur pour les logs';
COMMENT ON COLUMN librespeed_tokens.expires_at IS 'Date d''expiration du token (5 minutes après création)';
COMMENT ON COLUMN librespeed_tokens.is_used IS 'Indique si le token a été utilisé';
COMMENT ON COLUMN librespeed_tokens.used_at IS 'Date d''utilisation du token';
