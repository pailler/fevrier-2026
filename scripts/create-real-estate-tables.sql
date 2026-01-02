-- Table pour stocker les critères de recherche
CREATE TABLE IF NOT EXISTS real_estate_search_criteria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    min_surface DECIMAL(8, 2),
    max_surface DECIMAL(8, 2),
    region VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    city VARCHAR(255),
    property_type VARCHAR(50) DEFAULT 'house',
    style_preferences JSONB,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les biens immobiliers trouvés
CREATE TABLE IF NOT EXISTS real_estate_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_criteria_id UUID REFERENCES real_estate_search_criteria(id) ON DELETE SET NULL,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'leboncoin', 'seloger', 'pap', 'local', etc.
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    surface DECIMAL(8, 2),
    rooms INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    property_type VARCHAR(50),
    address TEXT,
    city VARCHAR(255),
    postal_code VARCHAR(20),
    department VARCHAR(100),
    region VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    url TEXT NOT NULL,
    images TEXT[],
    energy_class VARCHAR(10),
    greenhouse_gas_emission VARCHAR(10),
    year_built INTEGER,
    features JSONB, -- Stocke les caractéristiques spécifiques (jardin, garage, etc.)
    contact_info JSONB,
    is_new BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    notes TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(external_id, source)
);

-- Table pour l'historique des recherches
CREATE TABLE IF NOT EXISTS real_estate_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_criteria_id UUID REFERENCES real_estate_search_criteria(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    properties_found INTEGER DEFAULT 0,
    new_properties INTEGER DEFAULT 0,
    search_duration_ms INTEGER,
    search_status VARCHAR(50) DEFAULT 'success', -- 'success', 'error', 'partial'
    error_message TEXT,
    search_params JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS real_estate_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES real_estate_properties(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'new_property', 'price_drop', 'new_match'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_real_estate_search_criteria_user_id ON real_estate_search_criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_search_criteria_active ON real_estate_search_criteria(is_active);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_search_criteria_id ON real_estate_properties(search_criteria_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_source ON real_estate_properties(source);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_external_id_source ON real_estate_properties(external_id, source);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_location ON real_estate_properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_price ON real_estate_properties(price);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_surface ON real_estate_properties(surface);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_new ON real_estate_properties(is_new);
CREATE INDEX IF NOT EXISTS idx_real_estate_properties_favorite ON real_estate_properties(is_favorite);
CREATE INDEX IF NOT EXISTS idx_real_estate_search_history_criteria_id ON real_estate_search_history(search_criteria_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_search_history_executed_at ON real_estate_search_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_real_estate_notifications_user_id ON real_estate_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_notifications_read ON real_estate_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_real_estate_notifications_created_at ON real_estate_notifications(created_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_real_estate_search_criteria_updated_at BEFORE UPDATE ON real_estate_search_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_real_estate_properties_updated_at BEFORE UPDATE ON real_estate_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Politique pour que les utilisateurs ne voient que leurs propres données
ALTER TABLE real_estate_search_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour real_estate_search_criteria
CREATE POLICY "Users can view their own search criteria" ON real_estate_search_criteria
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search criteria" ON real_estate_search_criteria
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search criteria" ON real_estate_search_criteria
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search criteria" ON real_estate_search_criteria
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour real_estate_properties (via search_criteria)
CREATE POLICY "Users can view properties from their searches" ON real_estate_properties
    FOR SELECT USING (
        search_criteria_id IN (
            SELECT id FROM real_estate_search_criteria WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert properties for their searches" ON real_estate_properties
    FOR INSERT WITH CHECK (
        search_criteria_id IN (
            SELECT id FROM real_estate_search_criteria WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their properties" ON real_estate_properties
    FOR UPDATE USING (
        search_criteria_id IN (
            SELECT id FROM real_estate_search_criteria WHERE user_id = auth.uid()
        )
    );

-- Politiques RLS pour real_estate_search_history
CREATE POLICY "Users can view their own search history" ON real_estate_search_history
    FOR SELECT USING (
        search_criteria_id IN (
            SELECT id FROM real_estate_search_criteria WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own search history" ON real_estate_search_history
    FOR INSERT WITH CHECK (
        search_criteria_id IN (
            SELECT id FROM real_estate_search_criteria WHERE user_id = auth.uid()
        )
    );

-- Politiques RLS pour real_estate_notifications
CREATE POLICY "Users can view their own notifications" ON real_estate_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON real_estate_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON real_estate_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
