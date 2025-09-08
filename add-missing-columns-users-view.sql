-- =====================================================
-- Ajouter les colonnes manquantes à users_view pour Google OAuth
-- =====================================================

-- 1. Ajouter les colonnes manquantes
DO $$
BEGIN
    -- Ajouter user_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users_view' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users_view ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonne user_id ajoutée';
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

-- 2. Mettre à jour les colonnes avec des valeurs par défaut
UPDATE public.users_view 
SET 
    provider = COALESCE(provider, 'email'),
    is_active = COALESCE(is_active, true),
    updated_at = COALESCE(updated_at, NOW())
WHERE provider IS NULL OR is_active IS NULL;

-- 3. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_view_user_id ON public.users_view(user_id);
CREATE INDEX IF NOT EXISTS idx_users_view_email ON public.users_view(email);
CREATE INDEX IF NOT EXISTS idx_users_view_provider ON public.users_view(provider);

-- 4. Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.users_view ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques RLS de base
DROP POLICY IF EXISTS "Users can view own data" ON public.users_view;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users_view;
DROP POLICY IF EXISTS "Users can update own data" ON public.users_view;

CREATE POLICY "Users can view own data" ON public.users_view
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON public.users_view
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.users_view
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Vérifier la structure finale
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

-- 7. Afficher un échantillon des données
SELECT 'Échantillon des données:' as info;
SELECT * FROM public.users_view LIMIT 3;
