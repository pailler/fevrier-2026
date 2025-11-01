# 🔒 Guide : Configuration Cloudflare Redirect Rules pour LibreSpeed

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer **Cloudflare Redirect Rules** (GRATUIT) pour protéger vos sous-domaines en redirigeant automatiquement les accès directs sans token vers `iahome.fr`.

## ✅ Avantages de cette Solution

- ✅ **100% GRATUIT** - Redirect Rules est gratuit (contrairement à Page Rules)
- ✅ **Pas de proxy continu** - Les fonctionnalités de l'application ne sont pas bloquées
- ✅ **Simple à configurer** - Configuration dans le Dashboard Cloudflare
- ✅ **Performant** - Exécuté à la périphérie Cloudflare

## 🎯 Fonctionnement

1. **Accès direct sans token** → Cloudflare Redirect Rules → Redirige vers `iahome.fr/api/librespeed-redirect`
2. **Route Next.js** → Vérifie le token → Redirige vers `librespeed.iahome.fr?token=xxx` ou `iahome.fr`
3. **Avec token valide** → L'application fonctionne normalement

---

## 📝 Étape 1 : Configuration Cloudflare Dashboard

### 1.1 Accéder à Redirect Rules

1. Connectez-vous à votre [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez votre domaine `iahome.fr`
3. Allez dans **Rules** → **Redirect Rules** (dans le menu de gauche)
4. Cliquez sur **Create rule**

### 1.2 Créer la Règle de Redirection

Remplissez le formulaire :

**Rule name** :
```
Protect librespeed without token
```

**When incoming requests match** :
- **Field** : `Hostname`
- **Operator** : `equals`
- **Value** : `librespeed.iahome.fr`

Cliquez sur **Add condition** pour ajouter une deuxième condition :

- **Field** : `Query String`
- **Operator** : `does not contain`
- **Value** : `token`

### 1.3 Configurer l'Action de Redirection

**Then the settings are** :
- **Action** : `Dynamic redirect`
- **Status code** : `302 - Temporary Redirect`
- **Redirect to** : `https://iahome.fr/api/librespeed-redirect`

### 1.4 Sauvegarder

Cliquez sur **Deploy** pour activer la règle.

---

## 📝 Étape 2 : Configuration Cloudflare Tunnel

### 2.1 Modifier la Configuration

Le fichier `cloudflare-active-config.yml` a été modifié pour pointer `librespeed.iahome.fr` vers Next.js :

```yaml
- hostname: librespeed.iahome.fr
  service: http://localhost:3000  # Passe par Next.js
  originRequest:
    httpHostHeader: librespeed.iahome.fr
    noTLSVerify: true
```

### 2.2 Redémarrer le Tunnel Cloudflare

```powershell
# Arrêter le tunnel
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force

# Redémarrer avec la nouvelle configuration
$configPath = Resolve-Path "cloudflare-active-config.yml"
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
```

---

## 📝 Étape 3 : Vérification de la Route Next.js

La route `/api/librespeed-redirect` a été mise à jour pour :

1. **Si token présent** → Rediriger vers `librespeed.iahome.fr?token=xxx`
2. **Si pas de token** → Rediriger vers `iahome.fr/encours`

La route est située dans : `src/app/api/librespeed-redirect/route.ts`

### ⚠️ Note Importante : Gestion des Requêtes avec Token

Quand un utilisateur accède à `librespeed.iahome.fr?token=xxx` :
- Redirect Rules ne s'applique PAS (token présent)
- La requête va vers Next.js (localhost:3000 via Cloudflare Tunnel)
- Le middleware Next.js laisse passer avec `NextResponse.next()`

**⚠️ PROBLÈME ACTUEL** : La requête reste dans Next.js et ne va pas vers LibreSpeed.

**🔧 SOLUTION** : Voir section "Alternative : Proxy Next.js pour Token" ci-dessous si les fonctionnalités sont bloquées.

---

## 🧪 Étape 4 : Tests

### Test 1 : Accès Direct Sans Token

Ouvrez dans un navigateur (navigation privée) :
```
https://librespeed.iahome.fr
```

**Résultat attendu** :
- ✅ Redirection automatique vers `https://iahome.fr/api/librespeed-redirect`
- ✅ Puis redirection vers `https://iahome.fr/encours?error=direct_access_denied`

### Test 2 : Accès Avec Token

Ouvrez dans un navigateur :
```
https://librespeed.iahome.fr?token=VOTRE_TOKEN
```

**Résultat attendu** :
- ✅ Redirection vers `https://librespeed.iahome.fr?token=VOTRE_TOKEN`
- ✅ L'application LibreSpeed se charge normalement

### Test 3 : Test avec curl

```powershell
# Test sans token (doit rediriger)
curl -I -L https://librespeed.iahome.fr

# Test avec token (doit fonctionner)
curl -I -L "https://librespeed.iahome.fr?token=VOTRE_TOKEN"
```

---

## 🔧 Dépannage

### Problème : Redirection ne fonctionne pas

1. **Vérifier que Redirect Rules est actif** :
   - Cloudflare Dashboard → Rules → Redirect Rules
   - Vérifier que la règle est "Active" (pas "Paused")

2. **Vérifier la propagation** :
   - Attendre 2-3 minutes après la création/modification de la règle
   - Les règles Cloudflare peuvent prendre quelques minutes à se propager

3. **Vérifier les logs Next.js** :
   - Vérifier les logs de la route `/api/librespeed-redirect`
   - Voir si les requêtes arrivent bien

### Problème : Boucle de redirection

Si vous avez une boucle de redirection :

1. **Vérifier la règle Redirect Rules** :
   - Assurez-vous que la condition "Query String does not contain token" est correcte
   - La règle ne doit PAS s'appliquer aux URLs avec `?token=`

2. **Vérifier la route Next.js** :
   - La route doit rediriger vers `librespeed.iahome.fr?token=xxx` (avec token)
   - Ou vers `iahome.fr` (sans token)

### Problème : Application ne fonctionne pas

Si l'application ne fonctionne pas avec un token :

1. **Vérifier que Cloudflare Tunnel pointe vers Next.js** :
   - Le fichier `cloudflare-active-config.yml` doit pointer vers `localhost:3000`
   - Redémarrer le tunnel si nécessaire

2. **Vérifier les headers** :
   - Les headers `Host` et `X-Forwarded-Host` doivent être correctement transmis
   - Vérifier les logs Next.js pour voir les headers reçus

---

## 📊 Structure Complète

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur externe accède à librespeed.iahome.fr         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Redirect Rules                                  │
│  - Si pas de token ? → Redirige vers /api/librespeed-redirect│
│  - Si token présent ? → Laisse passer                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Tunnel                                          │
│  librespeed.iahome.fr → localhost:3000 (Next.js)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Middleware / Route /api/librespeed-redirect        │
│  - Si token présent → Redirige vers librespeed?token=xxx   │
│  - Si pas de token → Redirige vers iahome.fr               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Application LibreSpeed (localhost:8085)                     │
│  Fonctionne normalement avec toutes ses fonctionnalités     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Alternative : Proxy Next.js pour Token (Si nécessaire)

Si vous rencontrez des problèmes où les requêtes avec token ne vont pas vers LibreSpeed, vous pouvez créer une route proxy dans Next.js :

### Créer une Route Proxy

Créez `src/app/api/proxy-librespeed/[...path]/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path?.join('/') || '';
  const targetUrl = `http://localhost:8085/${pathString}${request.nextUrl.search}`;
  
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
  });
  
  return new NextResponse(response.body, {
    headers: response.headers,
    status: response.status,
  });
}
```

### Modifier Cloudflare Tunnel

Dans `cloudflare-active-config.yml`, modifiez pour pointer vers cette route proxy :

```yaml
- hostname: librespeed.iahome.fr
  service: http://localhost:3000/api/proxy-librespeed
