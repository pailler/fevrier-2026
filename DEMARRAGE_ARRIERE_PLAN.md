# 🚀 Démarrage des services en arrière-plan

## ❌ Problème actuel

Les services sont démarrés dans des fenêtres PowerShell qui doivent rester ouvertes. Si vous fermez ces fenêtres, les services s'arrêtent.

## ✅ Solution : Démarrage en arrière-plan

J'ai créé un script `start-consoles-background.ps1` qui démarre les services **sans fenêtres PowerShell visibles**.

## 🎯 Utilisation

### Démarrer les services en arrière-plan
```powershell
.\start-consoles-background.ps1
```

Les services démarrent **sans fenêtres visibles**. Vous pouvez fermer PowerShell après le démarrage.

### Vérifier le statut
```powershell
.\start-consoles-background.ps1 -Status
```

### Arrêter les services
```powershell
.\start-consoles-background.ps1 -Stop
```

## 🔄 Alternative : Services Windows (Recommandé pour production)

Pour une solution encore plus robuste, vous pouvez créer des services Windows qui démarrent automatiquement au boot :

### Option 1 : Utiliser NSSM (Non-Sucking Service Manager)

1. **Télécharger NSSM** : https://nssm.cc/download
2. **Installer le service Backend** :
   ```powershell
   nssm install GameConsoleBackend "C:\Program Files\nodejs\node.exe" "C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web\backend\server.js"
   nssm set GameConsoleBackend AppDirectory "C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web\backend"
   nssm set GameConsoleBackend AppEnvironmentExtra "PORT=5001"
   nssm start GameConsoleBackend
   ```

3. **Installer le service Frontend** :
   ```powershell
   nssm install GameConsoleFrontend "C:\Python313\python.exe" "-m http.server 5000"
   nssm set GameConsoleFrontend AppDirectory "C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web"
   nssm start GameConsoleFrontend
   ```

### Option 2 : Utiliser Task Scheduler (Planificateur de tâches)

1. **Ouvrir** le Planificateur de tâches
2. **Créer une tâche** pour chaque service
3. **Configurer** pour démarrer au démarrage de Windows
4. **Action** : Démarrer un programme
   - Backend : `node.exe` avec argument `server.js`
   - Frontend : `python.exe` avec argument `-m http.server 5000`

## 📝 Comparaison des méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|--------------|
| **Fenêtres PowerShell** | Simple, visible | Doit rester ouvert |
| **Arrière-plan (script)** | Pas de fenêtres | Doit être relancé après redémarrage |
| **Services Windows (NSSM)** | Démarrage auto, robuste | Configuration plus complexe |
| **Task Scheduler** | Intégré Windows | Configuration manuelle |

## 🎯 Recommandation

Pour un usage quotidien :
- **Utilisez** `start-consoles-background.ps1` (simple, pas de fenêtres)

Pour un serveur de production :
- **Utilisez** NSSM ou Task Scheduler (démarrage automatique)

## 💡 Note sur Cloudflare Tunnel

Cloudflare Tunnel (`cloudflared`) peut aussi être configuré comme service Windows :
```powershell
# Installer cloudflared comme service
cloudflared service install

# Démarrer le service
Start-Service cloudflared
```

Le service utilisera automatiquement la configuration dans `cloudflare-active-config.yml`.







