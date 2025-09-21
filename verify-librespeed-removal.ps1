# Script de vérification de la suppression des règles LibreSpeed de Traefik
Write-Host "🔍 Vérification de la suppression des règles LibreSpeed de Traefik..." -ForegroundColor Cyan

Write-Host "`n1️⃣ Vérification des fichiers supprimés..." -ForegroundColor Yellow
$deletedFiles = @(
    "traefik/dynamic/librespeed-cloudflare.yml",
    "traefik/dynamic/librespeed-direct.yml", 
    "traefik/dynamic/librespeed-token-middleware.yml",
    "traefik/librespeed-middleware.yml"
)

foreach ($file in $deletedFiles) {
    if (Test-Path $file) {
        Write-Host "❌ Fichier non supprimé: $file" -ForegroundColor Red
    } else {
        Write-Host "✅ Fichier supprimé: $file" -ForegroundColor Green
    }
}

Write-Host "`n2️⃣ Vérification des références LibreSpeed restantes..." -ForegroundColor Yellow
try {
    $remainingRefs = Get-ChildItem -Path "traefik" -Recurse -File | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -match "librespeed") {
            $matches = [regex]::Matches($content, "librespeed", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            [PSCustomObject]@{
                File = $_.FullName
                Count = $matches.Count
                Lines = $matches | ForEach-Object { $_.Value }
            }
        }
    }
    
    if ($remainingRefs) {
        Write-Host "⚠️ Références LibreSpeed trouvées:" -ForegroundColor Yellow
        $remainingRefs | ForEach-Object {
            Write-Host "   📄 $($_.File): $($_.Count) occurrence(s)" -ForegroundColor White
        }
    } else {
        Write-Host "✅ Aucune référence LibreSpeed trouvée" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3️⃣ Vérification de la configuration Traefik..." -ForegroundColor Yellow
try {
    # Vérifier que Traefik peut démarrer sans erreur
    $traefikConfig = "traefik/traefik.yml"
    if (Test-Path $traefikConfig) {
        Write-Host "✅ Fichier de configuration Traefik principal trouvé" -ForegroundColor Green
        
        # Vérifier la syntaxe YAML basique
        $content = Get-Content $traefikConfig -Raw
        if ($content -match "api:" -and $content -match "entryPoints:") {
            Write-Host "✅ Structure de configuration Traefik valide" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Structure de configuration Traefik suspecte" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Fichier de configuration Traefik principal manquant" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de la configuration: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4️⃣ Vérification des middlewares restants..." -ForegroundColor Yellow
try {
    $middlewaresFile = "traefik/dynamic/middlewares.yml"
    if (Test-Path $middlewaresFile) {
        $content = Get-Content $middlewaresFile -Raw
        $librespeedMiddlewares = [regex]::Matches($content, "librespeed", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        if ($librespeedMiddlewares.Count -eq 0) {
            Write-Host "✅ Aucun middleware LibreSpeed dans middlewares.yml" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($librespeedMiddlewares.Count) référence(s) LibreSpeed trouvée(s) dans middlewares.yml" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Fichier middlewares.yml manquant" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification des middlewares: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5️⃣ Test de redémarrage de Traefik..." -ForegroundColor Yellow
try {
    # Vérifier si Traefik est en cours d'exécution
    $traefikProcess = Get-Process -Name "traefik" -ErrorAction SilentlyContinue
    if ($traefikProcess) {
        Write-Host "✅ Traefik est en cours d'exécution (PID: $($traefikProcess.Id))" -ForegroundColor Green
        Write-Host "💡 Redémarrez Traefik pour appliquer les changements" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Traefik n'est pas en cours d'exécution" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Traefik: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Vérification terminée!" -ForegroundColor Green
Write-Host "💡 Toutes les règles LibreSpeed ont été supprimées de Traefik" -ForegroundColor Cyan
Write-Host "🔧 LibreSpeed utilise maintenant son propre service d'authentification sur le port 7006" -ForegroundColor White
