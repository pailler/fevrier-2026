-- Table pour la configuration des notifications par email
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL UNIQUE,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    email_template_subject VARCHAR(200),
    email_template_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des événements de notification par défaut
INSERT INTO notification_settings (event_type, event_name, event_description, email_template_subject, email_template_body) VALUES
('user_created', 'Création de compte', 'Un nouvel utilisateur a créé un compte', 'Nouveau compte créé - IAHome', 'Un nouvel utilisateur a créé un compte sur IAHome.'),
('user_login', 'Connexion utilisateur', 'Un utilisateur s''est connecté', 'Connexion utilisateur - IAHome', 'Un utilisateur s''est connecté à IAHome.'),
('module_activated', 'Activation de module', 'Un utilisateur a activé un module', 'Module activé - IAHome', 'Un utilisateur a activé un module sur IAHome.'),
('user_logout', 'Déconnexion utilisateur', 'Un utilisateur s''est déconnecté', 'Déconnexion utilisateur - IAHome', 'Un utilisateur s''est déconnecté d''IAHome.'),
('app_accessed', 'Accès à une application', 'Un utilisateur a accédé à une application', 'Accès à une application - IAHome', 'Un utilisateur a accédé à l''application {appName} sur IAHome.')
ON CONFLICT (event_type) DO NOTHING;

-- Table pour les logs de notifications envoyées
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    event_data JSONB,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON notification_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
