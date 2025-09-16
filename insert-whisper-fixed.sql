-- Requête SQL corrigée pour insérer le module Whisper IA
-- (sans la colonne subtitle qui n'existe pas)

INSERT INTO modules (id, title, description, category, price, youtube_url, url, image_url, created_at, updated_at)
VALUES (
    'whisper',
    'Whisper IA',
    'Intelligence artificielle multimédia - Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR. Transcription audio, vidéo et reconnaissance de texte (OCR).',
    'Productivité',
    0,
    '',
    'https://whisper.iahome.fr',
    '/images/module-visuals/whisper-module.svg',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    youtube_url = EXCLUDED.youtube_url,
    url = EXCLUDED.url,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();



