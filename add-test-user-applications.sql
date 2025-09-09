-- Ajouter des données de test pour les applications utilisateur
-- Remplacez 'YOUR_USER_ID' par l'ID réel de l'utilisateur connecté

-- D'abord, récupérons l'ID de l'utilisateur (vous devrez le remplacer par l'ID réel)
-- SELECT id FROM auth.users WHERE email = 'votre-email@example.com';

-- Ajouter LibreSpeed pour tous les utilisateurs (gratuit)
INSERT INTO user_applications (user_id, module_id, module_title, access_level, is_active, expires_at, usage_count, max_usage)
SELECT 
    u.id,
    'librespeed',
    'LibreSpeed',
    'standard',
    true,
    NULL, -- Pas d'expiration
    0,    -- Aucune utilisation
    10    -- Maximum 10 utilisations par jour
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_applications ua 
    WHERE ua.user_id = u.id AND ua.module_id = 'librespeed'
);

-- Ajouter PDF+ pour tous les utilisateurs (gratuit)
INSERT INTO user_applications (user_id, module_id, module_title, access_level, is_active, expires_at, usage_count, max_usage)
SELECT 
    u.id,
    'pdf',
    'PDF+',
    'standard',
    true,
    NULL, -- Pas d'expiration
    0,    -- Aucune utilisation
    5     -- Maximum 5 utilisations par jour
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_applications ua 
    WHERE ua.user_id = u.id AND ua.module_id = 'pdf'
);

-- Ajouter Metube pour tous les utilisateurs (gratuit)
INSERT INTO user_applications (user_id, module_id, module_title, access_level, is_active, expires_at, usage_count, max_usage)
SELECT 
    u.id,
    'metube',
    'Metube',
    'standard',
    true,
    NULL, -- Pas d'expiration
    0,    -- Aucune utilisation
    3     -- Maximum 3 utilisations par jour
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_applications ua 
    WHERE ua.user_id = u.id AND ua.module_id = 'metube'
);

-- Ajouter PSITransfer pour tous les utilisateurs (gratuit)
INSERT INTO user_applications (user_id, module_id, module_title, access_level, is_active, expires_at, usage_count, max_usage)
SELECT 
    u.id,
    'psitransfer',
    'PSitransfer',
    'standard',
    true,
    NULL, -- Pas d'expiration
    0,    -- Aucune utilisation
    5     -- Maximum 5 utilisations par jour
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_applications ua 
    WHERE ua.user_id = u.id AND ua.module_id = 'psitransfer'
);

-- Vérifier les données ajoutées
SELECT 
    ua.id,
    ua.user_id,
    ua.module_id,
    ua.module_title,
    ua.is_active,
    ua.usage_count,
    ua.max_usage,
    ua.created_at
FROM user_applications ua
ORDER BY ua.created_at DESC;
