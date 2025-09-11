-- Script SQL pour créer le système de portfolio photo intelligent avec LangChain + Supabase
-- Exécuter ce script dans Supabase SQL Editor

-- 0. Activer l'extension vectorielle (requis pour les embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Table pour stocker les métadonnées des photos
CREATE TABLE IF NOT EXISTS photo_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table pour stocker les descriptions et embeddings des photos
CREATE TABLE IF NOT EXISTS photo_descriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES photo_metadata(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT true,
    tags TEXT[],
    categories TEXT[],
    location TEXT,
    date_taken TIMESTAMP WITH TIME ZONE,
    camera_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table pour stocker les embeddings vectoriels
CREATE TABLE IF NOT EXISTS photo_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES photo_metadata(id) ON DELETE CASCADE,
    embedding VECTOR(1536), -- Dimension pour OpenAI embeddings
    model_name TEXT DEFAULT 'text-embedding-3-small',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table pour les collections de photos
CREATE TABLE IF NOT EXISTS photo_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    cover_photo_id UUID REFERENCES photo_metadata(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table de liaison entre collections et photos
CREATE TABLE IF NOT EXISTS collection_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES photo_collections(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photo_metadata(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, photo_id)
);

-- 6. Table pour les recherches sauvegardées
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table pour les statistiques d'utilisation
CREATE TABLE IF NOT EXISTS photo_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES photo_metadata(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    last_searched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_photo_metadata_user_id ON photo_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_metadata_created_at ON photo_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_photo_descriptions_photo_id ON photo_descriptions(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_descriptions_tags ON photo_descriptions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_photo_descriptions_categories ON photo_descriptions USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_photo_embeddings_photo_id ON photo_embeddings(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_collections_user_id ON photo_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_photos_collection_id ON collection_photos(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_photos_photo_id ON collection_photos(photo_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_analytics_photo_id ON photo_analytics(photo_id);

-- Créer l'index vectoriel pour la recherche sémantique
CREATE INDEX IF NOT EXISTS idx_photo_embeddings_vector ON photo_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_photo_metadata_updated_at BEFORE UPDATE ON photo_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_descriptions_updated_at BEFORE UPDATE ON photo_descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_collections_updated_at BEFORE UPDATE ON photo_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_analytics_updated_at BEFORE UPDATE ON photo_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour rechercher des photos par similarité sémantique
CREATE OR REPLACE FUNCTION search_photos_by_similarity(
    query_embedding VECTOR(1536),
    user_id_param UUID DEFAULT NULL,
    limit_param INTEGER DEFAULT 10,
    threshold_param FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    photo_id UUID,
    file_name TEXT,
    file_path TEXT,
    description TEXT,
    tags TEXT[],
    categories TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.id as photo_id,
        pm.file_name,
        pm.file_path,
        pd.description,
        pd.tags,
        pd.categories,
        1 - (pe.embedding <=> query_embedding) as similarity
    FROM photo_embeddings pe
    JOIN photo_metadata pm ON pe.photo_id = pm.id
    JOIN photo_descriptions pd ON pm.id = pd.photo_id
    WHERE 
        (user_id_param IS NULL OR pm.user_id = user_id_param)
        AND 1 - (pe.embedding <=> query_embedding) > threshold_param
    ORDER BY pe.embedding <=> query_embedding
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_photo_stats(user_id_param UUID)
RETURNS TABLE (
    total_photos BIGINT,
    total_size BIGINT,
    total_views BIGINT,
    total_downloads BIGINT,
    most_viewed_photo TEXT,
    recent_uploads BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(pm.id) as total_photos,
        COALESCE(SUM(pm.file_size), 0) as total_size,
        COALESCE(SUM(pa.view_count), 0) as total_views,
        COALESCE(SUM(pa.download_count), 0) as total_downloads,
        (SELECT file_name FROM photo_metadata pm2 
         JOIN photo_analytics pa2 ON pm2.id = pa2.photo_id 
         WHERE pm2.user_id = user_id_param 
         ORDER BY pa2.view_count DESC LIMIT 1) as most_viewed_photo,
        (SELECT COUNT(*) FROM photo_metadata pm3 
         WHERE pm3.user_id = user_id_param 
         AND pm3.created_at > NOW() - INTERVAL '7 days') as recent_uploads
    FROM photo_metadata pm
    LEFT JOIN photo_analytics pa ON pm.id = pa.photo_id
    WHERE pm.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS (Row Level Security)
ALTER TABLE photo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques pour photo_metadata
CREATE POLICY "Users can view their own photos" ON photo_metadata
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON photo_metadata
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON photo_metadata
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON photo_metadata
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour photo_descriptions
CREATE POLICY "Users can view descriptions of their photos" ON photo_descriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_descriptions.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert descriptions for their photos" ON photo_descriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_descriptions.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update descriptions of their photos" ON photo_descriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_descriptions.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete descriptions of their photos" ON photo_descriptions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_descriptions.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

-- Politiques pour photo_embeddings
CREATE POLICY "Users can view embeddings of their photos" ON photo_embeddings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_embeddings.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert embeddings for their photos" ON photo_embeddings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_embeddings.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

-- Politiques pour photo_collections
CREATE POLICY "Users can view their own collections" ON photo_collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON photo_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON photo_collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON photo_collections
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour collection_photos
CREATE POLICY "Users can manage photos in their collections" ON collection_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM photo_collections pc 
            WHERE pc.id = collection_photos.collection_id 
            AND pc.user_id = auth.uid()
        )
    );

-- Politiques pour saved_searches
CREATE POLICY "Users can manage their own searches" ON saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour photo_analytics
CREATE POLICY "Users can view analytics of their photos" ON photo_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_analytics.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analytics of their photos" ON photo_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM photo_metadata pm 
            WHERE pm.id = photo_analytics.photo_id 
            AND pm.user_id = auth.uid()
        )
    );

-- Message de confirmation
SELECT 'Schema créé avec succès! Tables: photo_metadata, photo_descriptions, photo_embeddings, photo_collections, collection_photos, saved_searches, photo_analytics' as status;
