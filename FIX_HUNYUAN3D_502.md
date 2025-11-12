# 🔧 Correction de l'erreur 502 Bad Gateway - Hunyuan3D

## ❌ Problème identifié

**Erreur** : 502 Bad Gateway - Unable to reach the origin service

**Cause** : Incohérence de port entre :
- Configuration Cloudflared : port **7960**
- Script de démarrage : port **8888**

## ✅ Corrections appliquées

### 1. Configuration Cloudflared mise à jour
**Fichier** : `cloudflare-active-config.yml`

**Avant** :
```yaml
- hostname: hunyuan3d.iahome.fr
  service: http://localhost:7960
```

**Après** :
```yaml
- hostname: hunyuan3d.iahome.fr
  service: http://localhost:8888
```

### 2. Service relancé
- Script utilisé : `run-stableprojectorz-turbo-multiview-RECOMMENDED.bat`
- Port : **8888**
- Chemin : `hunyuan2-spz\run-projectorz_(faster)`

### 3. Cloudflared redémarré
- Redémarrage avec la nouvelle configuration
- Tunnel actif pour `hunyuan3d.iahome.fr`

## ⏳ Délai de démarrage

Le service peut prendre **5-15 minutes** pour démarrer complètement car :
1. **Première exécution** : Téléchargement des modèles (plusieurs GB)
2. **Chargement GPU** : Chargement des modèles en mémoire VRAM
3. **Initialisation** : Démarrage du serveur Gradio

## 🔍 Vérification

### Vérifier que le service écoute :
```powershell
Get-NetTCPConnection -LocalPort 8888
```

### Tester localement :
```powershell
Invoke-WebRequest -Uri "http://localhost:8888"
```

### Vérifier Cloudflared :
```powershell
Get-Process -Name "cloudflared"
```

## 🌐 URLs d'accès

- **Local** : http://localhost:8888
- **Production** : https://hunyuan3d.iahome.fr

## 📝 Notes

- Le service démarre automatiquement avec `.\start-hunyuan3d.ps1`
- La première exécution est plus longue (téléchargement des modèles)
- Vérifiez les logs dans la fenêtre de commande pour voir la progression
- Si le problème persiste après 15 minutes, vérifiez les logs d'erreur

---

*Correction effectuée le : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*


