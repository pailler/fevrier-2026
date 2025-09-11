# Script pour nettoyer les references a l'ancien domaine
Write-Host "Nettoyage des references a l'ancien domaine..." -ForegroundColor Yellow

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

$modifiedFiles = 0

# Trouver tous les fichiers TypeScript et JavaScript
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Where-Object { $_.Name -notlike "*.d.ts" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($oldDomain in $replacements.Keys) {
        $newDomain = $replacements[$oldDomain]
        $content = $content -replace [regex]::Escape($oldDomain), $newDomain
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Modifie: $($file.Name)" -ForegroundColor Green
        $modifiedFiles++
    }
}

Write-Host "Fichiers modifies: $modifiedFiles" -ForegroundColor Green
Write-Host "Nettoyage termine!" -ForegroundColor Green
