-- Créer la table modules si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0.00,
    icon VARCHAR(10),
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer quelques modules de test
INSERT INTO public.modules (title, description, category, price, icon, is_paid) VALUES
('Whisper IA', 'Transcription audio en texte avec IA', 'Audio', 0.10, '🎤', true),
('Stable Diffusion', 'Génération d\'images par IA', 'Image', 0.05, '🎨', true),
('PDF Converter', 'Conversion et manipulation de PDF', 'Document', 0.02, '📄', true),
('QR Code Generator', 'Génération de codes QR', 'Utilitaire', 0.01, '📱', true),
('LibreSpeed', 'Test de vitesse internet', 'Réseau', 0.00, '⚡', false),
('PsiTransfer', 'Transfert de fichiers sécurisé', 'Fichier', 0.00, '📁', false)
ON CONFLICT (title) DO NOTHING;

-- Activer RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "Allow public read access to modules" ON public.modules
FOR SELECT USING (true);
