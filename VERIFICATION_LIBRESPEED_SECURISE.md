# ✅ Vérification : LibreSpeed avec Protection Sécurisée

## 📋 Configuration Actuelle

### ✅ Éléments en Place

1. **Service Local**
   - LibreSpeed écoute sur `localhost:8085`
   - Container Docker : `librespeed-prod`
   - Image : `adolfintel/speedtest:latest`

2. **Configuration Cloudflare Tunnel**
   - Fichier : `cloudflare-active-config.yml`
   - Sous-domaine : `librespeed.iahome.fr`
   - Service : `http://localhost:8085`
   - ✅ Configuré et actif

3. **Protections (Page Rules)**
   - Fichier : `traefik/dynamic/subdomain-page-rules.yml`
   - Route de redirection avec priorité 200
   - Service : `librespeed-redirect-nextjs-service`
   - Redirection vers `iahome.fr` si pas de token

4. **Route API Next.js**
   - Fichier : `src/app/api/librespeed-redirect/route.ts`
   - Vérifie la présence d'un token
   - Redirige vers `iahome.fr` si pas de token
   - Redirige vers le service LibreSpeed si token présent

## 🔒 Fonctionnement de la Sécurité

### Comportement Normal

1. **Accès Direct (Sans Token)**
   ```
   https://librespeed.iahome.fr
   ↓
   Traefik intercepte (priorité 200)
   ↓
   Route vers /api/librespeed-redirect
   ↓
   Aucun token détecté
   ↓
   Redirection vers https://iahome.fr ✅
   ```

2. **Accès avec Token (Depuis iahome.fr)**
   ```
   https://librespeed.iahome.fr/?token=xxx
   ↓
   Traefik intercepte (priorité 200)
   ↓
   Route vers /api/librespeed-redirect
   ↓
   Token détecté
   ↓
   Redirection vers http://192.168.1.150:8083 (LibreSpeed) ✅
   ```

## 🧪 Tests à Effectuer

### Test 1 : Accès Direct (Doit Bloquer)

```powershell
# Ouvrir dans un navigateur en navigation privée
https://librespeed.iahome.fr
```

**Résultat attendu :** Redirection vers `https://iahome.fr`

### Test 2 : Accès avec Token (Depuis l'App)

Depuis l'application `iahome.fr`, accéder à LibreSpeed via le bouton dédié.

**Résultat attendu :** LibreSpeed s'ouvre et fonctionne normalement

### Test 3 : Test Automatique

```powershell
.\test-librespeed-secure-access.ps1
```

Ce script vérifie :
- ✅ Service local accessible
- ✅ Configuration Cloudflare Tunnel
- ✅ Protections Page Rules
- ✅ Route API Next.js
- ✅ Statut du tunnel Cloudflare
- ✅ Test d'accès direct

## 📝 Points à Vérifier

### 1. DNS Cloudflare

Vérifiez dans le Dashboard Cloudflare que :
- Un enregistrement CNAME existe : `librespeed` → `<tunnel-id>.cfargotunnel.com`
- Le DNS est actif (icône orange "Proxied" activé)

### 2. Tunnel Cloudflare

```powershell
# Vérifier le statut
cloudflared tunnel info iahome-new

# Démarrer si nécessaire
.\start-cloudflare-tunnel.ps1
```

### 3. Service LibreSpeed

```powershell
# Vérifier que le container tourne
docker ps | Select-String "librespeed"

# Démarrer si nécessaire
cd docker-services/essentiels
docker-compose -f librespeed/docker-compose.yml up -d
```

### 4. Port Local

```powershell
# Vérifier que le port 8085 écoute
netstat -ano | Select-String ":8085"
```

## ⚠️ Problèmes Courants

### Problème 1 : Redirection ne fonctionne pas

**Symptôme :** Accès direct à `librespeed.iahome.fr` ne redirige pas

**Solutions :**
1. Vérifier que Traefik est actif : `docker-compose -f docker-compose.prod.yml ps traefik`
2. Vérifier les logs Traefik : `docker-compose -f docker-compose.prod.yml logs traefik`
3. Redémarrer Traefik : `docker-compose -f docker-compose.prod.yml restart traefik`

### Problème 2 : Service local inaccessible

**Symptôme :** `http://localhost:8085` ne répond pas

**Solutions :**
1. Vérifier que le container Docker tourne
2. Vérifier les logs : `docker logs librespeed-prod`
3. Redémarrer le service : `cd docker-services/essentiels && docker-compose -f librespeed/docker-compose.yml restart`

### Problème 3 : Tunnel Cloudflare non actif

**Symptôme :** `https://librespeed.iahome.fr` ne répond pas du tout

**Solutions :**
1. Vérifier le statut : `cloudflared tunnel info iahome-new`
2. Redémarrer le tunnel : `.\start-cloudflare-tunnel.ps1`
3. Vérifier la configuration DNS dans Cloudflare Dashboard

## ✅ Configuration Validée

Une fois tous les tests réussis :

✅ Service local accessible  
✅ Configuration Cloudflare Tunnel correcte  
✅ Protections Page Rules actives  
✅ Route API Next.js fonctionnelle  
✅ Tunnel Cloudflare connecté  
✅ Accès direct bloqué (redirection)  
✅ Accès avec token fonctionnel  

## 📚 Documentation Associée

- [SECURITE_CLOUDFLARE_LOCALHOST.md](./SECURITE_CLOUDFLARE_LOCALHOST.md) - Guide complet de sécurité
- [traefik/dynamic/PAGE-RULES-README.md](./traefik/dynamic/PAGE-RULES-README.md) - Documentation Page Rules
- [src/app/api/librespeed-redirect/route.ts](./src/app/api/librespeed-redirect/route.ts) - Route de redirection


