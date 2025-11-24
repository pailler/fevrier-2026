# Script pour déconnecter tous les utilisateurs
# Appelle l'API pour invalider toutes les sessions et tokens

Write-Host "🔒 DÉCONNEXION DE TOUS LES UTILISATEURS" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host ""

# Attendre que Next.js soit prêt
Write-Host "⏳ Attente du démarrage de Next.js..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Appeler l'API de déconnexion
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/disconnect-all-users" -Method POST -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "✅ Tous les utilisateurs ont été déconnectés côté serveur" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Détails:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   Pour une déconnexion complète, vous devez aussi:" -ForegroundColor White
    Write-Host "   1. Vider le localStorage de votre navigateur (F12 > Console > tapez:)" -ForegroundColor White
    Write-Host "      localStorage.clear()" -ForegroundColor Gray
    Write-Host "   2. Ou utilisez la navigation privée (Ctrl+Shift+N)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Vous pouvez maintenant vous reconnecter" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la déconnexion:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Assurez-vous que Next.js est démarré sur le port 3000" -ForegroundColor Yellow
}


