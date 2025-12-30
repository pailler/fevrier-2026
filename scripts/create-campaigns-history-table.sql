-- Script SQL pour créer la table d'historique des campagnes
-- À exécuter dans Supabase SQL Editor

-- Table d'historique des modifications de métriques
CREATE TABLE IF NOT EXISTS advertising_campaigns_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES advertising_campaigns(id) ON DELETE CASCADE,
  
  -- Métriques au moment de l'enregistrement
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  spent DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0,
  cpc DECIMAL(10, 2) DEFAULT 0,
  cpl DECIMAL(10, 2) DEFAULT 0,
  cpa DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(5, 2) DEFAULT 0,
  
  -- Métadonnées
  notes TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_campaigns_history_campaign ON advertising_campaigns_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_history_created_at ON advertising_campaigns_history(created_at);

-- Fonction pour enregistrer automatiquement l'historique
CREATE OR REPLACE FUNCTION log_campaign_metrics_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Enregistrer dans l'historique si les métriques ont changé
  IF OLD.impressions IS DISTINCT FROM NEW.impressions OR
     OLD.clicks IS DISTINCT FROM NEW.clicks OR
     OLD.conversions IS DISTINCT FROM NEW.conversions OR
     OLD.purchases IS DISTINCT FROM NEW.purchases OR
     OLD.spent IS DISTINCT FROM NEW.spent THEN
    
    INSERT INTO advertising_campaigns_history (
      campaign_id,
      impressions,
      clicks,
      conversions,
      purchases,
      spent,
      revenue,
      ctr,
      cpc,
      cpl,
      cpa,
      roi,
      updated_by
    ) VALUES (
      NEW.id,
      NEW.impressions,
      NEW.clicks,
      NEW.conversions,
      NEW.purchases,
      NEW.spent,
      NEW.revenue,
      NEW.ctr,
      NEW.cpc,
      NEW.cpl,
      NEW.cpa,
      NEW.roi,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer automatiquement l'historique
CREATE TRIGGER log_campaign_metrics_trigger
  AFTER UPDATE ON advertising_campaigns
  FOR EACH ROW
  WHEN (
    OLD.impressions IS DISTINCT FROM NEW.impressions OR
    OLD.clicks IS DISTINCT FROM NEW.clicks OR
    OLD.conversions IS DISTINCT FROM NEW.conversions OR
    OLD.purchases IS DISTINCT FROM NEW.purchases OR
    OLD.spent IS DISTINCT FROM NEW.spent
  )
  EXECUTE FUNCTION log_campaign_metrics_history();

-- Commentaires
COMMENT ON TABLE advertising_campaigns_history IS 'Historique des modifications de métriques des campagnes';
COMMENT ON COLUMN advertising_campaigns_history.campaign_id IS 'ID de la campagne concernée';

