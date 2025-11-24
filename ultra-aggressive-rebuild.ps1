# Script ULTRA-AGRESSIF pour forcer les changements à apparaître

Write-Host "🔥🔥🔥 RECONSTRUCTION ULTRA-AGRESSIVE 🔥🔥🔥" -ForegroundColor Red
Write-Host "==========================================`n" -ForegroundColor Red

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter TOUT
Write-Host "1️⃣ Arrêt FORCÉ de TOUS les processus..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 5
Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green

# 2. Supprimer TOUT de manière ultra-agressive
Write-Host "`n2️⃣ Suppression ULTRA-AGRESSIVE de tous les caches..." -ForegroundColor Yellow
$itemsToDelete = @(
    ".next",
    ".next/cache",
    "node_modules/.cache",
    ".turbo",
    ".swc",
    "dist",
    "build",
    "out",
    ".next/static"
)

foreach ($item in $itemsToDelete) {
    if (Test-Path $item) {
        Write-Host "   🗑️  Suppression FORCÉE de $item..." -ForegroundColor Gray
        try {
            # Méthode 1: Suppression normale
            Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
            
            # Méthode 2: Robocopy si encore présent
            if (Test-Path $item) {
                $emptyDir = Join-Path $env:TEMP "empty_$(Get-Random)"
                New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
                robocopy $emptyDir $item /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
                Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path $emptyDir -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            Write-Host "   ✅ $item supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  $item partiellement supprimé" -ForegroundColor Yellow
        }
    }
}

# 3. Modifier next.config.ts pour désactiver TOUS les caches
Write-Host "`n3️⃣ Modification de next.config.ts pour désactiver TOUS les caches..." -ForegroundColor Yellow
$configFile = "next.config.ts"
$configContent = Get-Content $configFile -Raw

# Générer un timestamp unique
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$randomHash = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 8 | ForEach-Object {[char]$_})

# Modifier generateBuildId pour qu'il change à chaque fois
$newBuildId = "build-$timestamp-$randomHash"

# Remplacer generateBuildId
$configContent = $configContent -replace 'generateBuildId:\s*async\s*\(\)\s*=>\s*\{[^}]*\}', "generateBuildId: async () => { return '$newBuildId'; }"

# Modifier les headers de cache pour forcer no-cache
$cacheHeadersPattern = 'Cache-Control.*?value:\s*[''"]public.*?[''"]'
$noCacheHeaders = "Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'"

