-- =====================================================
-- Ajouter les colonnes manquantes à users_view
-- =====================================================

-- 1. Vérifier d'abord la structure actuelle
SELECT 'Structure actuelle de users_view:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter la colonne email si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonne email ajoutée à users_view';
    ELSE
        RAISE NOTICE 'Colonne email existe déjà dans users_view';
    END IF;

    -- Ajouter full_name si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Colonne full_name ajoutée';
    END IF;

    -- Ajouter avatar_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Colonne avatar_url ajoutée';
    END IF;

    -- Ajouter provider si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'provider'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
        RAISE NOTICE 'Colonne provider ajoutée';
    END IF;

    -- Ajouter provider_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'provider_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN provider_id VARCHAR(255);
        RAISE NOTICE 'Colonne provider_id ajoutée';
    END IF;

    -- Ajouter role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Colonne role ajoutée';
    END IF;

    -- Ajouter is_active si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne is_active ajoutée';
    END IF;

    -- Ajouter last_login si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'last_login'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne last_login ajoutée';
    END IF;

    -- Ajouter created_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée';
    END IF;

    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    END IF;
END $$;

-- 3. Mettre à jour les colonnes existantes avec des valeurs par défaut
UPDATE public.users_view 
SET 
    email = COALESCE(email, 'unknown@example.com'),
    full_name = COALESCE(full_name, 'Utilisateur'),
    provider = COALESCE(provider, 'email'),
    role = COALESCE(role, 'user'),
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE email IS NULL OR full_name IS NULL OR provider IS NULL OR role IS NULL OR is_active IS NULL;

-- 4. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_view_user_id ON public.users_view(user_id);
CREATE INDEX IF NOT EXISTS idx_users_view_email ON public.users_view(email);
CREATE INDEX IF NOT EXISTS idx_users_view_role ON public.users_view(role);

-- 5. Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.users_view ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques s'elles existent
DROP POLICY IF EXISTS "Users can view own data" ON public.users_view;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users_view;
DROP POLICY IF EXISTS "Users can update own data" ON public.users_view;
DROP POLICY IF EXISTS "Admins can view all data" ON public.users_view;

-- 7. Créer les nouvelles politiques RLS
CREATE POLICY "Users can view own data" ON public.users_view
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON public.users_view
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.users_view
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all data" ON public.users_view
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users_view 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Vérifier la structure finale
SELECT 'Structure finale de users_view:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Afficher un échantillon des données
SELECT 'Échantillon des données:' as info;
SELECT * FROM public.users_view LIMIT 5;
