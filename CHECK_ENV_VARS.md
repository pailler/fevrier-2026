# 🔍 Vérifier les variables d'environnement dans Next.js

## ⚠️ Problème identifié

Le test PowerShell fonctionne (le Service Token est correct), mais Next.js ne semble pas envoyer le Service Token dans les requêtes.

## ✅ Solution : Vérifier les logs du serveur

Quand tu cliques sur le bouton LibreSpeed, regarde les logs du serveur Next.js. Tu devrais maintenant voir :

```
🔍 Cloudflare Service Token - Variables d'environnement:
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID: 339b5489e670a801bb1b...
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET: 113a7dbd04c3c048e833...
✅ librespeed: Service Token Cloudflare Access ajouté
   Client ID: 339b5489e670a801bb1b...
   Headers envoyés: [ 'User-Agent', 'Accept', 'CF-Access-Client-Id', 'CF-Access-Client-Secret' ]
```

**Si tu vois "NON DÉFINI"** :
→ Les variables d'environnement ne sont pas chargées. **Redémarre le serveur**.

## 🔧 Redémarrer le serveur pour charger les variables

1. **Arrête le serveur** (Ctrl+C dans le terminal où tourne `npm run dev`)
2. **Attends 5 secondes**
3. **Redémarre** : `npm run dev`
4. **Attends que le serveur démarre complètement** (30-60 secondes)
5. **Teste à nouveau** le bouton LibreSpeed

## 📝 Note importante

Next.js charge les variables d'environnement **uniquement au démarrage**. Si tu modifies `env.production.local`, tu **DOIS** redémarrer le serveur pour que les changements soient pris en compte.

## 🆘 Si les variables sont toujours "NON DÉFINI" après redémarrage

1. **Vérifie le fichier** `env.production.local` :
   - Les lignes commencent-elles bien par `CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID=` ?
   - N'y a-t-il pas d'espaces avant/après les valeurs ?
   - Le fichier est-il bien à la racine du projet ?

2. **Vérifie le mode** :
   - Si tu es en mode développement (`npm run dev`), Next.js charge `env.local` ou `.env.local`
   - Si tu es en mode production (`npm run start`), Next.js charge `env.production.local`

3. **Essaie de créer** `.env.local` avec les mêmes variables :
   ```env
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID=339b5489e670a801bb1b3292e50fee3b.access
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET=113a7dbd04c3c048e833d15982e7a575ed92e33196e8b3647de8e1b740e49aaf
   ```



