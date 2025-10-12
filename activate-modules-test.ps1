# Activation manuelle des modules PDF+ et PsiTransfer pour test
Write-Host "🔧 ACTIVATION MANUELLE DES MODULES" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# ID utilisateur de test
$userId = "77e8d61e-dbec-49fe-bd5a-517fc495c84a"

# Test 1: Activation PDF+
Write-Host "`n1. Activation du module PDF+..." -ForegroundColor Yellow
try {
    $pdfData = @{
        userId = $userId
        moduleId = "pdf"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/add-module-to-encours" -Method POST -Body $pdfData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ PDF+ activé: $($result.message)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur activation PDF+: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur PDF+: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Activation PsiTransfer
Write-Host "`n2. Activation du module PsiTransfer..." -ForegroundColor Yellow
try {
    $psitransferData = @{
        userId = $userId
        moduleId = "psitransfer"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/add-module-to-encours" -Method POST -Body $psitransferData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ PsiTransfer activé: $($result.message)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur activation PsiTransfer: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur PsiTransfer: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérification page /encours après activation
Write-Host "`n3. Vérification page /encours après activation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/encours" -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $content = $response.Content
        
        if ($content -match "PDF\+|PsiTransfer") {
            Write-Host "   ✅ Modules PDF+ et PsiTransfer visibles dans /encours" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Modules PDF+ et PsiTransfer non visibles dans /encours" -ForegroundColor Red
        }
        
        if ($content -match "Accéder à PDF\+|Accéder à PsiTransfer") {
            Write-Host "   ✅ Boutons d'accès PDF+ et PsiTransfer visibles" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Boutons d'accès PDF+ et PsiTransfer non visibles" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 ACTIVATION TERMINÉE" -ForegroundColor Yellow





