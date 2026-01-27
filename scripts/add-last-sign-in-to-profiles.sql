-- Script SQL pour ajouter la colonne last_sign_in_at à la table profiles
-- À exécuter dans Supabase SQL Editor si la colonne n'existe pas déjà

-- Vérifier et ajouter la colonne last_sign_in_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_sign_in_at'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Colonne last_sign_in_at ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'La colonne last_sign_in_at existe déjà dans la table profiles';
    END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in_at ON profiles(last_sign_in_at);

-- Commentaire sur la colonne
COMMENT ON COLUMN profiles.last_sign_in_at IS 'Date et heure de la dernière connexion de l''utilisateur';
