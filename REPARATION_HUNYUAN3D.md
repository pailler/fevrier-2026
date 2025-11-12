# 🔧 Réparation de Hunyuan3D - Résumé

## ✅ Corrections appliquées

### 1. Port par défaut de l'API
**Fichier** : `hunyuan2-spz/code/api_spz/main_api.py`
- **Avant** : `default=7960`
- **Après** : `default=8888`
- **Impact** : L'API utilise maintenant le port 8888 par défaut

### 2. Script de lancement mis à jour
**Fichier** : `hunyuan2-spz/run-projectorz_(faster)/run-stableprojectorz-turbo-multiview-RECOMMENDED.bat`
- **Ajout** : `--port 8888 --host 0.0.0.0`
- **Impact** : Le script passe explicitement le port 8888 à l'API

### 3. Port par défaut de Gradio
**Fichier** : `hunyuan2-spz/code/gradio_app.py`
- **Avant** : `default=8080`
- **Après** : `default=8888`
- **Impact** : Gradio utilise maintenant le port 8888 par défaut

### 4. Configuration Cloudflared
**Fichier** : `cloudflare-active-config.yml`
- **Vérifié** : Configuration correcte (port 8888)
- **Impact** : Le tunnel Cloudflared pointe vers le bon port

## 📋 Scripts créés

### `repair-hunyuan3d.ps1`
Script de réparation automatique qui :
- ✅ Arrête les processus existants
- ✅ Vérifie la structure des fichiers
- ✅ Vérifie et corrige la configuration du port
- ✅ Vérifie la configuration Cloudflared
- ✅ Relance le service

## 🚀 Utilisation

### Réparation automatique
```powershell
.\repair-hunyuan3d.ps1
```

### Démarrage manuel
```powershell
.\start-hunyuan3d.ps1
```

## ⏳ Délai de démarrage

Le service peut prendre **5-15 minutes** pour démarrer complètement car :
1. **Première exécution** : Téléchargement des modèles (plusieurs GB)
2. **Chargement GPU** : Chargement des modèles en mémoire VRAM
3. **Initialisation** : Démarrage du serveur API/Gradio

## 🌐 URLs d'accès

- **Local** : http://localhost:8888
- **Production** : https://hunyuan3d.iahome.fr

## 🔍 Vérification

### Vérifier que le service écoute :
```powershell
Get-NetTCPConnection -LocalPort 8888
```

### Tester localement :
```powershell
Invoke-WebRequest -Uri "http://localhost:8888"
```

### Vérifier les processus :
```powershell
Get-Process | Where-Object { $_.Path -like "*hunyuan*" }
```

## 📝 Notes

- Le service utilise maintenant **uniquement le port 8888**
- Tous les scripts et configurations sont alignés sur ce port
- La première exécution est plus longue (téléchargement des modèles)
- Vérifiez les logs dans la fenêtre de commande pour voir la progression

---

*Réparation effectuée le : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*


