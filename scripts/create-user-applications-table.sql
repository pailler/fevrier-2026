-- Table pour les applications utilisateur (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS user_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    access_level VARCHAR(20) DEFAULT 'basic' CHECK (access_level IN ('basic', 'premium', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_module_id ON user_applications(module_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_created_at ON user_applications(created_at);

-- Politique RLS (Row Level Security) - à ajuster selon vos besoins
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS (à personnaliser)
-- CREATE POLICY "Users can view their own applications" ON user_applications
--     FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Admins can view all applications" ON user_applications
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );
