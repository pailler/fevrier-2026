# Script de vérification des URLs QR Code
# Vérifie que toutes les références à localhost:7005 ont été remplacées

Write-Host "🔍 Vérification des URLs QR Code..." -ForegroundColor Cyan

# Rechercher toutes les références à localhost:7005
$localhostRefs = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Extension -match "\.(ts|tsx|js|jsx|py|md|sql|yml|yaml|env|sh)$" 
} | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "localhost:7005") {
        [PSCustomObject]@{
            File = $_.FullName
            Lines = ($content -split "`n" | Select-String "localhost:7005" | ForEach-Object { $_.LineNumber })
        }
    }
}

if ($localhostRefs) {
    Write-Host "❌ Références localhost:7005 trouvées :" -ForegroundColor Red
    $localhostRefs | ForEach-Object {
        Write-Host "  📁 $($_.File)" -ForegroundColor Yellow
        $_.Lines | ForEach-Object {
            Write-Host "    Ligne $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "✅ Aucune référence à localhost:7005 trouvée" -ForegroundColor Green
}

# Rechercher les références à qrcode.regispailler.fr
$qrcodeRefs = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Extension -match "\.(ts|tsx|js|jsx|py|md|sql|yml|yaml|env|sh)$" 
} | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "qrcode\.regispailler\.fr") {
        [PSCustomObject]@{
            File = $_.FullName
            Count = ([regex]::Matches($content, "qrcode\.regispailler\.fr")).Count
        }
    }
}

Write-Host "`n📊 Statistiques des références qrcode.regispailler.fr :" -ForegroundColor Cyan
if ($qrcodeRefs) {
    $totalRefs = ($qrcodeRefs | Measure-Object -Property Count -Sum).Sum
    Write-Host "  Total : $totalRefs références dans $($qrcodeRefs.Count) fichiers" -ForegroundColor Green
    
    $qrcodeRefs | Sort-Object Count -Descending | ForEach-Object {
        Write-Host "  📁 $($_.File) : $($_.Count) références" -ForegroundColor Gray
    }
} else {
    Write-Host "  Aucune référence trouvée" -ForegroundColor Yellow
}

Write-Host "`n✅ Vérification terminée" -ForegroundColor Green


