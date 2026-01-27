# 🔧 Solution : Démarrer ComfyUI via Stability Matrix

## ❌ Problème identifié

**Impossible de démarrer ComfyUI sur Stability Matrix** car :
1. Les images Docker ComfyUI ne sont plus disponibles ou ont changé
2. ComfyUI doit être installé et géré via **Stability Matrix** directement, pas via Docker

## ✅ Solution : Installation via Stability Matrix

### Étape 1 : Vérifier que Stability Matrix est installé

```powershell
# Vérifier si Stability Matrix est installé
$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
Test-Path $stabilityMatrixPath
```

Si le chemin n'existe pas, téléchargez Stability Matrix depuis :
- https://github.com/LykosAI/StabilityMatrix/releases

### Étape 2 : Démarrer Stability Matrix

1. Ouvrez Stability Matrix
2. Attendez que l'interface se charge complètement

### Étape 3 : Installer ComfyUI dans Stability Matrix

1. Dans Stability Matrix, cliquez sur **"Add Package"** ou le bouton **"+"**
2. Dans la barre de recherche, tapez **"ComfyUI"**
3. Sélectionnez **ComfyUI** dans les résultats
4. Cliquez sur **"Install"**
5. Choisissez les options d'installation :
   - **Version** : Latest (recommandé)
   - **Location** : Laissez par défaut ou choisissez un emplacement
6. Cliquez sur **"Install"** et attendez la fin du téléchargement

### Étape 4 : Configurer ComfyUI

1. Dans Stability Matrix, sélectionnez **ComfyUI** dans la liste des packages
2. Cliquez sur **"Configure"** ou **"Settings"** (icône engrenage)
3. Vérifiez/modifiez les paramètres :
   ```
   Port: 8188
   Listen: 0.0.0.0
   Auto-start: Activé (optionnel)
   ```

### Étape 5 : Démarrer ComfyUI

1. Dans Stability Matrix, sélectionnez **ComfyUI**
2. Cliquez sur le bouton **"Start"** ou **"Launch"**
3. Attendez que ComfyUI démarre (peut prendre 1-2 minutes au premier lancement)

### Étape 6 : Vérifier que ComfyUI fonctionne

1. Ouvrez votre navigateur
2. Accédez à : `http://localhost:8188`
3. Vous devriez voir l'interface ComfyUI

## 🔍 Dépannage

### Problème : ComfyUI ne démarre pas dans Stability Matrix

**Solution 1 : Vérifier les logs**
1. Dans Stability Matrix, sélectionnez ComfyUI
2. Cliquez sur **"Logs"** ou **"View Logs"**
3. Recherchez les erreurs (rouge)
4. Les erreurs courantes :
   - Port déjà utilisé → Changez le port dans la configuration
   - Fichiers manquants → Réinstallez ComfyUI
   - Permissions → Exécutez Stability Matrix en administrateur

**Solution 2 : Réinstaller ComfyUI**
1. Dans Stability Matrix, sélectionnez ComfyUI
2. Cliquez sur **"Uninstall"**
3. Attendez la désinstallation complète
4. Réinstallez ComfyUI (Étape 3)

**Solution 3 : Vérifier que le port 8188 est libre**
```powershell
# Vérifier si le port 8188 est utilisé
netstat -ano | findstr :8188

# Si une ligne apparaît, notez le PID (dernier nombre)
# Arrêtez le processus :
taskkill /PID <PID> /F
```

### Problème : "Port already in use"

**Solution :**
1. Dans Stability Matrix, ouvrez la configuration de ComfyUI
2. Changez le port de `8188` à `8189` (ou un autre port libre)
3. Redémarrez ComfyUI

### Problème : "Cannot find Python" ou erreurs Python

**Solution :**
1. Stability Matrix gère Python automatiquement
2. Si l'erreur persiste, réinstallez ComfyUI
3. Vérifiez que Stability Matrix est à jour

### Problème : ComfyUI démarre mais l'interface ne charge pas

**Solution :**
1. Attendez 2-3 minutes (premier démarrage peut être long)
2. Vérifiez les logs dans Stability Matrix
3. Vérifiez que vous accédez à `http://localhost:8188` (pas `https://`)
4. Essayez `http://127.0.0.1:8188`

## 📝 Configuration pour accès externe (Traefik)

Si vous voulez accéder à ComfyUI via `https://comfyui.iahome.fr` :

1. **Assurez-vous que ComfyUI écoute sur 0.0.0.0** (pas seulement 127.0.0.1)
   - Dans Stability Matrix → ComfyUI → Configure
   - Paramètre `Listen` : `0.0.0.0`

2. **Configurez Traefik** pour router vers `http://localhost:8188`
   - Créez/modifiez `traefik/dynamic/comfyui.yml`

## 🚫 Pourquoi Docker ne fonctionne pas ?

Les images Docker ComfyUI (`yanwk/comfyui`, `saladtechnologies/comfyui`) ne sont plus disponibles ou ont changé. 

**Recommandation :** Utilisez **Stability Matrix** pour gérer ComfyUI, c'est la méthode la plus simple et la plus maintenue.

## 📞 Support supplémentaire

Si le problème persiste :

1. **Vérifiez la version de Stability Matrix**
   - Menu → About → Version
   - Mettez à jour si nécessaire

2. **Consultez la documentation Stability Matrix**
   - https://github.com/LykosAI/StabilityMatrix/wiki

3. **Vérifiez les logs détaillés**
   - Stability Matrix → ComfyUI → Logs
   - Copiez les erreurs pour diagnostic

## ✅ Checklist de vérification

- [ ] Stability Matrix est installé et fonctionne
- [ ] ComfyUI est installé dans Stability Matrix
- [ ] Le port 8188 est libre (ou un autre port configuré)
- [ ] ComfyUI est configuré pour écouter sur `0.0.0.0`
- [ ] ComfyUI démarre sans erreur dans les logs
- [ ] L'interface est accessible sur `http://localhost:8188`
