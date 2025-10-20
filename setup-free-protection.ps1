# Script de configuration de la protection gratuite
# Modifie la configuration du tunnel Cloudflare existant

Write-Host "Configuration de la protection gratuite des sous-domaines" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Sauvegarder la configuration actuelle
Write-Host "`n1. Sauvegarde de la configuration actuelle..." -ForegroundColor Yellow

if (Test-Path "cloudflare-complete-config.yml") {
    Copy-Item "cloudflare-complete-config.yml" "cloudflare-complete-config.yml.backup"
    Write-Host "   Configuration sauvegardee dans cloudflare-complete-config.yml.backup" -ForegroundColor Green
} else {
    Write-Host "   Fichier cloudflare-complete-config.yml non trouve" -ForegroundColor Red
    exit 1
}

# 2. Creer le repertoire pour la page de redirection
Write-Host "`n2. Preparation de la page de redirection..." -ForegroundColor Yellow

$redirectDir = "subdomain-protection"
if (-not (Test-Path $redirectDir)) {
    New-Item -ItemType Directory -Path $redirectDir
    Write-Host "   Repertoire $redirectDir cree" -ForegroundColor Green
}

# Copier la page de redirection
if (Test-Path "subdomain-redirect.html") {
    Copy-Item "subdomain-redirect.html" "$redirectDir\index.html"
    Write-Host "   Page de redirection copiee" -ForegroundColor Green
} else {
    Write-Host "   Fichier subdomain-redirect.html non trouve" -ForegroundColor Red
    exit 1
}

# 3. Modifier la configuration du tunnel
Write-Host "`n3. Modification de la configuration du tunnel..." -ForegroundColor Yellow

$configContent = @"
# Configuration Cloudflare Tunnel avec protection gratuite
# Utilise une page HTML statique pour la redirection

tunnel: iahome-secure
credentials-file: /root/.cloudflared/iahome-secure.json

# Configuration des origines avec protection gratuite
ingress:
  # LibreSpeed avec page de redirection
  - hostname: librespeed.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: librespeed.iahome.fr

  # Meeting Reports avec page de redirection
  - hostname: meeting-reports.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: meeting-reports.iahome.fr

  # Whisper avec page de redirection
  - hostname: whisper.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: whisper.iahome.fr

  # ComfyUI avec page de redirection
  - hostname: comfyui.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: comfyui.iahome.fr

  # Stable Diffusion avec page de redirection
  - hostname: stablediffusion.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: stablediffusion.iahome.fr

  # QR Codes avec page de redirection
  - hostname: qrcodes.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: qrcodes.iahome.fr

  # PsiTransfer avec page de redirection
  - hostname: psitransfer.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: psitransfer.iahome.fr

  # MeTube avec page de redirection
  - hostname: metube.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: metube.iahome.fr

  # PDF avec page de redirection
  - hostname: pdf.iahome.fr
    service: file:///$redirectDir/index.html
    originRequest:
      httpHostHeader: pdf.iahome.fr

  # Acces normal a iahome.fr (sans protection)
  - hostname: iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: iahome.fr

  # Page de redirection par defaut
  - service: http_status:404
"@

$configContent | Out-File -FilePath "cloudflare-complete-config.yml" -Encoding UTF8
Write-Host "   Configuration modifiee" -ForegroundColor Green

# 4. Redemarrer le tunnel
Write-Host "`n4. Redemarrage du tunnel Cloudflare..." -ForegroundColor Yellow

try {
    # Arreter le tunnel existant
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   Tunnel arrete" -ForegroundColor Green
    
    # Attendre un peu
    Start-Sleep -Seconds 3
    
    # Redemarrer le tunnel
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-secure" -WindowStyle Hidden
    Write-Host "   Tunnel redemarre" -ForegroundColor Green
} catch {
    Write-Host "   Erreur lors du redemarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nConfiguration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee :" -ForegroundColor Cyan
Write-Host "   • Page de redirection pour tous les sous-domaines" -ForegroundColor White
Write-Host "   • Verification des tokens et referer cote client" -ForegroundColor White
Write-Host "   • Redirection automatique vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • Solution 100% gratuite" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Page de redirection" -ForegroundColor White
Write-Host "   • https://librespeed.iahome.fr?token=abc123 → Acces autorise" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow