# Diagnostic : Page blanche lors de l'accès

## 🔍 Problème

L'accès à `meeting-reports.iahome.fr` avec un token valide affiche une page blanche.

## ✅ Solutions appliquées

### 1. Worker Cloudflare amélioré

Le Worker a été corrigé pour :
- ✅ Laisser passer TOUTES les ressources statiques (`/static/`, `/assets/`, `/_next/`)
- ✅ Laisser passer les requêtes OPTIONS (CORS preflight)
- ✅ Laisser passer les fonts (`.woff`, `.woff2`, `.ttf`, etc.)
- ✅ Laisser passer les fichiers `.map` (source maps)

### 2. Vérifications dans le Worker

Le Worker vérifie maintenant :
1. **API et POST** → Passent directement
2. **Ressources statiques** → Passent directement
3. **GET /** avec token → Passe avec le token
4. **GET /** sans token → Redirige vers iahome.fr

## 🧪 Tests à effectuer

### Test 1 : Vérifier les ressources statiques

Ouvrez la console du navigateur (F12) et vérifiez :
- Les fichiers `.js` se chargent (pas de 404)
- Les fichiers `.css` se chargent (pas de 404)
- Les fonts se chargent (pas de 404)

### Test 2 : Vérifier le token dans l'URL

L'URL doit contenir `?token=...` :
```
https://meeting-reports.iahome.fr/?token=eyJ...
```

### Test 3 : Désactiver temporairement le Worker

Dans Cloudflare Dashboard → Workers → Triggers → Routes :
- Trouvez `meeting-reports.iahome.fr/*`
- **Désactivez-la temporairement**
- Testez l'accès
- Si ça fonctionne → Le Worker bloque encore quelque chose
- Réactivez et modifiez le code

## 🔧 Actions correctives

1. **Copiez le nouveau code** du Worker dans Cloudflare Dashboard
2. **Sauvegardez et déployez**
3. **Attendez 2-5 minutes** pour la propagation
4. **Testez à nouveau**

## 📊 Logs à vérifier

### Logs Cloudflare Worker

Dans Cloudflare Dashboard → Workers → Logs :
- Regardez les requêtes vers `meeting-reports.iahome.fr`
- Vérifiez si certaines requêtes sont bloquées (erreurs 403, 302)

### Logs Nginx

```powershell
docker logs meeting-reports-nginx-1 --tail=50 | Select-String "GET|POST|error"
```

### Console navigateur

Ouvrez F12 → Console et Network :
- Vérifiez les erreurs JavaScript
- Vérifiez les requêtes bloquées (rouge dans Network)

## ✅ Si le problème persiste

1. **Vérifiez que le token est valide** : Il doit être encodé en Base64 et contenir `moduleId: "meeting-reports"`
2. **Vérifiez les CORS** : Le frontend doit accepter les requêtes depuis `meeting-reports.iahome.fr`
3. **Vérifiez le cache** : Videz le cache du navigateur (Ctrl+Shift+Delete)
4. **Testez en navigation privée** : Pour éviter les problèmes de cache/cookies













