# Diagnostic de l'erreur 413 (Content Too Large)

## 🔍 Analyse de l'erreur

L'erreur 413 peut provenir de plusieurs sources dans la chaîne de traitement :

```
Client (Navigateur)
    ↓
Cloudflare (si proxy activé) ← ⚠️ LIMITE 100 MB PAR DÉFAUT
    ↓
Traefik (Reverse Proxy) ← ⚠️ Configuré à 500 MB
    ↓
Nginx (si utilisé) ← ⚠️ Configuré à 500 MB
    ↓
Backend FastAPI/Hypercorn ← ⚠️ Configuré à 500 MB
```

## 📊 État actuel de la configuration

| Composant | Limite configurée | Statut |
|-----------|-------------------|--------|
| **Cloudflare** | 100 MB (limite par défaut) | ❌ **PROBLÈME PROBABLE** |
| **Traefik** | 500 MB (`memRequestBodyBytes: 524288000`) | ✅ |
| **Nginx** | 500 MB (`client_max_body_size 500M`) | ✅ |
| **Backend** | 500 MB (middleware) | ✅ |

## 🧪 Diagnostic étape par étape

### Étape 1 : Vérifier la taille du fichier

Si l'erreur 413 apparaît :
- **< 100 MB** : Le problème vient de Traefik, Nginx ou Backend
- **> 100 MB** : **C'est très probablement Cloudflare qui bloque**

### Étape 2 : Vérifier si Cloudflare est activé

1. Aller dans le dashboard Cloudflare
2. DNS > Records
3. Trouver `meeting-reports.iahome.fr`
4. Vérifier l'icône :
   - 🟠 **Orange (proxied)** = Cloudflare bloque à 100 MB
   - ⚪ **Gris (DNS only)** = Pas de limite Cloudflare

### Étape 3 : Vérifier les logs

```powershell
# Logs Traefik - voir si la requête arrive
docker logs iahome-traefik --tail=100 | Select-String "meeting-reports"

# Logs Backend - voir si la requête arrive
docker logs meeting-reports-backend-1 --tail=100 | Select-String "upload"

# Logs Nginx - voir si la requête arrive
docker logs meeting-reports-nginx-1 --tail=100
```

**Si aucun log n'apparaît** : La requête n'atteint même pas Traefik → **C'est Cloudflare qui bloque**

### Étape 4 : Test direct (bypass Cloudflare)

Tester directement l'URL du backend pour confirmer :

```powershell
# Tester directement le backend (sans passer par Cloudflare/Traefik)
curl -X POST http://localhost:8000/upload -F "file=@test-file.bin"
```

Si ça fonctionne directement mais pas via `https://meeting-reports.iahome.fr/api/upload`, c'est Cloudflare qui bloque.

## 🔧 Solutions selon la source du problème

### Si c'est Cloudflare (> 100 MB)

**Option 1 : Désactiver le proxy Cloudflare (DNS only)**
- Aller dans Cloudflare Dashboard > DNS > Records
- Cliquer sur l'icône orange pour passer en gris (DNS only)
- ⚠️ **Attention** : Cela désactive la protection DDoS de Cloudflare

**Option 2 : Utiliser Cloudflare Workers**
- Créer un Worker qui bypass la limite pour `/api/upload`
- Plus complexe mais garde la protection

**Option 3 : Upload direct**
- Créer un sous-domaine direct (ex: `upload.iahome.fr`)
- Qui ne passe pas par Cloudflare
- Pointant directement vers Traefik

### Si c'est Traefik (< 100 MB)

Vérifier la configuration :

```powershell
docker exec iahome-traefik cat /etc/traefik/dynamic/meeting-reports-api.yml | Select-String "memRequestBodyBytes"
```

Doit afficher : `memRequestBodyBytes: 524288000`

Si différent, redémarrer Traefik :
```powershell
docker restart iahome-traefik
```

### Si c'est Nginx

Vérifier la configuration :
```powershell
docker exec meeting-reports-nginx-1 cat /etc/nginx/nginx.conf | Select-String "client_max_body_size"
```

Doit afficher : `client_max_body_size 500M;`

### Si c'est le Backend

Vérifier le middleware dans `meeting-reports/backend/main.py` :
- `MAX_UPLOAD_SIZE = 500 * 1024 * 1024` (500 MB)

## 📝 Checklist de diagnostic

- [ ] Quelle est la taille du fichier qui échoue ?
- [ ] Cloudflare est-il en mode proxy (orange) ou DNS only (gris) ?
- [ ] Les logs Traefik montrent-ils la requête ?
- [ ] Les logs Backend montrent-ils la requête ?
- [ ] Le test direct vers `localhost:8000` fonctionne-t-il ?

## 🎯 Action immédiate recommandée

1. **Vérifier la taille du fichier** qui cause l'erreur
2. **Si > 100 MB** : C'est Cloudflare, passer en DNS only ou utiliser un autre endpoint
3. **Si < 100 MB** : Vérifier que Traefik a bien rechargé avec la nouvelle config










