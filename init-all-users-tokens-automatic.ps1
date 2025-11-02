# Script PowerShell pour initialiser automatiquement les tokens de tous les utilisateurs

$ErrorActionPreference = "Stop"

Write-Host "🪙 Initialisation automatique des tokens pour tous les utilisateurs..." -ForegroundColor Cyan

$apiUrl = "https://iahome.fr"
Write-Host "📡 URL de l'API: $apiUrl" -ForegroundColor Gray

# 1. Vérifier l'état actuel
Write-Host "`n1️⃣ Vérification de l'état actuel..." -ForegroundColor Yellow

try {
    # Utiliser la route existante init-all-users-tokens pour vérifier d'abord
    # Note: La route ensure-all-users-have-tokens sera disponible après déploiement
    $checkResponse = Invoke-RestMethod -Uri "$apiUrl/api/init-all-users-tokens" -Method POST -ContentType "application/json"
    
    Write-Host "   ✅ Traitement terminé" -ForegroundColor Green
    Write-Host "`n   📊 Résultats:" -ForegroundColor Cyan
    Write-Host "   - Total utilisateurs: $($checkResponse.totalUsers)" -ForegroundColor White
    Write-Host "   - Tokens créés: $($checkResponse.totalCreated)" -ForegroundColor Green
    Write-Host "   - Tokens mis à jour: $($checkResponse.totalUpdated)" -ForegroundColor Yellow
    
    if ($checkResponse.tokens) {
        Write-Host "`n   📋 État des tokens:" -ForegroundColor Cyan
        $checkResponse.tokens | ForEach-Object {
            $color = if ($_.tokens -ge 200) { "Green" } elseif ($_.tokens -gt 0) { "Yellow" } else { "Red" }
            Write-Host "   - User ID: $($_.user_id.Substring(0, 8))... : $($_.tokens) tokens" -ForegroundColor $color
        }
    }
    
    if ($checkResponse.totalCreated -eq 0 -and $checkResponse.totalUpdated -eq 0) {
        Write-Host "`n   ✅ Tous les utilisateurs ont déjà au moins 200 tokens!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Note: L'initialisation est déjà effectuée dans l'étape 1 avec init-all-users-tokens
# La route ensure-all-users-have-tokens sera disponible après déploiement pour une vérification plus détaillée

Write-Host "`n✅ Processus terminé avec succès!" -ForegroundColor Green

