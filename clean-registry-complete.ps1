# Script pour nettoyer complètement toutes les clés de registre Cloudflare
# DOIT être exécuté en tant qu'administrateur

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ Ce script DOIT être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "`nPour exécuter :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Exécuter : .\clean-registry-complete.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Nettoyage Complet du Registre Cloudflare            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Arrêter le service et processus
Write-Host "`n1️⃣ Arrêt du service et processus..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    Stop-Service cloudflared -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2
Write-Host "   ✅ Arrêté" -ForegroundColor Green

# Désinstaller le service
Write-Host "`n2️⃣ Désinstallation du service..." -ForegroundColor Yellow
sc.exe delete cloudflared 2>&1 | Out-Null
Start-Sleep -Seconds 2
Write-Host "   ✅ Service désinstallé" -ForegroundColor Green

# Nettoyer toutes les clés de registre possibles
Write-Host "`n3️⃣ Nettoyage des clés de registre..." -ForegroundColor Yellow

$regPaths = @(
    "HKLM:\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared",
    "HKLM:\SYSTEM\CurrentControlSet\Services\cloudflared",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\cloudflared"
)

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        try {
            Remove-Item -Path $regPath -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ Supprimé : $regPath" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur pour $regPath : $($_.Exception.Message)" -ForegroundColor Yellow
            # Essayer avec reg.exe
            $regPathClean = $regPath -replace "HKLM:\\", "HKLM\"
            reg.exe delete $regPathClean /f 2>&1 | Out-Null
            Write-Host "   ✅ Supprimé avec reg.exe" -ForegroundColor Green
        }
    } else {
        Write-Host "   ℹ️  Non trouvé : $regPath" -ForegroundColor Cyan
    }
}

# Nettoyer avec reg.exe aussi (au cas où)
Write-Host "`n4️⃣ Nettoyage supplémentaire avec reg.exe..." -ForegroundColor Yellow
$regPathsCmd = @(
    "HKLM\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared",
    "HKLM\SYSTEM\CurrentControlSet\Services\cloudflared"
)

foreach ($regPath in $regPathsCmd) {
    reg.exe delete $regPath /f 2>&1 | Out-Null
}

Write-Host "   ✅ Nettoyage terminé" -ForegroundColor Green

Write-Host "`n✅ Nettoyage complet terminé !" -ForegroundColor Green
Write-Host "`n📋 Vous pouvez maintenant réinstaller le service :" -ForegroundColor Cyan
Write-Host "   .\reinstall-cloudflare-clean.ps1" -ForegroundColor White
Write-Host "   Ou utilisez cloudflared service install <TOKEN>" -ForegroundColor White
Write-Host ""






