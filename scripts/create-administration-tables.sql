-- Script SQL pour créer les tables des services administratifs
-- À exécuter dans Supabase SQL Editor

-- Table des catégories
CREATE TABLE IF NOT EXISTS administration_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS administration_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES administration_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon VARCHAR(50),
  is_popular BOOLEAN DEFAULT false,
  app_store_url TEXT,
  play_store_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des vérifications d'URL
CREATE TABLE IF NOT EXISTS administration_url_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES administration_services(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status_code INTEGER,
  is_valid BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_categories_name ON administration_categories(name);
CREATE INDEX IF NOT EXISTS idx_admin_categories_order ON administration_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_admin_services_category ON administration_services(category_id);
CREATE INDEX IF NOT EXISTS idx_admin_services_order ON administration_services(display_order);
CREATE INDEX IF NOT EXISTS idx_admin_url_checks_service ON administration_url_checks(service_id);
CREATE INDEX IF NOT EXISTS idx_admin_url_checks_last_checked ON administration_url_checks(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_admin_url_checks_valid ON administration_url_checks(is_valid);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_administration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_admin_categories_updated_at ON administration_categories;
CREATE TRIGGER update_admin_categories_updated_at
  BEFORE UPDATE ON administration_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_administration_updated_at();

DROP TRIGGER IF EXISTS update_admin_services_updated_at ON administration_services;
CREATE TRIGGER update_admin_services_updated_at
  BEFORE UPDATE ON administration_services
  FOR EACH ROW
  EXECUTE FUNCTION update_administration_updated_at();








