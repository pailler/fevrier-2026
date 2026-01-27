# ✅ ComfyUI configuré sur le port 8200

## 📋 Statut actuel

**ComfyUI démarre maintenant sur le port 8200** (au lieu de 8188 par défaut).

## ✅ Modifications effectuées

Les configurations suivantes ont été mises à jour pour utiliser le port 8200 :

1. **`src/app/api/secure-proxy/route.ts`**
   - Port ComfyUI : `8188` → `8200`

2. **`src/app/encours/page.tsx`**
   - URL ComfyUI : `http://localhost:8188` → `http://localhost:8200`

## 🔍 Vérification

### Vérifier que ComfyUI fonctionne

```powershell
# 1. Vérifier que le port 8200 est en écoute
netstat -ano | findstr :8200

# 2. Tester la connexion HTTP
Invoke-WebRequest -Uri "http://localhost:8200" -UseBasicParsing

# 3. Ouvrir dans le navigateur
Start-Process "http://localhost:8200"
```

### Script de vérification automatique

Exécutez le script de diagnostic :
```powershell
cd docker-services/essentiels/comfyui
powershell -ExecutionPolicy Bypass -File verifier-comfyui.ps1
```

## 🌐 Accès

- **Local** : http://localhost:8200
- **Production** : https://comfyui.iahome.fr (si Traefik configuré)

## ⚙️ Configuration dans Stability Matrix

Si vous voulez changer le port dans Stability Matrix :

1. Ouvrez **Stability Matrix**
2. Sélectionnez **ComfyUI**
3. Cliquez sur **"Configure"** ou **"Settings"**
4. Modifiez le **Port** : `8200` (ou un autre port libre)
5. Redémarrez ComfyUI

## 📝 Notes importantes

- Le port **8200** est maintenant utilisé par ComfyUI
- Si vous changez le port dans Stability Matrix, mettez à jour aussi :
  - `src/app/api/secure-proxy/route.ts`
  - `src/app/encours/page.tsx`
  - Configuration Traefik (si applicable)

## 🔧 Configuration Traefik (si nécessaire)

Si vous voulez accéder à ComfyUI via `https://comfyui.iahome.fr`, configurez Traefik :

```yaml
# traefik/dynamic/comfyui.yml
http:
  routers:
    comfyui:
      rule: "Host(`comfyui.iahome.fr`)"
      service: comfyui
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
  
  services:
    comfyui:
      loadBalancer:
        servers:
          - url: "http://localhost:8200"  # Port mis à jour
```

## ✅ Checklist

- [x] Port 8200 configuré dans `secure-proxy/route.ts`
- [x] URL mise à jour dans `encours/page.tsx`
- [x] ComfyUI démarre sur le port 8200
- [ ] Traefik configuré (si accès externe nécessaire)
- [ ] Tests de connexion réussis

## 🆘 Dépannage

### Port 8200 déjà utilisé

Si le port 8200 est déjà utilisé :

```powershell
# Trouver le processus
netstat -ano | findstr :8200

# Arrêter le processus (remplacez <PID>)
taskkill /PID <PID> /F
```

Ou changez le port dans Stability Matrix et mettez à jour les configurations.

### ComfyUI ne répond pas

1. Vérifiez les logs dans Stability Matrix
2. Vérifiez que ComfyUI écoute sur `0.0.0.0:8200` (pas seulement `127.0.0.1`)
3. Vérifiez le pare-feu Windows
