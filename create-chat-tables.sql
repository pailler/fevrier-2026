-- Création de la table pour les conversations de chat IA

CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_chat_conversations_updated_at 
    BEFORE UPDATE ON chat_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs ne peuvent voir que leurs propres conversations
CREATE POLICY "Users can manage their own chat conversations" ON chat_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Table pour les statistiques de chat (optionnel)
CREATE TABLE IF NOT EXISTS chat_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_messages INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les statistiques
CREATE INDEX IF NOT EXISTS idx_chat_stats_user_id ON chat_stats(user_id);

-- Trigger pour les statistiques
CREATE TRIGGER update_chat_stats_updated_at 
    BEFORE UPDATE ON chat_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS pour les statistiques
ALTER TABLE chat_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat stats" ON chat_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement les statistiques
CREATE OR REPLACE FUNCTION update_chat_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chat_stats (user_id, total_messages, total_conversations, last_activity)
    VALUES (NEW.user_id, 1, 1, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_messages = chat_stats.total_messages + 1,
        total_conversations = chat_stats.total_conversations + 1,
        last_activity = NOW(),
        updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour les statistiques automatiquement
CREATE TRIGGER update_chat_stats_trigger
    AFTER INSERT ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_chat_stats();
