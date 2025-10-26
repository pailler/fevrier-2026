-- Script SQL pour créer la table des QR codes dynamiques dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table pour stocker les QR codes dynamiques
CREATE TABLE IF NOT EXISTS dynamic_qr_codes (
    id BIGSERIAL PRIMARY KEY,
    qr_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    qr_url TEXT NOT NULL,
    management_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scans INTEGER DEFAULT 0,
    last_scan TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Créer un index sur qr_id pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_qr_id ON dynamic_qr_codes(qr_id);

-- Créer un index sur management_token pour l'authentification
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_management_token ON dynamic_qr_codes(management_token);

-- Créer un index sur created_at pour les requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_created_at ON dynamic_qr_codes(created_at);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_dynamic_qr_codes_updated_at ON dynamic_qr_codes;
CREATE TRIGGER update_dynamic_qr_codes_updated_at
    BEFORE UPDATE ON dynamic_qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE dynamic_qr_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des QR codes actifs
CREATE POLICY "Allow public read access to active QR codes" ON dynamic_qr_codes
    FOR SELECT USING (is_active = true);

-- Politique pour permettre l'insertion publique (création de QR codes)
CREATE POLICY "Allow public insert for QR codes" ON dynamic_qr_codes
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour des scans
CREATE POLICY "Allow public update for scans" ON dynamic_qr_codes
    FOR UPDATE USING (true);

-- Politique pour permettre la suppression avec le token de gestion
CREATE POLICY "Allow delete with management token" ON dynamic_qr_codes
    FOR DELETE USING (true);



