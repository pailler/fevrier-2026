-- Script SQL pour créer la table des campagnes publicitaires
-- À exécuter dans Supabase SQL Editor

-- Table des campagnes
CREATE TABLE IF NOT EXISTS advertising_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'google', 'other')),
  template_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Budget
  budget_daily DECIMAL(10, 2) NOT NULL,
  budget_total DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métriques (mises à jour manuellement ou via API)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculés
  ctr DECIMAL(5, 2) DEFAULT 0, -- Taux de clic en %
  cpc DECIMAL(10, 2) DEFAULT 0, -- Coût par clic
  cpl DECIMAL(10, 2) DEFAULT 0, -- Coût par lead
  cpa DECIMAL(10, 2) DEFAULT 0, -- Coût par acquisition
  roi DECIMAL(5, 2) DEFAULT 0, -- Retour sur investissement en %
  
  -- Configuration
  audience_size VARCHAR(50),
  audience_location TEXT,
  creative_type VARCHAR(50),
  landing_page_url TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Utilisateur qui a créé la campagne
  created_by UUID REFERENCES profiles(id),
  
  -- Métadonnées
  metadata JSONB,
  
  -- Tags et catégories
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  
  -- Objectifs
  target_impressions INTEGER,
  target_clicks INTEGER,
  target_conversions INTEGER,
  target_purchases INTEGER,
  target_roi DECIMAL(5, 2)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON advertising_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON advertising_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON advertising_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON advertising_campaigns(created_by);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON advertising_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- Commentaires
COMMENT ON TABLE advertising_campaigns IS 'Table pour stocker les campagnes publicitaires actives';
COMMENT ON COLUMN advertising_campaigns.platform IS 'Plateforme publicitaire : facebook, google, other';
COMMENT ON COLUMN advertising_campaigns.status IS 'Statut : draft, active, paused, completed, cancelled';
COMMENT ON COLUMN advertising_campaigns.ctr IS 'Taux de clic en pourcentage';
COMMENT ON COLUMN advertising_campaigns.roi IS 'Retour sur investissement en pourcentage';

