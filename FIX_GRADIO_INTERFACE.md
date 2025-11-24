# 🔧 Correction : Interface Gradio au lieu de l'API

## ❌ Problème identifié

**Symptôme** : À l'URL `localhost:8888`, c'est l'API qui apparaît au lieu de l'interface web Gradio.

**Cause** : Le script de démarrage utilisait `run-stableprojectorz-turbo-multiview-RECOMMENDED.bat` qui lance l'API (`spz-internal.bat` → `main_api.py`) au lieu de l'interface Gradio.

## ✅ Correction appliquée

### Script de démarrage mis à jour
**Fichier** : `start-hunyuan3d.ps1`

**Changements** :
- ✅ Priorité donnée aux scripts Gradio (interface web)
- ✅ Script utilisé : `run-gradio-turbo-multiview-RECOMMENDED.bat`
- ✅ Chemin : `hunyuan2-spz\run-browser_(slower)`
- ✅ Lance `gradio-internal.bat` → `gradio_app.py` (interface web)

### Différence entre les deux modes

| Mode | Script | Fichier lancé | Interface |
|------|--------|---------------|-----------|
| **API** (StableProjectorz) | `run-stableprojectorz-*.bat` | `spz-internal.bat` → `main_api.py` | API REST (JSON) |
| **Gradio** (Navigateur) | `run-gradio-*.bat` | `gradio-internal.bat` → `gradio_app.py` | Interface web (HTML) |

## 🚀 Utilisation

### Démarrage avec interface Gradio
```powershell
.\start-hunyuan3d.ps1
```

Le script utilise maintenant automatiquement l'interface Gradio (navigateur web).

### Si vous voulez utiliser l'API (StableProjectorz)
Pour utiliser l'API au lieu de Gradio, lancez manuellement :
```cmd
cd hunyuan2-spz\run-projectorz_(faster)
run-stableprojectorz-turbo-multiview-RECOMMENDED.bat
```

Puis dans StableProjectorz, connectez-vous à : `127.0.0.1:8888`

## 🌐 URLs d'accès

- **Local** : http://localhost:8888 (Interface Gradio)
- **Production** : https://hunyuan3d.iahome.fr (Interface Gradio)

## ⏳ Délai de démarrage

Le service peut prendre **5-15 minutes** pour démarrer complètement car :
1. **Première exécution** : Téléchargement des modèles (plusieurs GB)
2. **Chargement GPU** : Chargement des modèles en mémoire VRAM
3. **Initialisation** : Démarrage du serveur Gradio

## 🔍 Vérification

### Vérifier que l'interface Gradio est accessible :
```powershell
Invoke-WebRequest -Uri "http://localhost:8888"
```

Vous devriez voir une page HTML avec l'interface Gradio, pas une réponse JSON de l'API.

---

*Correction effectuée le : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*




