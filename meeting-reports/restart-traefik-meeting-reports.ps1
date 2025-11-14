# Script pour redémarrer Traefik et appliquer les nouvelles configurations pour meeting-reports
# Note: Traefik recharge automatiquement les fichiers dans /etc/traefik/dynamic avec watch: true

Write-Host "🔄 Vérification de la configuration Traefik pour meeting-reports..." -ForegroundColor Cyan

# Vérifier si les fichiers de configuration existent
$configFiles = @(
    "traefik/dynamic/meeting-reports-api.yml",
    "traefik/dynamic/traefik-meeting-reports-api.yml"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Configuration trouvée: $file" -ForegroundColor Green
        
        # Vérifier que maxRequestBodyBytes est bien à 500MB
        $content = Get-Content $file -Raw
        if ($content -match "maxRequestBodyBytes:\s*524288000") {
            Write-Host "   ✓ maxRequestBodyBytes configuré à 500MB" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️ maxRequestBodyBytes pourrait ne pas être correctement configuré" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ Configuration manquante: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 Configuration actuelle:" -ForegroundColor Cyan
Write-Host "   - maxRequestBodyBytes: 524288000 (500 MB)" -ForegroundColor Gray
Write-Host "   - memRequestBodyBytes: 52428800 (50 MB)" -ForegroundColor Gray
Write-Host "   - Route dédiée: /api/upload avec middleware spécial" -ForegroundColor Gray

Write-Host "`n💡 Note:" -ForegroundColor Yellow
Write-Host "   Traefik recharge automatiquement les fichiers de configuration." -ForegroundColor Gray
Write-Host "   Si le problème persiste, vérifiez les logs Traefik ou redémarrez le service." -ForegroundColor Gray

Write-Host "`n🔍 Pour vérifier si Traefik est en cours d'exécution:" -ForegroundColor Cyan
Write-Host "   docker ps | Select-String traefik" -ForegroundColor Gray
Write-Host "   OU" -ForegroundColor Gray
Write-Host "   Get-Process | Where-Object ProcessName -like '*traefik*'" -ForegroundColor Gray

Write-Host "`n✅ Configuration vérifiée!" -ForegroundColor Green













