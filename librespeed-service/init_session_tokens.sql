-- Table pour gérer les tokens de session LibreSpeed
CREATE TABLE IF NOT EXISTS librespeed_session_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_token ON librespeed_session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_user_id ON librespeed_session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_expires_at ON librespeed_session_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_librespeed_tokens_active ON librespeed_session_tokens(is_active);

-- Fonction pour nettoyer les tokens expirés
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    UPDATE librespeed_session_tokens 
    SET is_active = FALSE 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
