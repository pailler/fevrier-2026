# Script pour remplacer toutes les occurrences de iahome.fr par localhost:3000
Write-Host "Remplacement des URLs iahome.fr par localhost:3000" -ForegroundColor Green

# 1. Fichiers à traiter (excluant les fichiers de configuration Docker/Traefik)
$filesToProcess = @(
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx",
    "*.md",
    "env.*",
    "error-pages/*.html"
)

# 2. Remplacer les occurrences
$replacements = @{
    "https://iahome\.fr" = "http://localhost:3000"
    "http://iahome\.fr" = "http://localhost:3000"
    "iahome\.fr" = "localhost:3000"
}

$totalReplacements = 0

foreach ($pattern in $filesToProcess) {
    $files = Get-ChildItem -Path $pattern -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $originalContent = $content
            foreach ($search in $replacements.Keys) {
                $replace = $replacements[$search]
                $newContent = $content -replace $search, $replace
                if ($newContent -ne $content) {
                    $content = $newContent
                    $count = ([regex]::Matches($originalContent, $search)).Count
                    $totalReplacements += $count
                    Write-Host "✅ $($file.Name): $count remplacement(s) de '$search' par '$replace'" -ForegroundColor Yellow
                }
            }
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
            }
        }
    }
}

Write-Host "`nRésumé des remplacements:" -ForegroundColor Green
Write-Host "Total de remplacements effectués: $totalReplacements" -ForegroundColor Cyan

Write-Host "`nFichiers de configuration Docker/Traefik non modifiés (à traiter manuellement si nécessaire):" -ForegroundColor Yellow
Write-Host "- docker-compose.prod.yml" -ForegroundColor White
Write-Host "- traefik/traefik.yml" -ForegroundColor White
Write-Host "- traefik/traefik-nas.yml" -ForegroundColor White
Write-Host "- nginx/*.conf" -ForegroundColor White
Write-Host "- portainer-stack.yml" -ForegroundColor White

Write-Host "`nRemplacement terminé!" -ForegroundColor Green
Write-Host "Redémarrez le serveur pour appliquer les changements" -ForegroundColor Yellow
