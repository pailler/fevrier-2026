# 🔒 Guide : Protection avec Cloudflare Workers (Ne bloque PAS les fonctionnalités)

## 📋 Vue d'ensemble

Cette solution utilise **Cloudflare Workers** (GRATUIT) pour protéger vos sous-domaines en redirigeant **uniquement** la requête HTML principale, **sans bloquer** les ressources (JS, CSS, WebSockets, etc.).

## ✅ Avantages

- ✅ **Ne bloque PAS les fonctionnalités** - Seule la requête principale est vérifiée
- ✅ **Laisse passer les ressources** - JS, CSS, images, WebSockets, SSE passent normalement
- ✅ **100% GRATUIT** - Jusqu'à 100 000 requêtes/jour
- ✅ **Performance optimale** - Exécuté à la périphérie Cloudflare
- ✅ **Pas de modification serveur** - Tout se passe dans Cloudflare

## 🎯 Comment ça Fonctionne

```
Requête vers librespeed.iahome.fr
  ↓
Cloudflare Worker intercepte
  ↓
Vérifie le type de requête:
  ├─ Ressource (JS/CSS/image) → Laisse passer ✅
  ├─ WebSocket → Laisse passer ✅
  ├─ SSE (Server-Sent Events) → Laisse passer ✅
  ├─ API (/api/, /socket.io/) → Laisse passer ✅
  ├─ Health check → Laisse passer ✅
  └─ Requête principale (/) sans token → Redirige vers iahome.fr ⚠️
  └─ Requête principale (/) avec token → Laisse passer ✅
```

## 📝 Configuration Étape par Étape

### Étape 1 : Créer le Worker dans Cloudflare Dashboard

1. **Connectez-vous à Cloudflare Dashboard** :
   - https://dash.cloudflare.com/

2. **Sélectionnez votre domaine** : `iahome.fr`

3. **Allez dans Workers & Pages** :
   - Menu de gauche → **Workers & Pages**
   - Cliquez sur **Create** → **Worker**

4. **Nommez le Worker** :
   ```
   protect-librespeed
   ```

5. **Collez le code** :
   - Ouvrez le fichier `cloudflare-worker-librespeed.js`
   - Copiez tout le code
   - Collez-le dans l'éditeur Cloudflare (le code dans l'éditeur par défaut)
   - Cliquez sur **Deploy**

### Étape 2 : Configurer les Routes

1. **Dans la page du Worker**, allez dans l'onglet **Triggers**

2. **Dans "Routes"**, cliquez sur **Add route** :
   - **Route** : `librespeed.iahome.fr/*`
   - **Zone** : `iahome.fr` (sélectionnez dans le menu déroulant)
   - Cliquez sur **Add route**

**Note** : Le Worker s'appliquera à toutes les requêtes vers `librespeed.iahome.fr`

### Étape 3 : Configuration Cloudflare Tunnel

**⚠️ IMPORTANT** : Le tunnel doit pointer **DIRECTEMENT** vers LibreSpeed, **PAS** vers Next.js :

Modifiez `cloudflare-active-config.yml` :

```yaml
- hostname: librespeed.iahome.fr
  service: http://localhost:8085  # Directement vers LibreSpeed (pas Next.js)
  originRequest:
    httpHostHeader: librespeed.iahome.fr
    noTLSVerify: true
```

**Redémarrer le tunnel** :
```powershell
.\restart-cloudflare-tunnel.ps1
```

Ou manuellement :
```powershell
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
$configPath = Resolve-Path "cloudflare-active-config.yml"
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
```

## 🧪 Tests

### Test 1 : Accès Direct Sans Token
```
https://librespeed.iahome.fr
```
**Résultat attendu** : Redirection vers `https://iahome.fr/encours?error=direct_access_denied`

### Test 2 : Accès Avec Token
```
https://librespeed.iahome.fr?token=VOTRE_TOKEN
```
**Résultat attendu** : L'application LibreSpeed se charge normalement ✅

### Test 3 : Ressources Statiques
```
https://librespeed.iahome.fr/style.css
https://librespeed.iahome.fr/app.js
https://librespeed.iahome.fr/image.png
```
**Résultat attendu** : Les ressources se chargent normalement ✅

### Test 4 : WebSockets (si utilisés)
**Résultat attendu** : Les WebSockets fonctionnent normalement ✅

### Test 5 : API Calls
```
https://librespeed.iahome.fr/api/something
```
**Résultat attendu** : Les appels API passent normalement ✅

## 🔄 Répliquer pour d'Autres Sous-Domaines

### Option A : Worker unique pour plusieurs sous-domaines

Modifiez le Worker pour gérer plusieurs sous-domaines :

```javascript
// Liste des sous-domaines protégés
const protectedSubdomains = [
  'librespeed.iahome.fr',
  'metube.iahome.fr',
  'pdf.iahome.fr',
  'psitransfer.iahome.fr',
  // ... ajoutez d'autres sous-domaines
];

// Vérifier si le hostname est protégé
const isProtected = protectedSubdomains.includes(url.hostname);

if (!isProtected) {
  // Sous-domaine non protégé → Laisser passer
  return fetch(request);
}

// ... reste du code de vérification
```

Puis ajoutez des routes pour chaque sous-domaine dans les Triggers.

### Option B : Workers séparés

Créez un Worker séparé pour chaque sous-domaine (plus facile à maintenir).

## ⚠️ Limitations et Quotas

- **Quota gratuit** : 100 000 requêtes/jour
- **Pays gratuit** : Plan Workers Free
- **Après 100k/jour** : $5/mois pour 10M requêtes

Pour vérifier l'utilisation :
- Workers & Pages → Analytics → Voir les statistiques

## 🔧 Dépannage

### Problème : Le Worker ne s'applique pas

1. **Vérifier la route** :
   - Workers & Pages → Votre Worker → Triggers
   - Vérifier que la route `librespeed.iahome.fr/*` est bien configurée

2. **Vérifier le déploiement** :
   - Assurez-vous que le Worker est bien déployé (bouton "Deploy" cliqué)

3. **Attendre la propagation** :
   - Les changements peuvent prendre 1-2 minutes à se propager

### Problème : Les ressources sont bloquées

Si certaines ressources sont bloquées :
1. Vérifier l'extension dans `resourceExtensions`
2. Ajouter l'extension manquante dans le tableau

### Problème : WebSockets ne fonctionnent pas

1. Vérifier que la détection WebSocket fonctionne :
   ```javascript
   const isWebSocket = request.headers.get('Upgrade') === 'websocket' ||
                       request.headers.get('Connection')?.includes('Upgrade');
   ```

2. Vérifier les headers dans les logs du Worker :
   - Workers & Pages → Votre Worker → Logs

## 📚 Ressources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Examples](https://developers.cloudflare.com/workers/examples/)

## ✅ Checklist de Configuration

- [ ] Worker créé dans Cloudflare Dashboard
- [ ] Code du Worker déployé
- [ ] Route configurée pour `librespeed.iahome.fr/*`
- [ ] Cloudflare Tunnel modifié pour pointer directement vers LibreSpeed (localhost:8085)
- [ ] Tunnel redémarré
- [ ] Tests effectués :
  - [ ] Accès sans token → Redirection
  - [ ] Accès avec token → Fonctionne
  - [ ] Ressources statiques → Passent
  - [ ] WebSockets → Fonctionnent
  - [ ] API → Fonctionnent

---

**Félicitations ! 🎉** Votre sous-domaine est protégé **sans bloquer les fonctionnalités** !


