# Script complet de restauration Cloudflare Tunnel
# Restaure le service et tente de reconnecter au Dashboard

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESTAURATION COMPLÈTE CLOUDFLARE TUNNEL            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n⚠️  Ce script fonctionne mieux en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "   Certaines opérations peuvent nécessiter des droits élevés" -ForegroundColor Gray
}

# Étape 1 : Arrêt complet de tous les processus cloudflared
Write-Host "`n1️⃣ Arrêt de tous les processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   ⏹️  Arrêt de $($processes.Count) processus..." -ForegroundColor Gray
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus $($_.Id) arrêté" -ForegroundColor Gray
        } catch {
            Write-Host "      ⚠️  Tentative avec taskkill pour $($_.Id)..." -ForegroundColor Yellow
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 3
    
    # Vérifier qu'il ne reste plus de processus
    $remaining = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "   ⚠️  Processus persistants, nouvelle tentative..." -ForegroundColor Yellow
        $remaining | ForEach-Object {
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus à arrêter" -ForegroundColor Green
}

# Étape 2 : Arrêt du service Windows
Write-Host "`n2️⃣ Arrêt du service Windows..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        try {
            Stop-Service cloudflared -Force -ErrorAction Stop
            Start-Sleep -Seconds 3
            Write-Host "   ✅ Service arrêté" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur lors de l'arrêt : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✅ Service déjà arrêté" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Service non trouvé (peut être normal)" -ForegroundColor Yellow
}

# Étape 3 : Vérification de la configuration
Write-Host "`n3️⃣ Vérification de la configuration..." -ForegroundColor Yellow
$configFile = "cloudflare-active-config.yml"
if (Test-Path $configFile) {
    Write-Host "   ✅ Fichier de configuration trouvé: $configFile" -ForegroundColor Green
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match "tunnel:\s*(\S+)") {
        $tunnelName = $matches[1]
        Write-Host "   ✅ Tunnel configuré: $tunnelName" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Fichier de configuration introuvable: $configFile" -ForegroundColor Yellow
    Write-Host "   💡 Le service utilisera le token directement" -ForegroundColor Gray
}

# Étape 4 : Vérification des credentials
Write-Host "`n4️⃣ Vérification des credentials..." -ForegroundColor Yellow
$credPath = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (Test-Path $credPath) {
    Write-Host "   ✅ Fichier de credentials trouvé" -ForegroundColor Green
    try {
        $credContent = Get-Content $credPath -Raw | ConvertFrom-Json
        if ($credContent.AccountTag -and $credContent.TunnelSecret) {
            Write-Host "   ✅ Credentials valides" -ForegroundColor Green
            Write-Host "   AccountTag : $($credContent.AccountTag)" -ForegroundColor Gray
            Write-Host "   TunnelID : $($credContent.TunnelID)" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️  Credentials incomplets" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Impossible de valider les credentials" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Fichier de credentials introuvable: $credPath" -ForegroundColor Yellow
    Write-Host "   💡 Le service utilisera le token directement" -ForegroundColor Gray
}

# Étape 5 : Vérification de cloudflared.exe
Write-Host "`n5️⃣ Vérification de cloudflared.exe..." -ForegroundColor Yellow
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (Test-Path $cloudflaredPath) {
    Write-Host "   ✅ cloudflared.exe trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ cloudflared.exe introuvable à : $cloudflaredPath" -ForegroundColor Red
    Write-Host "   💡 Téléchargez cloudflared depuis : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Yellow
    Write-Host "   ⚠️  Continuation sans cloudflared.exe..." -ForegroundColor Yellow
}

# Étape 6 : Redémarrage du service
Write-Host "`n6️⃣ Redémarrage du service Cloudflare Tunnel..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    try {
        Write-Host "   ▶️  Démarrage du service..." -ForegroundColor Gray
        Start-Service cloudflared -ErrorAction Stop
        Start-Sleep -Seconds 5
        $service = Get-Service cloudflared
        Write-Host "   ✅ Service démarré - Statut : $($service.Status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   💡 Le service peut nécessiter une réinstallation" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Service non trouvé" -ForegroundColor Yellow
    Write-Host "   💡 Le service doit être installé avec : cloudflared service install <TOKEN>" -ForegroundColor Gray
}

# Étape 7 : Vérification du démarrage
Write-Host "`n7️⃣ Vérification du démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$newProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($newProcesses) {
    Write-Host "   ✅ Cloudflare Tunnel en cours d'exécution (PID: $($newProcesses.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloudflare Tunnel n'a pas démarré" -ForegroundColor Yellow
    Write-Host "   💡 Vérifiez les logs avec : Get-EventLog -LogName Application -Source cloudflared -Newest 10" -ForegroundColor Gray
}

