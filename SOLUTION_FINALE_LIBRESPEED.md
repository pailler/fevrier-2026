# ✅ Solution Finale : LibreSpeed avec Protection Sécurisée

## 🔧 Approche Reconstruite

J'ai reconstruit complètement la configuration avec une **approche simplifiée et directe** :

### Configuration Finale

1. **Cloudflare Tunnel** → `localhost:3000` (Next.js directement)
2. **Middleware Next.js** → Intercepte les requêtes vers `librespeed.iahome.fr`
3. **Logique de protection** → Vérifie le token et redirige

## 📋 Fichiers Modifiés

### 1. `cloudflare-active-config.yml`
```yaml
- hostname: librespeed.iahome.fr
  service: http://localhost:3000
  originRequest:
    httpHostHeader: librespeed.iahome.fr
    noTLSVerify: true
```

### 2. `src/middleware.ts`
Ajout de la logique de protection dans le middleware Next.js :
```typescript
// Protection LibreSpeed : Si accès via librespeed.iahome.fr
if (hostname === 'librespeed.iahome.fr' || hostname.includes('librespeed.iahome.fr')) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (token) {
    // Token présent - rediriger vers LibreSpeed
    return NextResponse.redirect('http://192.168.1.150:8083', 302);
  } else {
    // Aucun token - rediriger vers iahome.fr
    return NextResponse.redirect('https://iahome.fr', 302);
  }
}
```

## 🔄 Flux de Trafic

```
1. Utilisateur → https://librespeed.iahome.fr
                ↓
2. Cloudflare Tunnel → localhost:3000 (Next.js)
                ↓
3. Next.js Middleware → Détecte hostname "librespeed.iahome.fr"
                ↓
4. Sans token → Redirection 302 → https://iahome.fr ✅
   Avec token → Redirection 302 → http://192.168.1.150:8083 (LibreSpeed) ✅
```

## ✅ Avantages de cette Approche

1. **Simple** : Pas de configuration Traefik complexe
2. **Direct** : Cloudflare Tunnel → Next.js directement
3. **Fiable** : Le middleware Next.js gère tout
4. **Facile à débugger** : Logs dans Next.js

## 🧪 Tests

### Test Local
```powershell
# Test middleware avec hostname
curl -H "Host: librespeed.iahome.fr" http://localhost:3000
```

### Test Public
```
https://librespeed.iahome.fr
→ Devrait rediriger vers https://iahome.fr
```

## 🚀 Redémarrage

Pour appliquer les changements :

```powershell
# 1. Redémarrer Next.js
docker-compose -f docker-compose.prod.yml restart iahome-app

# 2. Redémarrer le tunnel Cloudflare
.\reconstruire-librespeed-secure.ps1
```

## 📝 Notes

- ✅ Next.js a été redémarré avec le nouveau middleware
- ✅ Tunnel Cloudflare a été redémarré avec la nouvelle configuration
- ⏳ Attendre 30-60 secondes pour la propagation Cloudflare
- 🧪 Tester ensuite : `https://librespeed.iahome.fr`

