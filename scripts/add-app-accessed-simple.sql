-- Ajouter l'événement app_accessed s'il n'existe pas déjà
INSERT INTO notification_settings (event_type, event_name, event_description, email_template_subject, email_template_body) 
VALUES (
    'app_accessed', 
    'Accès à une application', 
    'Un utilisateur a accédé à une application', 
    'Accès à une application - IAHome', 
    'Un utilisateur a accédé à l''application {appName} sur IAHome.'
) 
ON CONFLICT (event_type) DO UPDATE SET
    event_name = EXCLUDED.event_name,
    event_description = EXCLUDED.event_description,
    email_template_subject = EXCLUDED.email_template_subject,
    email_template_body = EXCLUDED.email_template_body,
    updated_at = NOW();
