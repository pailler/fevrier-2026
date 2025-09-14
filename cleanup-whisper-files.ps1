# Script de nettoyage des fichiers temporaires Whisper
Write-Host "🧹 Nettoyage des fichiers temporaires Whisper IA..." -ForegroundColor Blue

# Fichiers à supprimer (optionnel)
$tempFiles = @(
    "insert-whisper-module.ps1",
    "test-whisper-module.ps1"
)

Write-Host "`n📋 Fichiers temporaires identifiés:" -ForegroundColor Yellow
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Write-Host "   - $file" -ForegroundColor White
    }
}

$confirm = Read-Host "`n❓ Voulez-vous supprimer ces fichiers temporaires ? (y/N)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    foreach ($file in $tempFiles) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Host "   ✅ $file supprimé" -ForegroundColor Green
        }
    }
    Write-Host "`n🎉 Nettoyage terminé !" -ForegroundColor Green
} else {
    Write-Host "`n⏭️ Nettoyage annulé" -ForegroundColor Yellow
}

Write-Host "`n📁 Fichiers conservés (essentiels):" -ForegroundColor Cyan
Write-Host "   ✅ src/app/card/whisper/page.tsx" -ForegroundColor White
Write-Host "   ✅ public/images/module-visuals/whisper-module.svg" -ForegroundColor White
Write-Host "   ✅ src/app/api/insert-whisper/route.ts" -ForegroundColor White
Write-Host "   ✅ deploy-whisper-module.ps1" -ForegroundColor White
Write-Host "   ✅ README-whisper-module.md" -ForegroundColor White
Write-Host "   ✅ docker-services/docker-compose.whisper.yml" -ForegroundColor White
