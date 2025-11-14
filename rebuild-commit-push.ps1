# Script pour reconstruire, vider les caches, committer et pousser vers GitHub

Write-Host "🔧 RECONSTRUCTION, COMMIT ET PUSH VERS GITHUB" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter Next.js si en cours
Write-Host "1️⃣ Arrêt de Next.js..." -ForegroundColor Yellow
$nextjsProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next*" -or $_.Path -like "*node*"
}
if ($nextjsProcesses) {
    Write-Host "   ⏹️  Arrêt de $($nextjsProcesses.Count) processus Next.js..." -ForegroundColor Gray
    $nextjsProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Next.js arrêté" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus Next.js à arrêter" -ForegroundColor Green
}

# 2. Nettoyer les caches
Write-Host "`n2️⃣ Nettoyage des caches..." -ForegroundColor Yellow
$cacheDirs = @(".next", ".next/cache", "node_modules/.cache")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   🗑️  Suppression de $dir..." -ForegroundColor Gray
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ $dir supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression de $dir : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ℹ️  $dir n'existe pas" -ForegroundColor Gray
    }
}

# 3. Reconstruire l'application
Write-Host "`n3️⃣ Reconstruction de l'application..." -ForegroundColor Yellow
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "   📋 Build ID: $buildId" -ForegroundColor Gray
Write-Host "   🚀 Lancement du build..." -ForegroundColor Gray

$env:BUILD_ID = $buildId
$env:NODE_ENV = "production"

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build" -ForegroundColor Red
        Write-Host "   📋 Détails:" -ForegroundColor Cyan
        Write-Host $buildOutput -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Vérifier le statut Git
Write-Host "`n4️⃣ Vérification du statut Git..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erreur lors de la vérification du statut Git" -ForegroundColor Red
        Write-Host "   💡 Assurez-vous que vous êtes dans un dépôt Git valide" -ForegroundColor Gray
        exit 1
    }
    
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "   ℹ️  Aucun changement à committer" -ForegroundColor Gray
        Write-Host "   💡 Voulez-vous quand même pousser vers GitHub ?" -ForegroundColor Yellow
        $continue = Read-Host "   Continuer ? (O/N)"
        if ($continue -ne "O" -and $continue -ne "o") {
            Write-Host "   ❌ Opération annulée" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "   ✅ Changements détectés:" -ForegroundColor Green
        Write-Host $gitStatus -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification Git: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Ajouter tous les fichiers
Write-Host "`n5️⃣ Ajout des fichiers à Git..." -ForegroundColor Yellow
try {
    git add . 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Fichiers ajoutés" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'ajout des fichiers" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de l'ajout: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Créer le commit
Write-Host "`n6️⃣ Création du commit..." -ForegroundColor Yellow
$commitMessage = "Rebuild: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Build ID: $buildId"
Write-Host "   📝 Message: $commitMessage" -ForegroundColor Gray

try {
    git commit -m $commitMessage 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Commit créé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Aucun changement à committer (peut-être déjà commité)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors du commit: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérifier la branche actuelle
Write-Host "`n7️⃣ Vérification de la branche..." -ForegroundColor Yellow
try {
    $currentBranch = git branch --show-current 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Branche actuelle: $currentBranch" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Impossible de déterminer la branche actuelle" -ForegroundColor Yellow
        $currentBranch = "main"
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification de la branche" -ForegroundColor Yellow
    $currentBranch = "main"
}

# 8. Pousser vers GitHub
Write-Host "`n8️⃣ Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   🚀 Push vers origin/$currentBranch..." -ForegroundColor Gray

try {
    $pushOutput = git push origin $currentBranch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Push réussi!" -ForegroundColor Green
    } else {
        # Vérifier si c'est juste "nothing to push"
        if ($pushOutput -match "nothing to push" -or $pushOutput -match "Everything up-to-date") {
            Write-Host "   ℹ️  Rien à pousser (tout est à jour)" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Erreur lors du push" -ForegroundColor Red
            Write-Host "   📋 Détails:" -ForegroundColor Cyan
            Write-Host $pushOutput -ForegroundColor Gray
            Write-Host "`n💡 Vérifiez votre configuration Git et vos credentials" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Erreur lors du push: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Vérifiez votre configuration Git et vos credentials" -ForegroundColor Yellow
    exit 1
}

# 9. Résumé
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Caches nettoyés" -ForegroundColor Green
Write-Host "   ✅ Application reconstruite (Build ID: $buildId)" -ForegroundColor Green
Write-Host "   ✅ Commit créé: $commitMessage" -ForegroundColor Green
Write-Host "   ✅ Push vers GitHub réussi (branche: $currentBranch)" -ForegroundColor Green
Write-Host "`n✅ Toutes les opérations sont terminées!" -ForegroundColor Green
Write-Host ""

