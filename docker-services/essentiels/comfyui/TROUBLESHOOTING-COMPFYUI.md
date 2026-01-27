# 🔧 Résolution : ComfyUI s'arrête après "Adding extra search path"

## 🔍 Problème identifié

ComfyUI affiche les messages normaux :
```
Adding extra search path ipadapter ...
Adding extra search path prompt_expansion ...
[...]
Checkpoint files will always be loaded safely.
```

Mais **s'arrête immédiatement après** sans démarrer le serveur web.

## ✅ Solution étape par étape

### Étape 1 : Voir les logs complets dans Stability Matrix

1. **Ouvrez Stability Matrix**
2. **Sélectionnez ComfyUI** dans la liste des packages
3. **Cliquez sur "Logs"** ou l'icône de logs (📋)
4. **Faites défiler jusqu'à la fin** des logs
5. **Copiez les 20-30 dernières lignes** (après "Checkpoint files will always be loaded safely")

### Étape 2 : Identifier l'erreur

Recherchez ces types d'erreurs courantes :

#### Erreur 1 : Port déjà utilisé
```
Error: [Errno 10048] Only one usage of each socket address
Port 8188 is already in use
```

**Solution :**
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :8188

# Arrêter le processus (remplacez <PID> par le numéro)
taskkill /PID <PID> /F
```

Ou changez le port dans Stability Matrix → ComfyUI → Configure → Port : `8189`

#### Erreur 2 : Module Python manquant
```
ModuleNotFoundError: No module named 'xxx'
ImportError: cannot import name 'xxx'
```

**Solution :**
1. Dans Stability Matrix → ComfyUI → Settings
2. Cliquez sur "Update" ou "Reinstall"
3. Ou réinstallez ComfyUI complètement

#### Erreur 3 : Erreur de permissions
```
PermissionError: [WinError 5] Access is denied
```

**Solution :**
1. Fermez Stability Matrix
2. Clic droit → **Exécuter en tant qu'administrateur**
3. Redémarrez ComfyUI

#### Erreur 4 : Erreur CUDA/GPU
```
CUDA error: out of memory
RuntimeError: CUDA out of memory
```

**Solution :**
1. Dans Stability Matrix → ComfyUI → Configure
2. Ajoutez `--cpu` dans les arguments de ligne de commande
3. Ou réduisez la taille des modèles

#### Erreur 5 : Fichier manquant
```
FileNotFoundError: [Errno 2] No such file or directory
```

**Solution :**
1. Vérifiez que tous les fichiers sont présents
2. Réinstallez ComfyUI dans Stability Matrix

### Étape 3 : Solutions générales

#### Solution A : Réinstaller ComfyUI

1. Dans Stability Matrix → ComfyUI
2. Cliquez sur **"Uninstall"**
3. Attendez la désinstallation complète
4. Cliquez sur **"Install"** à nouveau
5. Attendez la fin de l'installation
6. Redémarrez ComfyUI

#### Solution B : Mettre à jour Stability Matrix

1. Téléchargez la dernière version : https://github.com/LykosAI/StabilityMatrix/releases
2. Installez la mise à jour
3. Redémarrez Stability Matrix
4. Essayez de démarrer ComfyUI à nouveau

#### Solution C : Vérifier les dépendances

1. Dans Stability Matrix → ComfyUI → Settings
2. Vérifiez que toutes les dépendances sont installées
3. Cliquez sur "Update Dependencies" si disponible

#### Solution D : Démarrer avec des arguments minimaux

1. Dans Stability Matrix → ComfyUI → Configure
2. Arguments de ligne de commande : `--listen 0.0.0.0 --port 8188 --cpu`
3. (Le `--cpu` force l'utilisation du CPU si GPU pose problème)

### Étape 4 : Vérifier après correction

Après avoir appliqué une solution, vérifiez :

```powershell
# 1. Vérifier que le port est en écoute
netstat -ano | findstr :8188

# 2. Tester la connexion
Invoke-WebRequest -Uri "http://localhost:8188" -UseBasicParsing

# 3. Ouvrir dans le navigateur
Start-Process "http://localhost:8188"
```

## 📋 Checklist de diagnostic

Avant de demander de l'aide, vérifiez :

- [ ] J'ai copié les **logs complets** depuis Stability Matrix
- [ ] J'ai identifié l'**erreur exacte** (dernières lignes)
- [ ] J'ai vérifié que le **port 8188 est libre**
- [ ] J'ai essayé de **réinstaller ComfyUI**
- [ ] J'ai vérifié que **Stability Matrix est à jour**
- [ ] J'ai essayé de **démarrer en mode CPU** (`--cpu`)

## 🆘 Si rien ne fonctionne

1. **Copiez les logs complets** (toutes les lignes après "Checkpoint files")
2. **Notez la version** de Stability Matrix (Menu → About)
3. **Notez la version** de ComfyUI (dans Stability Matrix)
4. **Créez une issue** sur : https://github.com/LykosAI/StabilityMatrix/issues
   - Incluez les logs complets
   - Décrivez les étapes que vous avez suivies

## 💡 Astuce : Logs détaillés

Pour activer les logs détaillés dans ComfyUI :

1. Stability Matrix → ComfyUI → Configure
2. Arguments : `--listen 0.0.0.0 --port 8188 --verbose`
3. Redémarrez ComfyUI
4. Les logs seront plus détaillés

## ✅ Messages de succès attendus

Un démarrage réussi devrait montrer :

```
Adding extra search path ipadapter ...
[... autres chemins ...]
Checkpoint files will always be loaded safely.
Starting server
To see the GUI go to: http://127.0.0.1:8188
Total VRAM 16384 MB, total RAM 32768 MB
Setting device to: cuda (ou cpu)
```

Si vous voyez "Starting server" et "To see the GUI go to", ComfyUI fonctionne ! 🎉