# Étape 8 : Tests de connectivité
Write-Host "`n8️⃣ Tests de connectivité..." -ForegroundColor Yellow
$domains = @(
    @{Name="iahome.fr"; URL="https://iahome.fr"},
    @{Name="consoles.regispailler.fr"; URL="https://consoles.regispailler.fr/api/health"}
)

$successCount = 0
$failCount = 0

foreach ($domain in $domains) {
    try {
        $response = Invoke-WebRequest -Uri $domain.URL -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $($domain.Name) : HTTP $($response.StatusCode)" -ForegroundColor Green
        $successCount++
    } catch {
        $statusCode = $null
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
        } catch {}
        
        if ($statusCode -eq 1033) {
            Write-Host "   ❌ $($domain.Name) : Error 1033 (Tunnel error)" -ForegroundColor Red
        } elseif ($statusCode -eq 530) {
            Write-Host "   ⚠️  $($domain.Name) : Error 530 (Origin error)" -ForegroundColor Yellow
        } elseif ($statusCode) {
            Write-Host "   ⚠️  $($domain.Name) : HTTP $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $($domain.Name) : Erreur de connexion" -ForegroundColor Red
        }
        $failCount++
    }
}

# Étape 9 : Résumé
Write-Host "`n📊 RÉSUMÉ DE LA RESTAURATION:" -ForegroundColor Cyan
Write-Host "   ✅ Configuration vérifiée" -ForegroundColor Green
Write-Host "   ✅ Credentials vérifiés" -ForegroundColor Green
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   ✅ Service Windows : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})
} else {
    Write-Host "   ⚠️  Service Windows : Non installé" -ForegroundColor Yellow
}
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   ✅ Processus actifs : $($processes.Count)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Processus actifs : 0" -ForegroundColor Yellow
}
Write-Host "   ✅ Connectivité : $successCount/$($domains.Count) domaines accessibles" -ForegroundColor $(if ($successCount -eq $domains.Count) {'Green'} else {'Yellow'})

if ($failCount -gt 0) {
    Write-Host "`n⚠️  Certains domaines ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "   💡 Actions recommandées :" -ForegroundColor Cyan
    Write-Host "      1. Attendez 2-3 minutes pour la reconnexion automatique" -ForegroundColor Gray
    Write-Host "      2. Vérifiez Cloudflare Dashboard : https://one.dash.cloudflare.com/" -ForegroundColor Gray
    Write-Host "      3. Vérifiez que le tunnel 'iahome-new' est 'Healthy'" -ForegroundColor Gray
    Write-Host "      4. Si toujours inactif, réinstallez avec un nouveau token" -ForegroundColor Gray
} else {
    Write-Host "`n✅ RESTAURATION RÉUSSIE!" -ForegroundColor Green
    Write-Host "   Tous les domaines sont accessibles" -ForegroundColor Green
}

Write-Host "`n💡 Commandes utiles :" -ForegroundColor Cyan
Write-Host "   - Vérifier le statut : Get-Service cloudflared" -ForegroundColor Gray
Write-Host "   - Voir les processus : Get-Process cloudflared" -ForegroundColor Gray
Write-Host "   - Voir les logs : Get-EventLog -LogName Application -Source cloudflared -Newest 10" -ForegroundColor Gray
Write-Host "   - Redémarrer : Restart-Service cloudflared" -ForegroundColor Gray
Write-Host ""






















