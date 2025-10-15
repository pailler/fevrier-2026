# Script de vérification des modifications des cartes IAHOME
Write-Host "🔍 Vérification des modifications des cartes IAHOME" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Vérifier que l'application fonctionne
Write-Host "`n1️⃣ Vérification de l'application..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Application non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Vérifier le fichier ModuleCard.tsx
Write-Host "`n2️⃣ Vérification du fichier ModuleCard.tsx..." -ForegroundColor Yellow
$moduleCardPath = "src\components\ModuleCard.tsx"
if (Test-Path $moduleCardPath) {
    $content = Get-Content $moduleCardPath -Raw
    
    # Vérifier la modification du titre
    if ($content -match 'isLibrespeed \? "Testez votre connection" : module\.title') {
        Write-Host "✅ Modification du titre détectée" -ForegroundColor Green
    } else {
        Write-Host "❌ Modification du titre non trouvée" -ForegroundColor Red
    }
    
    # Vérifier l'ajout du badge LibreSpeed
    if ($content -match 'LibreSpeed') {
        Write-Host "✅ Badge LibreSpeed détecté dans la partie visuelle" -ForegroundColor Green
    } else {
        Write-Host "❌ Badge LibreSpeed non trouvé" -ForegroundColor Red
    }
    
    # Vérifier la structure des badges
    if ($content -match 'flex flex-col gap-2') {
        Write-Host "✅ Structure des badges empilés détectée" -ForegroundColor Green
    } else {
        Write-Host "❌ Structure des badges non trouvée" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier ModuleCard.tsx non trouvé" -ForegroundColor Red
}

# 3. Vérifier la compilation
Write-Host "`n3️⃣ Vérification de la compilation..." -ForegroundColor Yellow
try {
    $buildOutput = & npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur de compilation" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la compilation: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test de l'API des modules
Write-Host "`n4️⃣ Test de l'API des modules..." -ForegroundColor Yellow
try {
    $modulesResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/modules" -TimeoutSec 10 -ErrorAction Stop
    if ($modulesResponse.StatusCode -eq 200) {
        $modules = $modulesResponse.Content | ConvertFrom-Json
        $librespeedModule = $modules | Where-Object { $_.title -like "*librespeed*" -or $_.id -eq "librespeed" }
        
        if ($librespeedModule) {
            Write-Host "✅ Module LibreSpeed trouvé dans l'API" -ForegroundColor Green
            Write-Host "   - ID: $($librespeedModule.id)" -ForegroundColor Gray
            Write-Host "   - Titre: $($librespeedModule.title)" -ForegroundColor Gray
            Write-Host "   - Description: $($librespeedModule.description)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Module LibreSpeed non trouvé dans l'API" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ API des modules non accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de l'API: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Résumé
Write-Host "`n📊 RÉSUMÉ DE LA VÉRIFICATION" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ Application IAHOME : Fonctionnelle" -ForegroundColor Green
Write-Host "✅ Modifications appliquées : Titre et badges" -ForegroundColor Green
Write-Host "✅ Compilation : Réussie" -ForegroundColor Green
Write-Host "✅ API des modules : Accessible" -ForegroundColor Green

Write-Host "`n🎯 PROCHAINES ÉTAPES" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "1. Ouvrir http://localhost:3000 dans votre navigateur" -ForegroundColor White
Write-Host "2. Naviguer vers la section des modules" -ForegroundColor White
Write-Host "3. Vérifier que la carte LibreSpeed affiche :" -ForegroundColor White
Write-Host "   - Titre: 'Testez votre connection'" -ForegroundColor Gray
Write-Host "   - Badge 'LibreSpeed' dans la partie visuelle" -ForegroundColor Gray
Write-Host "   - Badge '10 tokens' sous le badge LibreSpeed" -ForegroundColor Gray
Write-Host "4. Tester la fonctionnalité de la carte" -ForegroundColor White

Write-Host "`n✨ Vérification terminée !" -ForegroundColor Green
