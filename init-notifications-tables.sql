-- Script SQL pour créer les tables de notifications dans Supabase

-- Table des paramètres de notifications
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  email_template_subject TEXT NOT NULL,
  email_template_body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs de notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  event_data JSONB,
  email_sent BOOLEAN DEFAULT false,
  email_error TEXT,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON notification_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_email ON notification_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_settings_event_type ON notification_settings(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(is_enabled);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour notification_settings
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer les paramètres de notifications par défaut
INSERT INTO notification_settings (event_type, name, description, is_enabled, email_template_subject, email_template_body) VALUES
('user_signup', 'Inscription utilisateur', 'Notification envoyée lors de l''inscription d''un nouvel utilisateur', true, 'Bienvenue sur IAHome !', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Bienvenue sur IAHome !</h2><p>Bonjour {{user_name}},</p><p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos modules.</p><p>Merci de nous faire confiance !</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>'),

('user_login', 'Connexion utilisateur', 'Notification envoyée lors de la connexion d''un utilisateur', false, 'Connexion détectée - IAHome', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Connexion détectée</h2><p>Bonjour {{user_name}},</p><p>Une connexion à votre compte IAHome a été détectée le {{login_date}}.</p><p>Si ce n''était pas vous, veuillez contacter le support.</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>'),

('module_activated', 'Module activé', 'Notification envoyée lorsqu''un module est activé pour un utilisateur', true, 'Module activé - {{module_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Module activé</h2><p>Bonjour {{user_name}},</p><p>Le module <strong>{{module_name}}</strong> a été activé pour votre compte.</p><p>Vous pouvez maintenant y accéder depuis votre tableau de bord.</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>'),

('payment_success', 'Paiement réussi', 'Notification envoyée lors d''un paiement réussi', true, 'Paiement confirmé - {{amount}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Paiement confirmé</h2><p>Bonjour {{user_name}},</p><p>Votre paiement de <strong>{{amount}}</strong> a été confirmé.</p><p>Merci pour votre achat !</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>'),

('module_usage_limit', 'Limite d''usage atteinte', 'Notification envoyée quand un utilisateur atteint sa limite d''usage', true, 'Limite d''usage atteinte - {{module_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #f59e0b;">Limite d''usage atteinte</h2><p>Bonjour {{user_name}},</p><p>Vous avez atteint votre limite d''usage pour le module <strong>{{module_name}}</strong>.</p><p>Considérez une mise à niveau pour continuer à utiliser ce module.</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>'),

('admin_alert', 'Alerte administrateur', 'Notification envoyée aux administrateurs pour les événements critiques', true, 'Alerte administrateur - {{alert_type}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #dc2626;">Alerte administrateur</h2><p>Une alerte de type <strong>{{alert_type}}</strong> a été déclenchée.</p><p><strong>Détails:</strong> {{alert_details}}</p><p>Veuillez vérifier le système.</p><hr><p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement par IAHome.</p></div>')
ON CONFLICT (event_type) DO NOTHING;
