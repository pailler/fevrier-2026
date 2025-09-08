-- =====================================================
-- Ajouter la colonne email à la table user_views
-- =====================================================

-- 1. Vérifier d'abord la structure actuelle
SELECT 'Structure actuelle de user_views:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne email si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonne email ajoutée à user_views';
    ELSE
        RAISE NOTICE 'Colonne email existe déjà dans user_views';
    END IF;
END $$;

-- 3. Ajouter d'autres colonnes utiles pour l'authentification si elles n'existent pas
DO $$
BEGIN
    -- Ajouter full_name si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Colonne full_name ajoutée';
    END IF;

    -- Ajouter avatar_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Colonne avatar_url ajoutée';
    END IF;

    -- Ajouter provider si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'provider'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
        RAISE NOTICE 'Colonne provider ajoutée';
    END IF;

    -- Ajouter role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Colonne role ajoutée';
    END IF;

    -- Ajouter is_active si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne is_active ajoutée';
    END IF;

    -- Ajouter last_login si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_views' 
        AND column_name = 'last_login'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_views ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne last_login ajoutée';
    END IF;
END $$;

-- 4. Mettre à jour les colonnes avec des valeurs par défaut
UPDATE public.user_views 
SET 
    email = COALESCE(email, 'unknown@example.com'),
    full_name = COALESCE(full_name, 'Utilisateur'),
    provider = COALESCE(provider, 'email'),
    role = COALESCE(role, 'user'),
    is_active = COALESCE(is_active, true)
WHERE email IS NULL OR full_name IS NULL OR provider IS NULL OR role IS NULL OR is_active IS NULL;

-- 5. Créer un index sur email pour les performances
CREATE INDEX IF NOT EXISTS idx_user_views_email ON public.user_views(email);
CREATE INDEX IF NOT EXISTS idx_user_views_role ON public.user_views(role);

-- 6. Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.user_views ENABLE ROW LEVEL SECURITY;

-- 7. Créer des politiques RLS de base
DROP POLICY IF EXISTS "Users can view own data" ON public.user_views;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_views;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_views;

CREATE POLICY "Users can view own data" ON public.user_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON public.user_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.user_views
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. Vérifier la structure finale
SELECT 'Structure finale de user_views:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Afficher un échantillon des données
SELECT 'Échantillon des données:' as info;
SELECT * FROM public.user_views LIMIT 5;
