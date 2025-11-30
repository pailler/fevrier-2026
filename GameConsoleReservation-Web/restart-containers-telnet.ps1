# Script pour redemarrer les conteneurs via Telnet
# Usage: .\restart-containers-telnet.ps1

param(
    [string]$NasIp = "192.168.1.130",
    [string]$NasUser = "admin",
    [string]$NasPath = "/volume1/docker/game-reservation"
)

Write-Host "Redemarrage des conteneurs via Telnet..." -ForegroundColor Cyan

# Commande a executer
$command = "cd $NasPath && sudo docker-compose restart"

# Utiliser plink (PuTTY) si disponible, sinon utiliser telnet classique
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if ($plinkPath) {
    Write-Host "Utilisation de plink (PuTTY)..." -ForegroundColor Yellow
    # Avec plink, on peut executer directement une commande
    $result = & plink -telnet $NasIp -l $NasUser -pw "" "$command" 2>&1
    Write-Host $result
} else {
    Write-Host "Plink non trouve. Utilisation de telnet classique..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IMPORTANT: Telnet classique ne permet pas l'execution automatique." -ForegroundColor Red
    Write-Host "Veuillez executer manuellement ces commandes apres connexion:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  cd $NasPath" -ForegroundColor White
    Write-Host "  sudo docker-compose restart" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou utilisez SSH si disponible:" -ForegroundColor Yellow
    Write-Host "  ssh $NasUser@$NasIp" -ForegroundColor White
    Write-Host "  cd $NasPath" -ForegroundColor White
    Write-Host "  sudo docker-compose restart" -ForegroundColor White
}


