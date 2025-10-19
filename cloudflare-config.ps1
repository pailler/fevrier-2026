# Configuration Cloudflare pour LibreSpeed
# Remplacez ces valeurs par vos vraies clés Cloudflare

# 🔑 VOS CLÉS CLOUDFLARE (configurées)
$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"
$AccountId = "9ba4294aa787e67c335c71876c10af21"

# 📧 Configuration email et domaine
$Email = "admin@iahome.fr"
$Domain = "iahome.fr"

# 🚀 Exécution de la configuration
Write-Host "🔒 Configuration LibreSpeed avec Cloudflare" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Vérifier que les clés sont configurées
if ($CloudflareApiToken -eq "VOTRE_TOKEN_API_CLOUDFLARE_ICI" -or 
    $ZoneId -eq "VOTRE_ZONE_ID_ICI" -or 
    $AccountId -eq "VOTRE_ACCOUNT_ID_ICI") {
    
    Write-Host "❌ ERREUR: Veuillez configurer vos clés Cloudflare dans ce fichier" -ForegroundColor Red
    Write-Host "`n📋 Comment obtenir vos clés:" -ForegroundColor Yellow
    Write-Host "   1. Token API: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
    Write-Host "   2. Zone ID: https://dash.cloudflare.com → Votre domaine → Zone ID" -ForegroundColor Cyan
    Write-Host "   3. Account ID: https://dash.cloudflare.com → Zone ID (en bas à droite)" -ForegroundColor Cyan
    Write-Host "`n🔧 Modifiez ce fichier avec vos vraies clés puis relancez" -ForegroundColor Yellow
    exit 1
}

# Exécuter la configuration
try {
    & ".\setup-librespeed-security.ps1" -CloudflareApiToken $CloudflareApiToken -ZoneId $ZoneId -AccountId $AccountId -Email $Email -Domain $Domain
} catch {
    Write-Host "❌ Erreur lors de l'exécution: $($_.Exception.Message)" -ForegroundColor Red
}

