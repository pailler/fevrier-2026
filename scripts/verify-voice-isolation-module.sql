-- Script SQL pour vérifier le module voice-isolation dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- ============================================
-- 1. VÉRIFIER LA TABLE 'modules'
-- ============================================
-- Cette table contient tous les modules disponibles
-- Le module doit avoir l'ID exact 'voice-isolation'

SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  created_at,
  updated_at
FROM modules
WHERE id = 'voice-isolation';

-- Si aucun résultat, le module n'existe pas dans la table modules
-- Solution : Exécuter le script add-voice-isolation-module.sql

-- ============================================
-- 2. VÉRIFIER LA TABLE 'user_applications'
-- ============================================
-- Cette table contient les accès des utilisateurs aux modules
-- Vérifier si des utilisateurs ont déjà activé ce module

SELECT 
  id,
  user_id,
  module_id,
  module_title,
  is_active,
  expires_at,
  created_at
FROM user_applications
WHERE module_id = 'voice-isolation'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 3. VÉRIFIER TOUS LES MODULES SIMILAIRES
-- ============================================
-- Chercher tous les modules avec "voice", "isolation" ou "vocale" dans le nom

SELECT 
  id,
  title,
  category,
  price,
  created_at
FROM modules
WHERE id ILIKE '%voice%'
   OR id ILIKE '%isolation%'
   OR title ILIKE '%voice%'
   OR title ILIKE '%isolation%'
   OR title ILIKE '%vocale%'
ORDER BY created_at DESC;

-- ============================================
-- 4. LISTER TOUS LES MODULES (pour référence)
-- ============================================

SELECT 
  id,
  title,
  category,
  price,
  created_at
FROM modules
ORDER BY created_at DESC;
