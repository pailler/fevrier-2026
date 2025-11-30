# Script pour redemarrer les conteneurs via Telnet
# Usage: .\restart-via-telnet.ps1

param(
    [string]$NasIp = "192.168.1.130",
    [string]$NasUser = "admin"
)

$NasPath = "/volume1/docker/game-reservation"

Write-Host "Redemarrage des conteneurs Docker via Telnet" -ForegroundColor Cyan
Write-Host ""

# Creer un script temporaire avec les commandes
$scriptContent = @"
cd $NasPath
sudo docker-compose restart
sudo docker-compose ps
exit
"@

$tempScript = [System.IO.Path]::GetTempFileName()
$scriptContent | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "Commandes a executer:" -ForegroundColor Yellow
Write-Host "  cd $NasPath" -ForegroundColor White
Write-Host "  sudo docker-compose restart" -ForegroundColor White
Write-Host "  sudo docker-compose ps" -ForegroundColor White
Write-Host ""

Write-Host "Option 1: Executer manuellement via votre session Telnet" -ForegroundColor Green
Write-Host "  Copiez-collez les commandes ci-dessus" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Utiliser plink avec authentification" -ForegroundColor Green
Write-Host "  plink -telnet $NasIp" -ForegroundColor White
Write-Host "  (Puis entrez vos identifiants et les commandes)" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Activer SSH pour automatisation" -ForegroundColor Green
Write-Host "  Control Panel > Terminal & SNMP > Enable SSH service" -ForegroundColor White
Write-Host "  Puis utilisez: ssh $NasUser@$NasIp" -ForegroundColor White
Write-Host ""

# Nettoyer
Remove-Item $tempScript -ErrorAction SilentlyContinue


