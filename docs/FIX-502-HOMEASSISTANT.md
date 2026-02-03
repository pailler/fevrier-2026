# Corriger l'erreur 502 sur homeassistant.iahome.fr

## Symptôme

- **URL** : https://homeassistant.iahome.fr  
- **Erreur** : 502 (Bad Gateway) / Erreur Cloudflare  
- **Application** : « Domotiser votre habitat » (manuel et codes Home Assistant)

## Cause

Cloudflare envoie le trafic vers **http://localhost:8123** sur la machine d’origine.  
L’erreur 502 apparaît quand **aucun service n’écoute sur le port 8123** (service arrêté, machine redémarrée, processus tué).

## Solution rapide

Sur la **machine qui héberge le tunnel Cloudflare** (celle où `localhost:8123` doit répondre), exécuter :

```powershell
cd C:\Users\AAA\Documents\iahome
.\scripts\restart-home-assistant.ps1
```

Ou pour un démarrage en arrière-plan classique :

```powershell
.\scripts\start-home-assistant-background.ps1
```

Après quelques secondes, https://homeassistant.iahome.fr doit répondre à nouveau.

## Vérifications

1. **Test local** : ouvrir http://localhost:8123 dans un navigateur sur la machine d’origine.  
   - Si la page s’affiche, le problème vient du tunnel Cloudflare ou du DNS.  
   - Si la page ne s’affiche pas, le service 8123 n’est pas démarré → utiliser les scripts ci-dessus.

2. **Démarrage automatique** : pour que le service redémarre après un reboot Windows, installer la tâche planifiée :

   ```powershell
   .\scripts\install-home-assistant-autostart.ps1
   ```

## Configuration technique

- **Cloudflare** (`cloudflare-active-config.yml`) : `homeassistant.iahome.fr` → `http://localhost:8123`
- **Traefik** (`traefik/dynamic/homeassistant.yml`) : route vers `host.docker.internal:8123` (si requêtes passent par Traefik)
- **Contenu servi** : répertoire `essentiels/codes-ha` via `python -m http.server 8123`

## Fichiers utiles

| Fichier | Rôle |
|--------|------|
| `scripts/restart-home-assistant.ps1` | Redémarre le service et corrige le 502 |
| `scripts/start-home-assistant-background.ps1` | Démarre le serveur en arrière-plan |
| `scripts/start-home-assistant-auto-start.ps1` | Script appelé au démarrage Windows |
| `homeassistant.pid` | PID du processus en cours |
| `homeassistant-startup.log` | Log des démarrages automatiques |
