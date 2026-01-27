# Script pour trouver l'IP du NAS et mettre à jour la configuration Traefik

param(
    [string]$NasIP = "",
    [string]$NasUser = "admin"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration Traefik pour n8n sur NAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($NasIP)) {
    Write-Host "Pour trouver l'IP de votre NAS, exécutez sur le NAS :" -ForegroundColor Yellow
    Write-Host "  hostname -I" -ForegroundColor White
    Write-Host ""
    $NasIP = Read-Host "Entrez l'adresse IP de votre NAS"
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  NAS IP: $NasIP" -ForegroundColor Gray
Write-Host ""

# Lire le fichier n8n.yml
$n8nConfigPath = "traefik\dynamic\n8n.yml"
if (-not (Test-Path $n8nConfigPath)) {
    Write-Host "ERREUR: Fichier $n8nConfigPath introuvable" -ForegroundColor Red
    exit 1
}

$content = Get-Content $n8nConfigPath -Raw

# Remplacer host.docker.internal par l'IP du NAS
$oldUrl = 'http://host.docker.internal:5678'
$newUrl = "http://$NasIP`:5678"

if ($content -match [regex]::Escape($oldUrl)) {
    Write-Host "Mise a jour de la configuration Traefik..." -ForegroundColor Yellow
    $content = $content -replace [regex]::Escape($oldUrl), $newUrl
    
    # Sauvegarder
    $content | Set-Content $n8nConfigPath -Encoding UTF8
    
    Write-Host "OK: Configuration mise a jour" -ForegroundColor Green
    Write-Host "  Ancienne URL: $oldUrl" -ForegroundColor Gray
    Write-Host "  Nouvelle URL: $newUrl" -ForegroundColor Green
} elseif ($content -match [regex]::Escape($newUrl)) {
    Write-Host "La configuration utilise deja l'IP du NAS: $newUrl" -ForegroundColor Green
} else {
    Write-Host "ATTENTION: URL non trouvee dans la configuration" -ForegroundColor Yellow
    Write-Host "Verifiez manuellement le fichier $n8nConfigPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test de connexion au NAS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$NasIP`:5678/healthz" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "OK: n8n est accessible sur http://$NasIP`:5678" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Impossible d'acceder a n8n sur http://$NasIP`:5678" -ForegroundColor Red
    Write-Host "  Verifiez que:" -ForegroundColor Yellow
    Write-Host "    1. n8n est en cours d'execution sur le NAS" -ForegroundColor White
    Write-Host "    2. Le port 5678 est bien expose" -ForegroundColor White
    Write-Host "    3. L'IP du NAS est correcte" -ForegroundColor White
    Write-Host "    4. Le firewall n'bloque pas le port 5678" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Redemarrez Traefik:" -ForegroundColor Yellow
Write-Host "   docker restart iahome-traefik" -ForegroundColor White
Write-Host ""
Write-Host "2. Attendez 30 secondes" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Testez:" -ForegroundColor Yellow
Write-Host "   curl https://n8n.regispailler.fr/healthz" -ForegroundColor White
Write-Host ""
