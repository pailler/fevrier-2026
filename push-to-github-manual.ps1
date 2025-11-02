# Script pour pousser vers GitHub avec plusieurs tentatives
# Usage: .\push-to-github-manual.ps1

param(
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

Write-Host "🔄 Tentative de push vers GitHub..." -ForegroundColor Cyan
Write-Host "Repository: https://github.com/pailler/10-octobre-2025.git" -ForegroundColor Gray
Write-Host "Branche: $Branch" -ForegroundColor Gray
Write-Host ""

# Vérifier l'état du dépôt
Write-Host "📊 Vérification de l'état du dépôt..." -ForegroundColor Yellow
$commitsAhead = git rev-list --count origin/$Branch..HEAD 2>$null
if ($commitsAhead) {
    Write-Host "✅ Commits en attente: $commitsAhead" -ForegroundColor Green
    git log origin/$Branch..HEAD --oneline | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "⚠️  Aucun commit en attente" -ForegroundColor Yellow
}

Write-Host ""

# Tentative 1: Push normal
Write-Host "🔄 Tentative 1: Push normal..." -ForegroundColor Cyan
$result1 = git push $Remote $Branch 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    exit 0
}

Write-Host "❌ Tentative 1 échouée" -ForegroundColor Red
Write-Host ""

# Tentative 2: Push avec buffer augmenté
Write-Host "🔄 Tentative 2: Push avec buffer augmenté..." -ForegroundColor Cyan
git config http.postBuffer 1048576000
$result2 = git push $Remote $Branch 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    exit 0
}

Write-Host "❌ Tentative 2 échouée" -ForegroundColor Red
Write-Host ""

# Tentative 3: Push sans vérification
Write-Host "🔄 Tentative 3: Push sans vérification..." -ForegroundColor Cyan
$result3 = git push $Remote $Branch --no-verify 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    exit 0
}

Write-Host "❌ Tentative 3 échouée" -ForegroundColor Red
Write-Host ""

# Résumé
Write-Host "========================================" -ForegroundColor Red
Write-Host "❌ Toutes les tentatives ont échoué" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Options alternatives:" -ForegroundColor Yellow
Write-Host "1. Vérifier le statut GitHub: https://www.githubstatus.com" -ForegroundColor Cyan
Write-Host "2. Utiliser GitHub Desktop (interface graphique)" -ForegroundColor Cyan
Write-Host "3. Pousser via l'interface web GitHub (upload de fichiers)" -ForegroundColor Cyan
Write-Host "4. Attendre quelques minutes et réessayer" -ForegroundColor Cyan
Write-Host "5. Créer un nouveau dépôt et migrer les commits" -ForegroundColor Cyan
Write-Host ""

# Afficher les erreurs
Write-Host "Dernière erreur:" -ForegroundColor Yellow
$result3 | Write-Host

