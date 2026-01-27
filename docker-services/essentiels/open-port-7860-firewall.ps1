# Script pour ouvrir le port 7860 dans le pare-feu Windows pour Automatic1111
Write-Host "🔥 Configuration du pare-feu Windows pour le port 7860" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Vérifier si le script est exécuté en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n⚠️  Ce script nécessite des privilèges administrateur" -ForegroundColor Yellow
    Write-Host "Veuillez exécuter PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Fermez cette fenêtre PowerShell" -ForegroundColor White
    Write-Host "2. Clic droit sur PowerShell > Exécuter en tant qu'administrateur" -ForegroundColor White
    Write-Host "3. Naviguez vers: cd docker-services\essentiels" -ForegroundColor White
    Write-Host "4. Exécutez: .\open-port-7860-firewall.ps1" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Privilèges administrateur confirmés" -ForegroundColor Green

# Vérifier si la règle existe déjà
$existingRule = Get-NetFirewallRule -DisplayName "Automatic1111 Port 7860" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "`n📋 Règle de pare-feu existante trouvée" -ForegroundColor Yellow
    $existingRule | Format-Table DisplayName, Enabled, Direction, Action
    Write-Host ""
    $update = Read-Host "Voulez-vous mettre à jour la règle existante? (O/N)"
    if ($update -eq 'O' -or $update -eq 'o' -or $update -eq 'Y' -or $update -eq 'y') {
        Remove-NetFirewallRule -DisplayName "Automatic1111 Port 7860" -ErrorAction SilentlyContinue
    } else {
        Write-Host "Règle existante conservée" -ForegroundColor Green
        exit 0
    }
}

# Créer la règle de pare-feu pour le port 7860 (entrant)
Write-Host "`n1. Création de la règle de pare-feu pour le port 7860 (entrant)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Automatic1111 Port 7860 (Inbound)" `
    -Description "Autorise le trafic entrant sur le port 7860 pour Automatic1111 (Stable Diffusion WebUI)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 7860 `
    -Action Allow `
    -Enabled True `
    -Profile Any | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Règle entrante créée avec succès" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors de la création de la règle entrante" -ForegroundColor Red
}

# Créer la règle de pare-feu pour le port 7860 (sortant) - généralement pas nécessaire mais utile
Write-Host "`n2. Création de la règle de pare-feu pour le port 7860 (sortant)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Automatic1111 Port 7860 (Outbound)" `
    -Description "Autorise le trafic sortant sur le port 7860 pour Automatic1111 (Stable Diffusion WebUI)" `
    -Direction Outbound `
    -Protocol TCP `
    -LocalPort 7860 `
    -Action Allow `
    -Enabled True `
    -Profile Any | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Règle sortante créée avec succès" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors de la création de la règle sortante" -ForegroundColor Red
}

# Vérifier les règles créées
Write-Host "`n3. Vérification des règles créées..." -ForegroundColor Yellow
$rules = Get-NetFirewallRule -DisplayName "*Automatic1111*" | Select-Object DisplayName, Enabled, Direction, Action
if ($rules) {
    Write-Host "   ✅ Règles de pare-feu actives:" -ForegroundColor Green
    $rules | Format-Table -AutoSize
} else {
    Write-Host "   ⚠️  Aucune règle trouvée" -ForegroundColor Yellow
}

Write-Host "`n✅ Configuration du pare-feu terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Le port 7860 est maintenant ouvert dans le pare-feu Windows" -ForegroundColor Cyan
Write-Host "Automatic1111 pourra accepter les connexions depuis d'autres machines sur le réseau" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Le port s'ouvrira automatiquement quand Automatic1111 démarrera complètement" -ForegroundColor Yellow
Write-Host "      Vérifiez avec: Test-NetConnection -ComputerName localhost -Port 7860" -ForegroundColor Gray
