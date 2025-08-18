# Script pour remplacer localhost:3000 par iahome.fr
Write-Host "Remplacement de localhost:3000 par iahome.fr..." -ForegroundColor Green

# Fichiers à traiter
$files = @(
    "src/utils/jwt.ts",
    "src/utils/emailService.ts",
    "src/app/proxy/[module]/page.tsx",
    "src/app/validation/page.tsx",
    "src/app/stripe-return/page.tsx",
    "src/app/api/create-payment-intent/route.ts",
    "src/app/api/create-magic-link/route.ts",
    "src/app/api/generate-module-token-webhook/route.ts",
    "src/app/api/generate-access-link/route.ts",
    "src/app/api/proxy-access/route.ts",
    "src/app/api/webhooks/stripe/route.ts",
    "src/app/api/registry/creds/route.ts",
    "error-pages/401.html"
)

# Remplacer dans chaque fichier
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Traitement de $file" -ForegroundColor Yellow
        
        # Lire le contenu
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remplacer les occurrences
        $content = $content -replace 'localhost:3000', 'iahome.fr'
        $content = $content -replace 'http://localhost:3000', 'https://iahome.fr'
        $content = $content -replace 'https://localhost:3000', 'https://iahome.fr'
        
        # Écrire le contenu modifié
        Set-Content $file $content -Encoding UTF8
        
        Write-Host "$file mis a jour" -ForegroundColor Green
    } else {
        Write-Host "Fichier $file non trouve" -ForegroundColor Yellow
    }
}

Write-Host "Remplacement termine !" -ForegroundColor Green
