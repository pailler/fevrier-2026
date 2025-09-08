-- =====================================================
-- Créer la table user_views pour IAhome
-- =====================================================

-- 1. Créer la table user_views
CREATE TABLE IF NOT EXISTS public.user_views (
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

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_views_user_id ON public.user_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_views_email ON public.user_views(email);
CREATE INDEX IF NOT EXISTS idx_user_views_role ON public.user_views(role);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.user_views ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour que les utilisateurs puissent voir leurs propres données
CREATE POLICY "Users can view own data" ON public.user_views
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leurs propres données
CREATE POLICY "Users can insert own data" ON public.user_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON public.user_views
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les admins (peuvent voir toutes les données)
CREATE POLICY "Admins can view all data" ON public.user_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_views 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Créer une fonction pour synchroniser les utilisateurs auth.users avec user_views
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_views (
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

-- 6. Créer un trigger pour automatiquement créer un enregistrement dans user_views
-- quand un nouvel utilisateur s'inscrit
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Créer une fonction pour mettre à jour last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_views 
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
        FROM public.user_views 
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
        uv.id,
        uv.email,
        uv.full_name,
        uv.avatar_url,
        uv.provider,
        uv.role,
        uv.is_active,
        uv.last_login
    FROM public.user_views uv
    WHERE uv.user_id = user_uuid AND uv.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Migrer les utilisateurs existants depuis auth.users
INSERT INTO public.user_views (
    user_id,
    email,
    full_name,
    provider,
    role,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
    COALESCE(raw_user_meta_data->>'provider', 'email'),
    'user',
    true,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_views);

-- 12. Vérifier la structure finale
SELECT 'Table user_views créée avec succès!' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 13. Afficher le nombre d'utilisateurs migrés
SELECT COUNT(*) as total_users FROM public.user_views;
