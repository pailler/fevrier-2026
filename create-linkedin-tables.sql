-- Création des tables pour la fonctionnalité LinkedIn

-- Table pour les posts LinkedIn
CREATE TABLE IF NOT EXISTS linkedin_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    linkedin_post_id VARCHAR(255),
    engagement_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les credentials LinkedIn
CREATE TABLE IF NOT EXISTS linkedin_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    profile_id VARCHAR(255) NOT NULL,
    profile_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON linkedin_posts(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON linkedin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_scheduled_at ON linkedin_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_linkedin_credentials_active ON linkedin_credentials(is_active);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_linkedin_posts_updated_at 
    BEFORE UPDATE ON linkedin_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_credentials_updated_at 
    BEFORE UPDATE ON linkedin_credentials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_credentials ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour linkedin_posts (seuls les admins peuvent accéder)
CREATE POLICY "Admins can manage linkedin posts" ON linkedin_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politiques RLS pour linkedin_credentials (seuls les admins peuvent accéder)
CREATE POLICY "Admins can manage linkedin credentials" ON linkedin_credentials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Insertion de données de test (optionnel)
INSERT INTO linkedin_posts (title, content, status, created_at) VALUES
('Premier post LinkedIn', 'Contenu du premier post LinkedIn pour tester la fonctionnalité.', 'draft', NOW()),
('Post programmé', 'Ce post est programmé pour être publié plus tard.', 'scheduled', NOW()),
('Post publié', 'Ce post a été publié avec succès sur LinkedIn.', 'published', NOW() - INTERVAL '1 day');

-- Mise à jour des statistiques dans la page admin principale
-- Note: Cette requête peut être utilisée pour mettre à jour les stats dans la page admin
-- SELECT 
--     COUNT(*) as total_posts,
--     COUNT(*) FILTER (WHERE status = 'published') as published_posts,
--     COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_posts,
--     COUNT(*) FILTER (WHERE status = 'draft') as draft_posts
-- FROM linkedin_posts;
