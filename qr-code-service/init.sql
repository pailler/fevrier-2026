-- Script d'initialisation de la base de données pour le service QR Code Dynamique

-- Créer la table pour les utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table pour les QR codes dynamiques
CREATE TABLE IF NOT EXISTS dynamic_qr_codes (
    id SERIAL PRIMARY KEY,
    qr_id VARCHAR(8) UNIQUE NOT NULL,
    name VARCHAR(255),
    url TEXT NOT NULL,
    qr_url TEXT NOT NULL,
    size INTEGER DEFAULT 300,
    margin INTEGER DEFAULT 4,
    error_correction VARCHAR(1) DEFAULT 'M',
    scans INTEGER DEFAULT 0,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scan TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Créer la table pour les statistiques de scans
CREATE TABLE IF NOT EXISTS scan_statistics (
    id SERIAL PRIMARY KEY,
    qr_id VARCHAR(8) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qr_id) REFERENCES dynamic_qr_codes(qr_id) ON DELETE CASCADE
);

-- Créer la table pour l'historique des modifications
CREATE TABLE IF NOT EXISTS qr_code_history (
    id SERIAL PRIMARY KEY,
    qr_id VARCHAR(8) NOT NULL,
    old_url TEXT,
    new_url TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qr_id) REFERENCES dynamic_qr_codes(qr_id) ON DELETE CASCADE
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_qr_id ON dynamic_qr_codes(qr_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_user_id ON dynamic_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_codes_created_at ON dynamic_qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_qr_id ON scan_statistics(qr_id);
CREATE INDEX IF NOT EXISTS idx_scan_statistics_scanned_at ON scan_statistics(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_code_history_qr_id ON qr_code_history(qr_id);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_dynamic_qr_codes_updated_at 
    BEFORE UPDATE ON dynamic_qr_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques données de test (optionnel)
INSERT INTO dynamic_qr_codes (qr_id, name, url, qr_url, size, margin, error_correction) 
VALUES 
    ('test1234', 'QR Code de test', 'https://www.google.com', 'http://localhost:7005/r/test1234', 300, 4, 'M')
ON CONFLICT (qr_id) DO NOTHING;
