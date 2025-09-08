-- =====================================================
-- Correction de la table user_applications existante
-- =====================================================

-- 1. Vérifier d'abord la structure actuelle
SELECT 'Structure actuelle de user_applications:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter la colonne email si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonne email ajoutée';
    END IF;

    -- Ajouter la colonne full_name si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Colonne full_name ajoutée';
    END IF;

    -- Ajouter la colonne avatar_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Colonne avatar_url ajoutée';
    END IF;

    -- Ajouter la colonne provider si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'provider'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
        RAISE NOTICE 'Colonne provider ajoutée';
    END IF;

    -- Ajouter la colonne provider_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'provider_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN provider_id VARCHAR(255);
        RAISE NOTICE 'Colonne provider_id ajoutée';
    END IF;

    -- Ajouter la colonne role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Colonne role ajoutée';
    END IF;

    -- Ajouter la colonne is_active si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne is_active ajoutée';
    END IF;

    -- Ajouter la colonne last_login si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'last_login'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne last_login ajoutée';
    END IF;

    -- Ajouter la colonne created_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée';
    END IF;

    -- Ajouter la colonne updated_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_applications' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    END IF;
END $$;

-- 3. Mettre à jour les colonnes existantes avec des valeurs par défaut
UPDATE public.user_applications 
SET 
    email = COALESCE(email, 'unknown@example.com'),
    full_name = COALESCE(full_name, 'Utilisateur'),
    provider = COALESCE(provider, 'email'),
    role = COALESCE(role, 'user'),
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE email IS NULL OR full_name IS NULL OR provider IS NULL OR role IS NULL OR is_active IS NULL;

-- 4. Ajouter des contraintes si nécessaire
DO $$
BEGIN
    -- Ajouter une contrainte NOT NULL sur email si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_applications' 
        AND constraint_name = 'user_applications_email_not_null'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_applications ALTER COLUMN email SET NOT NULL;
        RAISE NOTICE 'Contrainte NOT NULL ajoutée sur email';
    END IF;
END $$;

-- 5. Créer des index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON public.user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_email ON public.user_applications(email);
CREATE INDEX IF NOT EXISTS idx_user_applications_role ON public.user_applications(role);

-- 6. Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes politiques s'elles existent
DROP POLICY IF EXISTS "Users can view own data" ON public.user_applications;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_applications;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_applications;
DROP POLICY IF EXISTS "Admins can view all data" ON public.user_applications;

-- 8. Créer les nouvelles politiques RLS
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

-- 9. Vérifier la structure finale
SELECT 'Structure finale de user_applications:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
