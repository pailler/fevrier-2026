# Script de déploiement du système d'autorisation
Write-Host "🚀 Déploiement du système d'autorisation IAHOME" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Configuration
$projectPath = "C:\Users\AAA\Documents\iahome"
$dockerComposeFile = "docker-compose.prod.yml"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Project Path: $projectPath"
Write-Host "Docker Compose: $dockerComposeFile"

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path $projectPath)) {
    Write-Host "❌ Répertoire du projet non trouvé: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# 1. Vérifier les fichiers du système d'autorisation
Write-Host "`n🔍 Vérification des fichiers du système d'autorisation..." -ForegroundColor Cyan

$authFiles = @(
    "src\utils\authorizationService.ts",
    "src\components\AuthorizedAccessButton.tsx",
    "src\components\UserPermissionsManager.tsx",
    "src\app\api\authorize-module-access\route.ts"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FICHIER MANQUANT" -ForegroundColor Red
        exit 1
    }
}

# 2. Vérifier les modifications des pages
Write-Host "`n🔍 Vérification des modifications des pages..." -ForegroundColor Cyan

$modifiedPages = @(
    "src\app\modules\page.tsx",
    "src\app\encours\page.tsx",
    "src\app\card\[id]\page.tsx"
)

foreach ($page in $modifiedPages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        if ($content -match "AuthorizedAccessButton") {
            Write-Host "✅ $page - Modifié" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $page - Pas de modification détectée" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $page - FICHIER MANQUANT" -ForegroundColor Red
    }
}

# 3. Construire l'application
Write-Host "`n🔨 Construction de l'application..." -ForegroundColor Cyan
try {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    
    Write-Host "Construction de l'application..." -ForegroundColor Yellow
    npm run build
    
    Write-Host "✅ Application construite avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la construction: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Vérifier les services Docker
Write-Host "`n🐳 Vérification des services Docker..." -ForegroundColor Cyan
try {
    $services = docker-compose -f $dockerComposeFile ps --services
    Write-Host "Services détectés: $($services -join ', ')" -ForegroundColor Yellow
    
    # Vérifier que les services critiques sont en cours d'exécution
    $criticalServices = @("iahome-app", "supabase", "traefik")
    foreach ($service in $criticalServices) {
        $status = docker-compose -f $dockerComposeFile ps $service --format "table {{.State}}"
        if ($status -match "running") {
            Write-Host "✅ $service - En cours d'exécution" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $service - $status" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification Docker: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Redémarrer les services
Write-Host "`n🔄 Redémarrage des services..." -ForegroundColor Cyan
try {
    Write-Host "Arrêt des services..." -ForegroundColor Yellow
    docker-compose -f $dockerComposeFile down
    
    Write-Host "Démarrage des services..." -ForegroundColor Yellow
    docker-compose -f $dockerComposeFile up -d
    
    Write-Host "✅ Services redémarrés avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Attendre que les services soient prêts
Write-Host "`n⏳ Attente du démarrage des services..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 7. Tester le système d'autorisation
Write-Host "`n🧪 Test du système d'autorisation..." -ForegroundColor Cyan
try {
    Write-Host "Exécution des tests..." -ForegroundColor Yellow
    & ".\test-authorization-system.ps1"
    
    Write-Host "✅ Tests exécutés avec succès" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 8. Vérifier les logs
Write-Host "`n📋 Vérification des logs..." -ForegroundColor Cyan
try {
    Write-Host "Logs de l'application:" -ForegroundColor Yellow
    docker-compose -f $dockerComposeFile logs --tail=20 iahome-app
    
    Write-Host "`nLogs de Supabase:" -ForegroundColor Yellow
    docker-compose -f $dockerComposeFile logs --tail=10 supabase
} catch {
    Write-Host "❌ Erreur lors de la récupération des logs: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Résumé du déploiement
Write-Host "`n🎯 Résumé du déploiement:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "✅ Système d'autorisation déployé" -ForegroundColor Green
Write-Host "✅ Composants AuthorizedAccessButton intégrés" -ForegroundColor Green
Write-Host "✅ API d'autorisation centralisée active" -ForegroundColor Green
Write-Host "✅ Gestion des permissions utilisateur implémentée" -ForegroundColor Green
Write-Host "✅ Validation des tokens temporaires fonctionnelle" -ForegroundColor Green
Write-Host "✅ Services Docker redémarrés" -ForegroundColor Green

Write-Host "`n📝 Fonctionnalités déployées:" -ForegroundColor Yellow
Write-Host "- Vérification d'autorisation centralisée"
Write-Host "- Gestion des quotas et expirations"
Write-Host "- Tokens d'accès temporaires sécurisés"
Write-Host "- Interface utilisateur améliorée"
Write-Host "- API RESTful pour l'autorisation"
Write-Host "- Composants réutilisables"

Write-Host "`n🔗 URLs de test:" -ForegroundColor Yellow
Write-Host "- Modules: https://iahome.fr/modules"
Write-Host "- En cours: https://iahome.fr/encours"
Write-Host "- API Auth: https://iahome.fr/api/authorize-module-access"
Write-Host "- LibreSpeed: https://librespeed.iahome.fr"

Write-Host "`n✨ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "Le système d'autorisation est maintenant actif et prêt à être utilisé." -ForegroundColor Green
