-- =====================================================
-- Recréer la table user_applications depuis zéro
-- =====================================================

-- 1. Supprimer la table existante (ATTENTION: cela supprimera toutes les données)
DROP TABLE IF EXISTS public.user_applications CASCADE;

-- 2. Créer la nouvelle table avec la structure correcte
CREATE TABLE public.user_applications (
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

-- 3. Créer les index
CREATE INDEX idx_user_applications_user_id ON public.user_applications(user_id);
CREATE INDEX idx_user_applications_email ON public.user_applications(email);
CREATE INDEX idx_user_applications_role ON public.user_applications(role);

-- 4. Activer RLS
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
CREATE POLICY "Users can view own data" ON public.user_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON public.user_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.user_applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all data" ON public.user_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_applications 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Créer la fonction pour synchroniser les utilisateurs
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

-- 7. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Créer la fonction pour mettre à jour last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_applications 
    SET last_login = NOW(), updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer le trigger pour last_login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_last_login();

-- 10. Créer les fonctions utilitaires
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

-- 11. Migrer les utilisateurs existants
INSERT INTO public.user_applications (
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
FROM auth.users;

-- 12. Vérifier la structure finale
SELECT 'Table user_applications recréée avec succès!' as status;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
