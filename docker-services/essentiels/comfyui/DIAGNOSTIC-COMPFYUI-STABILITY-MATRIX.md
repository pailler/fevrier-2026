# 🔍 Diagnostic : Messages ComfyUI dans Stability Matrix

## 📋 Messages observés

Ces messages sont **NORMAUX** et indiquent que ComfyUI configure ses chemins de recherche :

```
Adding extra search path ipadapter C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\IpAdaptersXl
Adding extra search path prompt_expansion C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\PromptExpansion
Adding extra search path ultralytics C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\Ultralytics
Adding extra search path ultralytics_bbox C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\Ultralytics\bbox
Adding extra search path ultralytics_segm C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\Ultralytics\segm
Adding extra search path sams C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\Sams
Adding extra search path diffusion_models C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\DiffusionModels
Checkpoint files will always be loaded safely.
```

## ✅ Ce que ces messages signifient

ComfyUI configure automatiquement des chemins pour :
- **IpAdaptersXl** : Modèles d'adaptation d'images
- **PromptExpansion** : Expansion de prompts
- **Ultralytics** : Modèles de détection/segmentation
- **Sams** : Segment Anything Models
- **DiffusionModels** : Modèles de diffusion

C'est **normal** et indique que ComfyUI trouve les modèles installés via Stability Matrix.

## 🔍 Vérification : ComfyUI démarre-t-il vraiment ?

### Étape 1 : Vérifier les logs complets

Dans Stability Matrix :
1. Sélectionnez **ComfyUI**
2. Cliquez sur **"Logs"** ou **"View Logs"**
3. Faites défiler jusqu'à la fin des logs
4. Recherchez ces messages de succès :

**Messages de succès attendus :**
```
Starting server
To see the GUI go to: http://127.0.0.1:8188
```

ou

```
Server started at http://0.0.0.0:8188
```

### Étape 2 : Vérifier l'accès web

1. Ouvrez votre navigateur
2. Accédez à : `http://localhost:8188`
3. Vous devriez voir l'interface ComfyUI

### Étape 3 : Vérifier que le processus est actif

```powershell
# Vérifier si ComfyUI est en cours d'exécution
Get-Process | Where-Object {$_.ProcessName -like "*python*" -or $_.ProcessName -like "*comfy*"}

# Vérifier si le port 8188 est en écoute
netstat -ano | findstr :8188
```

## ❌ Si ComfyUI ne démarre pas après ces messages

### Problème 1 : Pas de message "Server started"

**Symptômes :**
- Les messages de chemins apparaissent
- Mais pas de message "Server started"
- L'interface web ne répond pas

**Solutions :**

1. **Vérifier les erreurs Python dans les logs**
   - Recherchez les lignes avec "Error", "Exception", "Traceback"
   - Copiez l'erreur complète

2. **Vérifier les dépendances manquantes**
   - Dans Stability Matrix → ComfyUI → Settings
   - Vérifiez que toutes les dépendances sont installées

3. **Réinstaller ComfyUI**
   - Stability Matrix → ComfyUI → Uninstall
   - Puis réinstaller

### Problème 2 : Erreur de port déjà utilisé

**Symptômes :**
```
Error: Port 8188 is already in use
```

**Solution :**
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :8188

# Arrêter le processus (remplacez <PID> par le numéro trouvé)
taskkill /PID <PID> /F
```

Ou changez le port dans Stability Matrix → ComfyUI → Configure → Port : `8189`

### Problème 3 : Erreur de permissions

**Symptômes :**
```
Permission denied
Access is denied
```

**Solution :**
1. Fermez Stability Matrix
2. Clic droit sur Stability Matrix → **Exécuter en tant qu'administrateur**
3. Redémarrez ComfyUI

### Problème 4 : Erreur de modèles manquants

**Symptômes :**
```
Model not found
File not found
```

**Solution :**
1. Dans Stability Matrix, vérifiez que les modèles sont bien installés
2. Téléchargez les modèles nécessaires via Stability Matrix
3. Vérifiez les chemins dans ComfyUI → Configure

## 🔧 Commandes de diagnostic PowerShell

```powershell
# 1. Vérifier les processus Python/ComfyUI
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Select-Object ProcessName, Id, StartTime

# 2. Vérifier le port 8188
netstat -ano | findstr :8188

# 3. Tester la connexion HTTP
Invoke-WebRequest -Uri "http://localhost:8188" -UseBasicParsing

# 4. Vérifier les fichiers ComfyUI
Test-Path "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Packages\ComfyUI"

# 5. Vérifier les logs Stability Matrix
Get-Content "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Logs\*.log" -Tail 50
```

## 📝 Logs complets attendus (démarrage réussi)

Un démarrage réussi devrait montrer :

```
Adding extra search path ipadapter ...
Adding extra search path prompt_expansion ...
[... autres chemins ...]
Checkpoint files will always be loaded safely.
Starting server
To see the GUI go to: http://127.0.0.1:8188
Total VRAM 16384 MB, total RAM 32768 MB
Setting device to: cuda
```

## 🆘 Si le problème persiste

1. **Copiez les logs complets** depuis Stability Matrix
2. **Notez l'erreur exacte** (dernières lignes des logs)
3. **Vérifiez la version** de Stability Matrix et ComfyUI
4. **Consultez** : https://github.com/LykosAI/StabilityMatrix/issues

## ✅ Checklist de vérification

- [ ] Les messages de chemins apparaissent (normal)
- [ ] Le message "Server started" apparaît dans les logs
- [ ] Le port 8188 est en écoute (`netstat -ano | findstr :8188`)
- [ ] L'interface web est accessible (`http://localhost:8188`)
- [ ] Aucune erreur dans les logs après les messages de chemins
