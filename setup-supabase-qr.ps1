# Script de configuration Supabase pour les QR codes dynamiques
# IAHome QR Code Generator

Write-Host "🔧 Configuration Supabase pour les QR codes dynamiques..." -ForegroundColor Cyan

Write-Host "`n📝 Configuration de Supabase:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://supabase.com et créez un nouveau projet" -ForegroundColor White
Write-Host "2. Dans votre projet, allez dans Settings > API" -ForegroundColor White
Write-Host "3. Copiez l'URL du projet et la clé anonyme (anon key)" -ForegroundColor White

$supabaseUrl = Read-Host "`nURL de votre projet Supabase (ex: https://abc123.supabase.co)"
$supabaseKey = Read-Host "Clé anonyme de Supabase"

if ([string]::IsNullOrEmpty($supabaseUrl) -or [string]::IsNullOrEmpty($supabaseKey)) {
    Write-Host "❌ URL et clé Supabase sont requises" -ForegroundColor Red
    exit 1
}

# Créer le fichier de configuration
$configContent = @"
# Configuration Supabase pour les QR codes dynamiques
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$supabaseKey

# Configuration de l'authentification centralisée avec IAHome.fr
IAHOME_JWT_SECRET=your-super-secret-jwt-key-change-in-production
"@

$configContent | Out-File -FilePath "essentiels\qrcodes\.env" -Encoding UTF8

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "📁 Fichier de configuration créé: essentiels\qrcodes\.env" -ForegroundColor Cyan

Write-Host "`n📋 Étapes suivantes:" -ForegroundColor Yellow
Write-Host "1. Exécutez le script SQL dans l'éditeur SQL de Supabase:" -ForegroundColor White
Write-Host "   - Allez dans SQL Editor dans votre projet Supabase" -ForegroundColor White
Write-Host "   - Copiez le contenu du fichier essentiels\qrcodes\supabase_schema.sql" -ForegroundColor White
Write-Host "   - Exécutez le script" -ForegroundColor White
Write-Host "`n2. Redémarrez le service QR codes:" -ForegroundColor White
Write-Host "   cd essentiels\qrcodes && python qr_service.py" -ForegroundColor White

Write-Host "`n🚀 Configuration Supabase terminée !" -ForegroundColor Green



