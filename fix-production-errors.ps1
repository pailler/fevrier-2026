# fix-production-errors.ps1
# Script pour corriger les erreurs de production

Write-Host "🔧 Correction des erreurs de production"
Write-Host "====================================="
Write-Host ""

# 1. Purger le cache Cloudflare
Write-Host "1. Purge du cache Cloudflare..."
try {
    $purgeResponse = Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" -Method POST -Headers @{
        "Authorization" = "Bearer YOUR_API_TOKEN"
        "Content-Type" = "application/json"
    } -Body '{"purge_everything":true}' -ErrorAction Stop
    Write-Host "   ✅ Cache Cloudflare purgé"
} catch {
    Write-Host "   ⚠️  Erreur purge Cloudflare: $($_.Exception.Message)"
    Write-Host "   💡 Purgez manuellement le cache dans le dashboard Cloudflare"
}
Write-Host ""

# 2. Vérifier l'application locale
Write-Host "2. Vérification de l'application locale..."
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -ErrorAction Stop
    Write-Host "   Status Code: $($localResponse.StatusCode)"
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Application locale accessible"
    } else {
        Write-Host "   ❌ Application locale non accessible"
    }
} catch {
    Write-Host "   ❌ Erreur application locale: $($_.Exception.Message)"
}
Write-Host ""

# 3. Vérifier la page /encours locale
Write-Host "3. Vérification de la page /encours locale..."
try {
    $encoursResponse = Invoke-WebRequest -Uri "http://localhost:3000/encours" -Method GET -ErrorAction Stop
    Write-Host "   Status Code: $($encoursResponse.StatusCode)"
    if ($encoursResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Page /encours locale accessible"
    } else {
        Write-Host "   ❌ Page /encours locale non accessible"
    }
} catch {
    Write-Host "   ❌ Erreur page /encours locale: $($_.Exception.Message)"
}
Write-Host ""

# 4. Vérifier les URLs Cloudflare
Write-Host "4. Vérification des URLs Cloudflare..."
$cloudflareUrls = @{
    "LibreSpeed" = "https://librespeed.iahome.fr"
    "MeTube" = "https://metube.iahome.fr"
    "PDF" = "https://pdf.iahome.fr"
    "PsiTransfer" = "https://psitransfer.iahome.fr"
    "QR Codes" = "https://qrcodes.iahome.fr"
}

foreach ($service in $cloudflareUrls.Keys) {
    $url = $cloudflareUrls[$service]
    Write-Host "   Test de $service ($url)..."
    try {
        $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ $service accessible (Status: $($response.StatusCode))"
    } catch {
        Write-Host "   ❌ $service non accessible: $($_.Exception.Message)"
    }
}
Write-Host ""

Write-Host "🎯 Actions recommandées :"
Write-Host "1. Purger le cache Cloudflare dans le dashboard"
Write-Host "2. Redémarrer l'application en production"
Write-Host "3. Vérifier les logs du serveur de production"
Write-Host "4. S'assurer que la configuration Next.js est correcte"
Write-Host ""
Write-Host "💡 L'erreur 400 sur le fichier JS suggère un problème de cache ou de configuration serveur"



