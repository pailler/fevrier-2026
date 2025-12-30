-- Script SQL pour vérifier le module ai-detector dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- ============================================
-- 1. VÉRIFIER LA TABLE 'modules'
-- ============================================
-- Cette table contient tous les modules disponibles
-- Le module doit avoir l'ID exact 'ai-detector'

SELECT 
  id,
  title,
  description,
  category,
  price,
  url,
  image_url,
  is_active,
  created_at,
  updated_at
FROM modules
WHERE id = 'ai-detector';

-- Si aucun résultat, le module n'existe pas dans la table modules
-- Solution : Exécuter le script add-ai-detector-module.sql

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
WHERE module_id = 'ai-detector'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 3. VÉRIFIER TOUS LES MODULES SIMILAIRES
-- ============================================
-- Chercher tous les modules avec "detect" ou "detector" dans le nom

SELECT 
  id,
  title,
  category,
  price,
  is_active
FROM modules
WHERE id ILIKE '%detect%'
   OR title ILIKE '%detect%'
   OR title ILIKE '%détecteur%'
ORDER BY created_at DESC;

-- ============================================
-- 4. LISTER TOUS LES MODULES (pour référence)
-- ============================================

SELECT 
  id,
  title,
  category,
  price,
  is_active,
  created_at
FROM modules
ORDER BY created_at DESC;

