-- Création de la table user_applications pour gérer les accès aux modules
CREATE TABLE IF NOT EXISTS user_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL,
    module_title VARCHAR(255) NOT NULL,
    access_level VARCHAR(50) DEFAULT 'standard',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_module_id ON user_applications(module_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_is_active ON user_applications(is_active);
CREATE INDEX IF NOT EXISTS idx_user_applications_expires_at ON user_applications(expires_at);

-- Politique RLS pour la sécurité
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres applications
CREATE POLICY "Users can view their own applications" ON user_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion d'applications
CREATE POLICY "Allow application creation" ON user_applications
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour des applications
CREATE POLICY "Allow application updates" ON user_applications
    FOR UPDATE USING (auth.uid() = user_id OR true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_user_applications_updated_at
    BEFORE UPDATE ON user_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE user_applications IS 'Applications souscrites par les utilisateurs avec quotas et permissions';
COMMENT ON COLUMN user_applications.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN user_applications.module_id IS 'ID du module (ex: librespeed, pdf, etc.)';
COMMENT ON COLUMN user_applications.module_title IS 'Titre du module pour affichage';
COMMENT ON COLUMN user_applications.access_level IS 'Niveau d''accès (standard, premium, admin)';
COMMENT ON COLUMN user_applications.is_active IS 'Indique si l''accès est actif';
COMMENT ON COLUMN user_applications.expires_at IS 'Date d''expiration de l''accès (NULL = permanent)';
COMMENT ON COLUMN user_applications.usage_count IS 'Nombre d''utilisations actuelles';
COMMENT ON COLUMN user_applications.max_usage IS 'Nombre maximum d''utilisations autorisées (0 = illimité)';