```

**⚠️ Note** : Ce proxy peut bloquer certaines fonctionnalités (WebSockets, SSE, etc.). À utiliser uniquement si nécessaire.

---

## 🎯 Prochaines Étapes

Une fois cette configuration fonctionnelle pour LibreSpeed, vous pouvez :

1. **Répliquer pour d'autres sous-domaines** :
   - Créer des Redirect Rules similaires pour chaque sous-domaine
   - Créer des routes Next.js correspondantes (`/api/qrcodes-redirect`, etc.)

2. **Automatiser avec des scripts** :
   - Créer un script PowerShell pour configurer plusieurs Redirect Rules
   - Créer des templates de routes Next.js

3. **Améliorer la sécurité** :
   - Ajouter une validation plus stricte des tokens
   - Ajouter des logs d'audit pour tracer les accès

---

## 📚 Ressources

- [Cloudflare Redirect Rules Documentation](https://developers.cloudflare.com/rules/redirect-rules/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## ✅ Checklist de Configuration

- [ ] Redirect Rule créée dans Cloudflare Dashboard
- [ ] Condition "Hostname equals librespeed.iahome.fr" configurée
- [ ] Condition "Query String does not contain token" configurée
- [ ] Action "Dynamic redirect to iahome.fr/api/librespeed-redirect" configurée
- [ ] Règle déployée (status: Active)
- [ ] `cloudflare-active-config.yml` modifié pour pointer vers Next.js
- [ ] Tunnel Cloudflare redémarré
- [ ] Route Next.js `/api/librespeed-redirect` vérifiée
- [ ] Tests effectués (sans token, avec token)

---

**Félicitations ! 🎉** Votre sous-domaine LibreSpeed est maintenant protégé avec Redirect Rules gratuit de Cloudflare !
