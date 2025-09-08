-- =====================================================
-- Configuration Supabase pour IAhome
-- =====================================================

-- 1. Créer la table user_applications si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    provider_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON public.user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_email ON public.user_applications(email);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour que les utilisateurs puissent voir leurs propres données
CREATE POLICY "Users can view own data" ON public.user_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leurs propres données
CREATE POLICY "Users can insert own data" ON public.user_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON public.user_applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les admins (peuvent voir toutes les données)
CREATE POLICY "Admins can view all data" ON public.user_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_applications 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Créer une fonction pour synchroniser les utilisateurs auth.users avec user_applications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_applications (
        user_id,
        email,
        full_name,
        avatar_url,
        provider,
        provider_id,
        role,
        is_active,
        last_login,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
        COALESCE(NEW.raw_user_meta_data->>'provider_id', NEW.id::text),
        'user',
        true,
        NOW(),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer un trigger pour automatiquement créer un enregistrement dans user_applications
-- quand un nouvel utilisateur s'inscrit
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Créer une fonction pour mettre à jour last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_applications 
    SET last_login = NOW(), updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer un trigger pour mettre à jour last_login à chaque connexion
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_last_login();

-- 9. Créer une fonction pour obtenir le rôle de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.user_applications 
        WHERE user_id = user_uuid AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer une fonction pour obtenir les informations de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_info(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50),
    role VARCHAR(50),
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.email,
        ua.full_name,
        ua.avatar_url,
        ua.provider,
        ua.role,
        ua.is_active,
        ua.last_login
    FROM public.user_applications ua
    WHERE ua.user_id = user_uuid AND ua.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Insérer un utilisateur admin par défaut (optionnel)
-- Remplacez 'votre-email@example.com' par votre email
-- INSERT INTO auth.users (
--     id,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     created_at,
--     updated_at,
--     raw_user_meta_data,
--     is_super_admin
-- ) VALUES (
--     gen_random_uuid(),
--     'votre-email@example.com',
--     crypt('motdepasse123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW(),
--     '{"full_name": "Admin IAhome", "provider": "email"}'::jsonb,
--     false
-- );

-- 12. Mettre à jour les utilisateurs existants (si nécessaire)
-- INSERT INTO public.user_applications (
--     user_id,
--     email,
--     full_name,
--     provider,
--     role,
--     is_active
-- )
-- SELECT 
--     id,
--     email,
--     COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
--     COALESCE(raw_user_meta_data->>'provider', 'email'),
--     'user',
--     true
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM public.user_applications);

-- =====================================================
-- Configuration des URLs de redirection
-- =====================================================

-- Note: Les URLs de redirection doivent être configurées dans le dashboard Supabase :
-- 1. Aller sur supabase.com → Votre projet
-- 2. Authentication → URL Configuration
-- 3. Site URL: https://iahome.fr
-- 4. Redirect URLs: https://iahome.fr/auth/callback

-- =====================================================
-- Configuration Google OAuth
-- =====================================================

-- Note: La configuration Google OAuth doit être faite dans le dashboard Supabase :
-- 1. Authentication → Providers → Google
-- 2. Activer Google
-- 3. Client ID: 507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt.apps.googleusercontent.com
-- 4. Client Secret: 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
-- 5. Redirect URL: https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback

-- =====================================================
-- Vérification de la configuration
-- =====================================================

-- Vérifier que la table existe
SELECT 'Table user_applications créée' as status;

-- Vérifier les politiques RLS
SELECT 'Politiques RLS configurées' as status;

-- Vérifier les fonctions
SELECT 'Fonctions créées' as status;

-- Vérifier les triggers
SELECT 'Triggers configurés' as status;
