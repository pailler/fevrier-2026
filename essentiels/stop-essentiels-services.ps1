# Script d'arrêt des services essentiels
# MeTube, Stirling PDF, Librespeed, PsiTransfer, QR Codes

Write-Host "🛑 Arrêt des services essentiels..." -ForegroundColor Yellow

# Arrêter les services essentiels (incluant PsiTransfer et QR Codes)
Write-Host "📦 Arrêt des conteneurs essentiels..." -ForegroundColor Yellow
docker-compose -f docker-compose.essentiels.yml down

Write-Host "✅ Services essentiels arrêtés !" -ForegroundColor Green











