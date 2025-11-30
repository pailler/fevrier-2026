# Solution : Configuration Cloudflare Tunnel pour consoles.regispailler.fr

## 🔍 Problème identifié

Le Cloudflare Tunnel était configuré pour pointer directement vers le frontend (`localhost:5000`) au lieu de Traefik. Cela causait des erreurs 404 pour les requêtes `/api` car le frontend ne peut pas gérer ces requêtes.

## ✅ Solution appliquée

La configuration Cloudflare Tunnel a été mise à jour pour pointer vers **Traefik sur le port 80**, qui gère correctement le routage :
- Requêtes normales → Frontend (port 5000)
- Requêtes `/api` → Backend (port 5001)

## 🔄 Redémarrage nécessaire

Pour appliquer les changements, redémarrez le Cloudflare Tunnel :

### Option 1 : Redémarrer le service Cloudflare Tunnel
```powershell
# Trouver le processus cloudflared
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}

# Arrêter le processus (remplacer PID par l'ID trouvé)
Stop-Process -Id <PID> -Force

# Redémarrer cloudflared
cloudflared tunnel --config cloudflare-active-config.yml run
```

### Option 2 : Si cloudflared est dans un service Windows
```powershell
# Arrêter le service
Stop-Service cloudflared

# Redémarrer le service
Start-Service cloudflared
```

## ✅ Vérification

Après le redémarrage, testez :

1. **Frontend** : https://consoles.regispailler.fr
2. **API Health** : https://consoles.regispailler.fr/api/health
3. **API Consoles** : https://consoles.regispailler.fr/api/consoles

Tout devrait fonctionner correctement maintenant !

## 📝 Configuration finale

```yaml
# cloudflare-active-config.yml
- hostname: consoles.regispailler.fr
  service: http://localhost:80  # Traefik
  originRequest:
    httpHostHeader: consoles.regispailler.fr
    noTLSVerify: true
```

Traefik route ensuite automatiquement :
- `/api/*` → Backend (port 5001)
- `/*` → Frontend (port 5000)








