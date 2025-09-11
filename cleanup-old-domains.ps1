# Script pour nettoyer toutes les références à l'ancien domaine regispailler.fr
Write-Host "🧹 Nettoyage des références à l'ancien domaine..." -ForegroundColor Yellow

# Liste des fichiers à nettoyer
$files = @(
    "src\app\api\qr-code-access\route.ts",
    "src\app\api\psitransfer-proxy\test\route.ts",
    "src\app\api\psitransfer-proxy\health\route.ts",
    "src\app\api\proxy-qrcode\route.ts",
    "src\app\api\pdf-proxy\test\route.ts",
    "src\app\api\pdf-proxy\static\[...path]\route.ts",
    "src\app\api\pdf-proxy\[...path]\route.ts",
    "src\app\api\pdf-proxy\health\route.ts",
    "src\app\api\pdf-proxy\route.ts",
    "src\app\api\metube-proxy\test\route.ts",
    "src\app\api\metube-proxy\route.ts",
    "src\app\api\metube-proxy\[...path]\route.ts",
    "src\app\api\metube-proxy\health\route.ts",
    "src\app\api\librespeed-proxy\test\route.ts",
    "src\app\api\librespeed-proxy\route.ts",
    "src\app\api\librespeed-proxy\[...path]\route.ts",
    "src\app\api\librespeed-proxy\health\route.ts",
    "src\components\ModuleModals.tsx",
    "src\app\selections\page.tsx",
    "src\app\api\generate-module-token\route.ts",
    "src\app\admin\modules\page.tsx",
    "src\app\card\invoke\page.tsx",
    "src\app\card\sdnext\page.tsx",
    "src\app\card\comfyui\page.tsx",
    "src\app\card\ruinedfooocus\page.tsx",
    "src\app\card\stablediffusion\page.tsx",
    "src\app\card\cogstudio\page.tsx",
    "src\app\api\module-access\route.ts",
    "src\app\api\stablediffusion-redirect\route.ts",
    "src\app\api\stablediffusion-proxy\route.ts",
    "src\app\api\proxy-module\route.ts",
    "src\app\api\proxy-module\content\route.ts",
    "src\app\api\generate-magic-link\route.ts",
    "src\app\api\generate-access-url\route.ts",
    "src\app\api\direct-stablediffusion\route.ts",
    "src\app\api\direct-access\route.ts",
    "src\app\access\[token]\page-simple.tsx",
    "src\app\api\proxy-module\[...path]\route.ts"
)

# Mappings de remplacement
$replacements = @{
    "regispailler.fr" = "iahome.fr"
    "home.regispailler.fr" = "iahome.fr"
    "qrcode.regispailler.fr" = "qrcode.iahome.fr"
    "qrcodes.regispailler.fr" = "qrcodes.iahome.fr"
    "librespeed.regispailler.fr" = "librespeed.iahome.fr"
    "metube.regispailler.fr" = "metube.iahome.fr"
    "pdf.regispailler.fr" = "pdf.iahome.fr"
    "psitransfer.regispailler.fr" = "psitransfer.iahome.fr"
    "stablediffusion.regispailler.fr" = "stablediffusion.iahome.fr"
    "iaphoto.regispailler.fr" = "iaphoto.iahome.fr"
    "chatgpt.regispailler.fr" = "chatgpt.iahome.fr"
    "aiassistant.regispailler.fr" = "aiassistant.iahome.fr"
    "cogstudio.regispailler.fr" = "cogstudio.iahome.fr"
    "invoke.regispailler.fr" = "invoke.iahome.fr"
    "comfyui.regispailler.fr" = "comfyui.iahome.fr"
    "sdnext.regispailler.fr" = "sdnext.iahome.fr"
    "ruinedfooocus.regispailler.fr" = "ruinedfooocus.iahome.fr"
}

$totalFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $totalFiles++
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        foreach ($oldDomain in $replacements.Keys) {
            $newDomain = $replacements[$oldDomain]
            $content = $content -replace [regex]::Escape($oldDomain), $newDomain
        }
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "✅ Modifié: $file" -ForegroundColor Green
            $modifiedFiles++
        } else {
            Write-Host "⚪ Aucun changement: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    }
}

Write-Host "`n📊 Résumé du nettoyage:" -ForegroundColor Cyan
Write-Host "   - Fichiers traités: $totalFiles" -ForegroundColor White
Write-Host "   - Fichiers modifiés: $modifiedFiles" -ForegroundColor Green
Write-Host "   - Fichiers non trouvés: $($files.Count - $totalFiles)" -ForegroundColor Yellow

Write-Host "`n🎉 Nettoyage terminé!" -ForegroundColor Green
