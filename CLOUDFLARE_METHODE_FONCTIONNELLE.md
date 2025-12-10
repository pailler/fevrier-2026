# Méthode fonctionnelle pour démarrer Cloudflare Tunnel

## ✅ Méthode qui fonctionne

**Démarrage direct sans service Windows**

### Script utilisé
- `scripts/start-cloudflare-simple.ps1`
- `scripts/start-cloudflare-auto-start.ps1` (pour démarrage automatique)

### Commande PowerShell
```powershell
Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" `
    -ArgumentList "tunnel", "--config", "C:\Users\AAA\Documents\iahome\cloudflare-active-config.yml", "run" `
    -WorkingDirectory "C:\Users\AAA\Documents\iahome" `
    -WindowStyle Hidden `
    -PassThru
```

### Caractéristiques
- ✅ Démarre cloudflared en arrière-plan
- ✅ Utilise `WindowStyle Hidden` pour ne pas afficher de fenêtre
- ✅ Sauvegarde le PID dans `cloudflared.pid`
- ✅ Fonctionne sans installer de service Windows
- ✅ Reste actif jusqu'au redémarrage

### Pour démarrer manuellement
```powershell
.\scripts\start-cloudflare-simple.ps1
```

### Pour démarrer automatiquement au démarrage de Windows
```powershell
.\scripts\install-cloudflare-autostart.ps1
```

Cela crée une tâche planifiée Windows qui exécute `start-cloudflare-auto-start.ps1` au démarrage.

## ❌ Méthodes qui ne fonctionnent pas

- `cloudflared service install` - Échoue silencieusement
- Installation manuelle avec `sc.exe` - Problèmes de configuration
- `New-Service` PowerShell - Problèmes de permissions

## 📝 Notes

- Le tunnel doit être démarré après chaque redémarrage de Windows
- La tâche planifiée gère automatiquement le redémarrage
- Les logs sont sauvegardés dans `cloudflared-startup.log` et `cloudflared-startup-error.log`














