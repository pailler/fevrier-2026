# 🔧 Changer le port ComfyUI dans Stability Matrix

## 📋 Pour revenir au port 8188

### Étape 1 : Ouvrir la configuration ComfyUI

1. **Ouvrez Stability Matrix**
2. **Sélectionnez ComfyUI** dans la liste des packages
3. **Cliquez sur "Configure"** ou l'icône engrenage ⚙️

### Étape 2 : Modifier le port

1. Dans la section **"Port"** ou **"Arguments"**
2. Changez le port de `8200` à `8188`
3. Ou dans les arguments de ligne de commande, modifiez :
   ```
   --port 8200
   ```
   en :
   ```
   --port 8188
   ```

### Étape 3 : Redémarrer ComfyUI

1. **Arrêtez ComfyUI** (bouton Stop)
2. **Redémarrez ComfyUI** (bouton Start)
3. Vérifiez que ComfyUI démarre sur le port 8188

### Étape 4 : Vérifier

```powershell
# Vérifier que le port 8188 est en écoute
netstat -ano | findstr :8188

# Tester la connexion
Invoke-WebRequest -Uri "http://localhost:8188" -UseBasicParsing
```

## ✅ Configuration déjà mise à jour

Les fichiers suivants ont été remis au port 8188 :
- ✅ `src/app/api/secure-proxy/route.ts` → Port 8188
- ✅ `src/app/encours/page.tsx` → URL `http://localhost:8188`

## 🔍 Si le port 8188 est déjà utilisé

Si vous obtenez une erreur "Port already in use" :

```powershell
# Trouver le processus qui utilise le port 8188
netstat -ano | findstr :8188

# Arrêter le processus (remplacez <PID> par le numéro trouvé)
taskkill /PID <PID> /F
```

Ou utilisez un autre port libre (ex: 8189, 8190).

## 📝 Notes

- Le port **8188** est le port par défaut de ComfyUI
- Assurez-vous que ComfyUI écoute sur `0.0.0.0:8188` (pas seulement `127.0.0.1`) pour l'accès externe
- Après avoir changé le port dans Stability Matrix, redémarrez ComfyUI
