# Configuration Supabase pour QR codes
Write-Host "Configuration Supabase pour QR codes..." -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Allez sur https://supabase.com et creez un nouveau projet" -ForegroundColor White
Write-Host "2. Dans votre projet, allez dans Settings > API" -ForegroundColor White
Write-Host "3. Copiez l'URL du projet et la cle anonyme" -ForegroundColor White

$supabaseUrl = Read-Host "URL de votre projet Supabase"
$supabaseKey = Read-Host "Cle anonyme de Supabase"

if ([string]::IsNullOrEmpty($supabaseUrl) -or [string]::IsNullOrEmpty($supabaseKey)) {
    Write-Host "URL et cle Supabase sont requises" -ForegroundColor Red
    exit 1
}

# Creer le fichier de configuration
$configContent = @"
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$supabaseKey
IAHOME_JWT_SECRET=your-super-secret-jwt-key-change-in-production
"@

$configContent | Out-File -FilePath "essentiels\qrcodes\.env" -Encoding UTF8

Write-Host "Configuration terminee !" -ForegroundColor Green
Write-Host "Fichier cree: essentiels\qrcodes\.env" -ForegroundColor Cyan

Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. Executez le script SQL dans Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Redemarrez le service: cd essentiels\qrcodes && python qr_service.py" -ForegroundColor White



