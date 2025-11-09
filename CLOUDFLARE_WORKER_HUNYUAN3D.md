# 🔒 Cloudflare Worker pour protéger hunyuan3d.iahome.fr

## 📋 Vue d'ensemble

Ce Worker Cloudflare protège l'accès à `hunyuan3d.iahome.fr` en vérifiant la présence d'un token dans l'URL pour la requête principale (GET /). Toutes les autres requêtes (ressources statiques, API, POST, WebSockets, etc.) passent directement.

## 🎯 Fonctionnement

1. **Requête principale (GET /) sans token** → Redirection vers `iahome.fr/encours?error=direct_access_denied`
2. **Requête principale (GET /) avec token** → Accès autorisé
3. **Toutes les ressources statiques** → Passent directement (JS, CSS, images, formats 3D, etc.)
4. **Toutes les requêtes API** → Passent directement
5. **Toutes les requêtes POST/PUT/DELETE** → Passent directement
6. **WebSockets et SSE** → Passent directement

## 📝 Fichier source

Le code du Worker est dans : `cloudflare-worker-hunyuan3d.js`

## 🚀 Guide de déploiement dans Cloudflare

### Étape 1 : Accéder à Cloudflare Dashboard

1. Ouvrez https://dash.cloudflare.com/
2. Sélectionnez votre compte
3. Allez dans **Workers & Pages**
4. Cliquez sur **Create application**

### Étape 2 : Créer un nouveau Worker

1. Cliquez sur **Create Worker**
2. Nom du Worker : `protect-hunyuan3d` (ou `hunyuan3d-protect`)
3. Cliquez sur **Create**

### Étape 3 : Copier le code du Worker

1. Ouvrez le fichier `cloudflare-worker-hunyuan3d.js` dans votre éditeur
2. Copiez tout le contenu (Ctrl+A, Ctrl+C)
3. Dans l'éditeur Cloudflare, remplacez le code par défaut par le code copié
4. Cliquez sur **Save**

### Étape 4 : Configurer les routes

1. Cliquez sur **Settings** (en haut à droite)
2. Allez dans l'onglet **Triggers**
3. Dans la section **Routes**, cliquez sur **Add route**
4. Configurez la route :
   - **Route** : `hunyuan3d.iahome.fr/*`
   - **Zone** : `iahome.fr`
5. Cliquez sur **Add route**

### Étape 5 : Déployer le Worker

1. Cliquez sur **Save and deploy** (en haut à droite)
2. Attendez la confirmation de déploiement

## ✅ Vérification

Une fois déployé, testez l'accès :

1. **Sans token** : Accédez à `https://hunyuan3d.iahome.fr/`
   - ✅ Doit rediriger vers `https://iahome.fr/encours?error=direct_access_denied`

2. **Avec token** : Accédez à `https://hunyuan3d.iahome.fr/?token=xxx`
   - ✅ Doit charger l'application normalement

3. **Ressources statiques** : Accédez à `https://hunyuan3d.iahome.fr/static/file.js`
   - ✅ Doit charger directement sans redirection

## 🔧 Configuration avancée

### Modifier le message d'erreur

Pour changer l'URL de redirection, modifiez cette ligne dans le Worker :

```javascript
return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
```

### Ajouter d'autres formats 3D

Pour autoriser d'autres formats de fichiers 3D, ajoutez-les dans le tableau `resourceExtensions` :

```javascript
const resourceExtensions = [
  // ... formats existants ...
  '.3ds', '.blend', '.dae', '.fbx', // Ajoutez vos formats ici
];
```

### Ajouter d'autres chemins statiques

Pour autoriser d'autres dossiers statiques, ajoutez-les dans `isStaticPath` :

```javascript
const isStaticPath = url.pathname.startsWith('/static/') ||
                     url.pathname.startsWith('/assets/') ||
                     url.pathname.startsWith('/models/') ||
                     url.pathname.startsWith('/votre-dossier/'); // Ajoutez ici
```

## 📊 Logs

Le Worker enregistre des logs dans Cloudflare Dashboard :
- **Workers & Pages** > **protect-hunyuan3d** > **Logs**
- Les logs commencent par `🛡️ Hunyuan 3D Worker:`

## ⚠️ Notes importantes

- Le Worker vérifie uniquement la requête principale (GET /)
- Toutes les ressources statiques passent directement (pas de vérification de token)
- Les requêtes API et POST passent directement (pour permettre les uploads)
- Les WebSockets et SSE passent directement (pour les fonctionnalités temps réel)

## 🔗 Liens utiles

- [Documentation Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers)