# Remplacer tous les headers Cache-Control pour les fichiers statiques
$configContent = $configContent -replace "source:\s*'/_next/static.*?Cache-Control.*?value:\s*['\`"]public.*?['\`"]", "source: '/_next/static/(.*)',`n        headers: [`n          {`n            key: 'Cache-Control',`n            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'`n          }"

# Sauvegarder le fichier modifié
Set-Content -Path $configFile -Value $configContent -NoNewline
Write-Host "   ✅ next.config.ts modifié avec Build ID: $newBuildId" -ForegroundColor Green

# 4. Nettoyer npm cache
Write-Host "`n4️⃣ Nettoyage complet du cache npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✅ Cache npm nettoyé" -ForegroundColor Green

# 5. Reconstruire avec le nouveau Build ID
Write-Host "`n5️⃣ Reconstruction avec Build ID unique..." -ForegroundColor Yellow
$env:BUILD_ID = $newBuildId
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PRIVATE_STANDALONE = "false"

Write-Host "   📋 Build ID: $newBuildId" -ForegroundColor Cyan
Write-Host "   🚀 Build en cours..." -ForegroundColor Gray

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur build" -ForegroundColor Red
        $buildOutput | Select-Object -Last 20 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Vérifier que le BUILD_ID est bien dans le manifest
Write-Host "`n6️⃣ Vérification du BUILD_ID..." -ForegroundColor Yellow
$buildManifest = ".next/BUILD_ID"
if (Test-Path $buildManifest) {
    $manifestContent = Get-Content $buildManifest -Raw
    Write-Host "   ✅ BUILD_ID: $manifestContent" -ForegroundColor Green
    if ($manifestContent -ne $newBuildId) {
        Write-Host "   ⚠️  BUILD_ID ne correspond pas!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ BUILD_ID manifest introuvable" -ForegroundColor Red
}

# 7. Créer un fichier de version avec timestamp pour forcer le changement
Write-Host "`n7️⃣ Création d'un fichier de version pour forcer le changement..." -ForegroundColor Yellow
$versionFile = "public/version.txt"
$versionContent = "Build: $newBuildId`nTimestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`nRandom: $randomHash"
Set-Content -Path $versionFile -Value $versionContent
Write-Host "   ✅ Fichier de version créé: $versionFile" -ForegroundColor Green

# 8. Modifier un fichier CSS/JS pour forcer le changement de hash
Write-Host "`n8️⃣ Modification d'un fichier pour forcer le changement de hash..." -ForegroundColor Yellow
$globalsCss = "src/app/globals.css"
if (Test-Path $globalsCss) {
    $cssContent = Get-Content $globalsCss -Raw
    # Ajouter un commentaire avec timestamp
    $cssContent = "/* Build: $newBuildId - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') */`n$cssContent"
    Set-Content -Path $globalsCss -Value $cssContent -NoNewline
    Write-Host "   ✅ globals.css modifié avec timestamp" -ForegroundColor Green
}

# 9. Redémarrer Next.js
Write-Host "`n9️⃣ Redémarrage de Next.js..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:BUILD_ID = $newBuildId

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:NODE_ENV='production'; `$env:PORT='3000'; `$env:BUILD_ID='$newBuildId'; npm start" -WindowStyle Minimized
Start-Sleep -Seconds 15

# Vérifier
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Next.js répond : HTTP $($response.StatusCode)" -ForegroundColor Green
    
    # Vérifier les headers
    Write-Host "   📋 Headers:" -ForegroundColor Gray
    if ($response.Headers['Cache-Control']) {
        Write-Host "      Cache-Control: $($response.Headers['Cache-Control'])" -ForegroundColor Gray
    }
    if ($response.Headers['ETag']) {
        Write-Host "      ETag: $($response.Headers['ETag'])" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Next.js démarre..." -ForegroundColor Yellow
}

# 10. Instructions finales
Write-Host "`n🔥🔥🔥 ACTIONS ULTRA-AGRESSIVES REQUISES 🔥🔥🔥" -ForegroundColor Red
Write-Host "==============================================" -ForegroundColor Red
Write-Host "`n1. FERMEZ COMPLÈTEMENT votre navigateur" -ForegroundColor Yellow
Write-Host "2. Rouvrez le navigateur" -ForegroundColor Yellow
Write-Host "3. Videz TOUT le cache:" -ForegroundColor Yellow
Write-Host "   - Chrome: Paramètres → Confidentialité → Effacer les données de navigation" -ForegroundColor Gray
Write-Host "   - Cochez: Cookies, Images et fichiers en cache, Fichiers et données de sites" -ForegroundColor Gray
Write-Host "   - Période: Toutes les périodes" -ForegroundColor Gray
Write-Host "4. Redémarrez le navigateur" -ForegroundColor Yellow
Write-Host "5. Testez en navigation privée (Ctrl+Shift+N)" -ForegroundColor Yellow
Write-Host "`n🌐 URLs:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Production: https://iahome.fr" -ForegroundColor Gray
Write-Host "   - Version: http://localhost:3000/version.txt" -ForegroundColor Gray
Write-Host "`n📋 Build ID: $newBuildId" -ForegroundColor Cyan
Write-Host "💡 Si les changements ne sont toujours pas visibles:" -ForegroundColor Yellow
Write-Host "   - Vérifiez que vous êtes sur la bonne URL" -ForegroundColor Gray
Write-Host "   - Vérifiez les DevTools (F12) pour les erreurs" -ForegroundColor Gray
Write-Host "   - Vérifiez le fichier version.txt pour confirmer le build" -ForegroundColor Gray
Write-Host ""

