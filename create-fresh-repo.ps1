# Script pour créer un nouveau dépôt Git sans historique
# Usage: .\create-fresh-repo.ps1 [NOM_DU_NOUVEAU_REPO]

param(
    [string]$RepoName = "Octobre-2025-clean"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Création d'un nouveau dépôt Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans un dépôt Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Pas un dépôt Git" -ForegroundColor Red
    exit 1
}

# Sauvegarder la branche actuelle
$currentBranch = git branch --show-current
Write-Host "📍 Branche actuelle: $currentBranch" -ForegroundColor Gray
Write-Host ""

# Sauvegarder les fichiers non suivis et les modifications
Write-Host "💾 Étape 1: Sauvegarde des modifications..." -ForegroundColor Yellow
git add -A
git stash push -m "Sauvegarde avant reset" --include-untracked 2>&1 | Out-Null
Write-Host "✅ Fichiers sauvegardés" -ForegroundColor Green
Write-Host ""

# Créer un nouveau dépôt dans un dossier temporaire
Write-Host "📦 Étape 2: Création d'un nouveau dépôt sans historique..." -ForegroundColor Yellow
$tempDir = "..\iahome-fresh-repo"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
Set-Location $tempDir

git init
Write-Host "✅ Nouveau dépôt initialisé" -ForegroundColor Green
Write-Host ""

# Copier les fichiers du dépôt actuel (sans .git)
Write-Host "📋 Étape 3: Copie des fichiers..." -ForegroundColor Yellow
Set-Location "..\iahome"
Get-ChildItem -Path . -Force | Where-Object { 
    $_.Name -ne ".git" -and $_.Name -ne "node_modules" -and $_.Name -ne ".next" 
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination "$tempDir\$($_.Name)" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "✅ Fichiers copiés" -ForegroundColor Green
Write-Host ""

# Retourner au nouveau dépôt et créer le commit initial
Set-Location $tempDir
Write-Host "📝 Étape 4: Création du commit initial..." -ForegroundColor Yellow
git add -A
git commit -m "Initial commit - état actuel sans historique"
Write-Host "✅ Commit initial créé" -ForegroundColor Green
Write-Host ""

# Configuration du remote
Write-Host "🌐 Étape 5: Configuration du remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/pailler/$RepoName.git"
git remote add origin $remoteUrl
Write-Host "✅ Remote configuré: $remoteUrl" -ForegroundColor Green
Write-Host ""

# Afficher les instructions
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Nouveau dépôt créé avec succès!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Emplacement: $tempDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Crée le dépôt sur GitHub: https://github.com/new" -ForegroundColor White
Write-Host "   Nom: $RepoName" -ForegroundColor Gray
Write-Host "2. Puis exécute ces commandes:" -ForegroundColor White
Write-Host "   cd $tempDir" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Note: Le dépôt original reste intact." -ForegroundColor Cyan
Write-Host "   Pour retourner au dépôt original:" -ForegroundColor Cyan
Write-Host "   cd ..\iahome" -ForegroundColor Gray

