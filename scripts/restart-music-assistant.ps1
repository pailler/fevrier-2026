<#
.SYNOPSIS
    Redémarre l'add-on Music Assistant sur la VM Home Assistant (192.168.1.51).
.DESCRIPTION
    Nécessite un jeton d'accès longue durée Home Assistant (Paramètres > Sécurité > Jetons d'accès).
    Variable d'environnement optionnelle : HA_LONG_LIVED_ACCESS_TOKEN
.PARAMETER HaUrl
    URL Home Assistant pour l'API Supervisor (redemarrage add-on).
    Defaut : http://192.168.1.51:8123 — ou https://ha.regispailler.fr
.PARAMETER MaUrl
    URL Music Assistant pour verifier que le service repond apres redemarrage.
    Defaut : https://ma.regispailler.fr (pas 127.0.0.1 ni :8095 en public)
.PARAMETER Token
    Jeton longue durée HA. Sinon lu depuis $env:HA_LONG_LIVED_ACCESS_TOKEN
.PARAMETER AddonSlug
    Slug de l'add-on (défaut : d5369777_music_assistant)
.EXAMPLE
    $env:HA_LONG_LIVED_ACCESS_TOKEN = "eyJ..."
    .\scripts\restart-music-assistant.ps1
#>

param(
    [string]$HaUrl = "http://192.168.1.51:8123",
    [string]$MaUrl = "https://ma.regispailler.fr",
    [string]$Token = $env:HA_LONG_LIVED_ACCESS_TOKEN,
    [string]$AddonSlug = "d5369777_music_assistant"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "[X] Jeton HA manquant." -ForegroundColor Red
    Write-Host "    Creez un jeton : HA > Parametres > Securite > Jetons d'acces" -ForegroundColor Yellow
    Write-Host "    Puis : `$env:HA_LONG_LIVED_ACCESS_TOKEN = 'votre_jeton'" -ForegroundColor Yellow
    Write-Host "    Ou   : .\scripts\restart-music-assistant.ps1 -Token 'votre_jeton'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    Authorization = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "`nRedemarrage Music Assistant ($AddonSlug)..." -ForegroundColor Cyan

try {
    $restartUrl = "$HaUrl/api/hassio/addons/$AddonSlug/restart"
    Invoke-RestMethod -Uri $restartUrl -Method POST -Headers $headers -TimeoutSec 120 | Out-Null
    Write-Host "[OK] Commande de redemarrage envoyee." -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "[!] Add-on '$AddonSlug' introuvable. Liste des add-ons :" -ForegroundColor Yellow
        try {
            $addons = Invoke-RestMethod -Uri "$HaUrl/api/hassio/addons" -Headers $headers -TimeoutSec 30
            $addons.data.addons | Where-Object { $_.name -match 'music|Music' -or $_.slug -match 'music' } |
                ForEach-Object { Write-Host "    slug: $($_.slug)  name: $($_.name)  state: $($_.state)" -ForegroundColor Gray }
        } catch {
            Write-Host "    (impossible de lister les add-ons)" -ForegroundColor Gray
        }
    }
    Write-Host "[X] Erreur : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Attente de Music Assistant ($MaUrl)..." -ForegroundColor Gray
$deadline = (Get-Date).AddMinutes(3)
$ok = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-WebRequest -Uri $MaUrl -TimeoutSec 15 -UseBasicParsing
        if ($r.StatusCode -eq 200) {
            $ok = $true
            break
        }
    } catch {
        # encore en demarrage
    }
    Write-Host "  ... en cours" -ForegroundColor DarkGray
}

if ($ok) {
    Write-Host "[OK] Music Assistant repond sur $MaUrl" -ForegroundColor Green
} else {
    Write-Host "[!] Le port 8095 ne repond pas encore. Verifiez les logs de l'add-on dans HA." -ForegroundColor Yellow
}

Write-Host ""
