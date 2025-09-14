# Script pour insérer directement le module Whisper dans la base de données
Write-Host "🔄 Insertion directe du module Whisper IA..." -ForegroundColor Blue

# Configuration Supabase (remplacez par vos vraies valeurs)
$SUPABASE_URL = "https://your-project.supabase.co"
$SUPABASE_ANON_KEY = "your-anon-key"

# Données du module Whisper
$moduleData = @{
    id = "whisper"
    title = "Whisper IA"
    description = "Intelligence artificielle multimédia - Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR."
    subtitle = "Transcription audio, vidéo et reconnaissance de texte (OCR)"
    category = "Productivité"
    price = 0
    youtube_url = ""
    url = "https://whisper.iahome.fr"
    image_url = "/images/module-visuals/whisper-module.svg"
    created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

Write-Host "📊 Données du module:" -ForegroundColor Cyan
Write-Host $moduleData -ForegroundColor White

Write-Host "`n💡 Pour insérer le module Whisper IA dans la base de données:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à votre console Supabase" -ForegroundColor White
Write-Host "2. Allez dans l'éditeur SQL" -ForegroundColor White
Write-Host "3. Exécutez cette requête SQL:" -ForegroundColor White

$sqlQuery = @"
INSERT INTO modules (id, title, description, subtitle, category, price, youtube_url, url, image_url, created_at, updated_at)
VALUES (
    'whisper',
    'Whisper IA',
    'Intelligence artificielle multimédia - Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR.',
    'Transcription audio, vidéo et reconnaissance de texte (OCR)',
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
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    youtube_url = EXCLUDED.youtube_url,
    url = EXCLUDED.url,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();
"@

Write-Host "`n📝 Requête SQL:" -ForegroundColor Green
Write-Host $sqlQuery -ForegroundColor White

Write-Host "`n🎯 Après l'insertion:" -ForegroundColor Cyan
Write-Host "   - La carte Whisper apparaîtra sur /applications" -ForegroundColor White
Write-Host "   - La page détaillée sera accessible sur /card/whisper" -ForegroundColor White
Write-Host "   - Le service sera accessible sur https://whisper.iahome.fr" -ForegroundColor White

Write-Host "`n✅ Module Whisper IA prêt pour l'insertion !" -ForegroundColor Green
