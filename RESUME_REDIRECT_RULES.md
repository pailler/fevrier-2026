# 📋 Résumé : Configuration Redirect Rules Cloudflare

## ✅ Fichiers Modifiés

1. **`src/app/api/librespeed-redirect/route.ts`**
   - Route appelée par Redirect Rules quand pas de token
   - Redirige vers `iahome.fr/encours` si pas de token
   - Redirige vers `librespeed.iahome.fr?token=xxx` si token présent

2. **`cloudflare-active-config.yml`**
   - Modifié pour pointer `librespeed.iahome.fr` vers `localhost:3000` (Next.js)
   - Permet à Next.js middleware de gérer la protection

3. **`src/middleware.ts`**
   - Modifié pour laisser passer les requêtes avec token vers LibreSpeed
   - Redirige vers `/api/librespeed-redirect` si pas de token

## 📝 Configuration Requise dans Cloudflare Dashboard

### Redirect Rule à Créer

**Rule name** : `Protect librespeed without token`

**Conditions** :
1. `Hostname` equals `librespeed.iahome.fr`
2. `Query String` does not contain `token`

**Action** :
- `Dynamic redirect` to `https://iahome.fr/api/librespeed-redirect`
- Status code: `302`

## 🔄 Flux de Requêtes

### Sans Token
```
librespeed.iahome.fr
  ↓
Cloudflare Redirect Rules (intercepte)
  ↓
Redirige vers iahome.fr/api/librespeed-redirect
  ↓
Route Next.js vérifie token
  ↓
Redirige vers iahome.fr/encours (pas de token)
```

### Avec Token
```
librespeed.iahome.fr?token=xxx
  ↓
Cloudflare Redirect Rules (ne s'applique pas - token présent)
  ↓
Passe vers Next.js (localhost:3000 via Cloudflare Tunnel)
  ↓
Middleware Next.js vérifie token
  ↓
Laisse passer (NextResponse.next())
  ↓
⚠️ PROBLÈME : La requête va vers Next.js, pas vers LibreSpeed
```

## ⚠️ Problème Identifié

Avec la configuration actuelle :
- Cloudflare Tunnel pointe `librespeed.iahome.fr` vers `localhost:3000` (Next.js)
- Quand un token est présent, le middleware laisse passer avec `NextResponse.next()`
- Mais la requête reste dans Next.js et ne va pas vers LibreSpeed

## 🔧 Solutions Possibles

### Solution 1 : Proxy dans Next.js (Recommandée)

Créer une route proxy dans Next.js qui forwarde vers LibreSpeed :

```typescript
// src/app/api/proxy-librespeed/route.ts
export async function GET(request: NextRequest) {
  const response = await fetch('http://localhost:8085' + request.url);
  return new NextResponse(response.body, { headers: response.headers });
}
```

**Avantages** :
- Fonctionne avec Redirect Rules
- Contrôle total sur la redirection

**Inconvénients** :
- Proxy continu (peut bloquer certaines fonctionnalités)

### Solution 2 : Configuration Dual Cloudflare Tunnel

Créer deux configurations Cloudflare Tunnel :
1. Sans token → Next.js
2. Avec token → LibreSpeed directement

**Avantages** :
- Pas de proxy
- Performance optimale

**Inconvénients** :
- Complexe à mettre en place
- Nécessite plusieurs tunnels

### Solution 3 : Modifier Redirect Rules

Au lieu de rediriger vers `/api/librespeed-redirect`, rediriger directement vers `iahome.fr/encours`.

**Avantages** :
- Plus simple

**Inconvénients** :
- Moins flexible
- Ne permet pas la génération de token

## ✅ Solution Finale Recommandée

**Option A : Configuration actuelle avec proxy Next.js** (si les fonctionnalités ne sont pas bloquées)

**Option B : Modifier Redirect Rules pour rediriger directement vers iahome.fr** (plus simple)

## 📚 Prochaines Étapes

1. Configurer Redirect Rules dans Cloudflare Dashboard
2. Tester l'accès sans token (doit rediriger vers iahome.fr)
3. Tester l'accès avec token (doit fonctionner)
4. Si problème avec les fonctionnalités, implémenter Solution 1 (proxy)

## 🧪 Tests à Effectuer

```powershell
# Test sans token
curl -I https://librespeed.iahome.fr

# Test avec token
curl -I "https://librespeed.iahome.fr?token=test123"

# Test route API
curl -I https://iahome.fr/api/librespeed-redirect
```


