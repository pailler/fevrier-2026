# 🚀 Installation de ComfyUI via Stability Matrix

## Problème identifié

L'image Docker `yanwk/comfyui:latest` n'existe plus ou n'est pas accessible. Si vous préférez utiliser **Stability Matrix** pour gérer ComfyUI, voici comment procéder.

## 📋 Prérequis

1. **Stability Matrix** installé et en cours d'exécution
   - Chemin par défaut : `%USERPROFILE%\Documents\StabilityMatrix-win-x64\StabilityMatrix.exe`
2. **Docker Desktop** installé et démarré (si vous utilisez Docker)

## 🔧 Installation via Stability Matrix

### Étape 1 : Démarrer Stability Matrix

1. Ouvrez Stability Matrix
2. Vérifiez que l'application est bien lancée

### Étape 2 : Installer ComfyUI

1. Dans Stability Matrix, cliquez sur **"Add Package"** ou **"+"**
2. Recherchez **"ComfyUI"**
3. Sélectionnez ComfyUI dans la liste
4. Cliquez sur **"Install"**
5. Attendez la fin de l'installation

### Étape 3 : Configurer ComfyUI

1. Dans Stability Matrix, sélectionnez ComfyUI
2. Cliquez sur **"Configure"** ou **"Settings"**
3. Vérifiez les paramètres :
   - **Port** : 8188 (par défaut)
   - **Listen** : 0.0.0.0 (pour accepter les connexions externes)
   - **Auto-start** : Activé (optionnel)

### Étape 4 : Démarrer ComfyUI

1. Dans Stability Matrix, sélectionnez ComfyUI
2. Cliquez sur **"Start"** ou **"Launch"**
3. Attendez que ComfyUI démarre (peut prendre quelques minutes au premier lancement)

### Étape 5 : Vérifier l'accès

1. Ouvrez votre navigateur
2. Accédez à : `http://localhost:8188`
3. Vous devriez voir l'interface ComfyUI

## 🔍 Dépannage

### ComfyUI ne démarre pas

1. **Vérifier que Stability Matrix est en cours d'exécution**
   ```powershell
   Get-Process -Name "StabilityMatrix" -ErrorAction SilentlyContinue
   ```

2. **Vérifier les logs dans Stability Matrix**
   - Ouvrez Stability Matrix
   - Sélectionnez ComfyUI
   - Cliquez sur "Logs" ou "View Logs"
   - Recherchez les erreurs

3. **Vérifier que le port 8188 n'est pas utilisé**
   ```powershell
   netstat -ano | findstr :8188
   ```

4. **Réinstaller ComfyUI**
   - Dans Stability Matrix, sélectionnez ComfyUI
   - Cliquez sur "Uninstall"
   - Réinstallez ComfyUI

### Port déjà utilisé

Si le port 8188 est déjà utilisé :

1. Arrêtez le service qui utilise le port
2. Ou changez le port dans la configuration ComfyUI (via Stability Matrix)

### Problèmes de permissions

Si vous avez des erreurs de permissions :

1. Exécutez Stability Matrix en tant qu'administrateur
2. Vérifiez les permissions du dossier d'installation

## 🌐 Accès depuis l'extérieur

Pour accéder à ComfyUI depuis d'autres machines ou via Traefik :

1. Assurez-vous que ComfyUI écoute sur `0.0.0.0:8188` (pas seulement `127.0.0.1`)
2. Configurez Traefik pour router vers `http://localhost:8188` ou l'IP de votre machine

## 📝 Notes importantes

- **Stability Matrix** gère automatiquement les mises à jour de ComfyUI
- Les modèles et custom nodes sont stockés dans le dossier d'installation de Stability Matrix
- Si vous utilisez Docker ET Stability Matrix, assurez-vous qu'ils n'utilisent pas le même port

## 🔄 Alternative : Utiliser Docker

Si vous préférez utiliser Docker au lieu de Stability Matrix :

1. L'image Docker a été mise à jour vers `saladtechnologies/comfyui:latest`
2. Démarrez ComfyUI avec :
   ```powershell
   cd docker-services/essentiels/comfyui
   docker-compose up -d
   ```

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs de Stability Matrix
2. Vérifiez les logs de ComfyUI dans Stability Matrix
3. Consultez la documentation de Stability Matrix : https://github.com/LykosAI/StabilityMatrix
