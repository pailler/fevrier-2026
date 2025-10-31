# 🔍 Vérifier les logs du serveur pour le Service Token

## 📋 Comment vérifier les logs

### Option 1 : Logs en temps réel (recommandé)

Ouvre un terminal PowerShell et lance :

```powershell
docker logs iahome-app -f
```

Puis **clique sur le bouton LibreSpeed** dans le navigateur. Tu devrais voir apparaître dans les logs :

```
🔍 Cloudflare Service Token - Variables d'environnement:
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_ID: 339b5489e670a801bb1b...
   CLOUDFLARE_ACCESS_SERVICE_TOKEN_CLIENT_SECRET: 113a7dbd04c3c048e833...
🔗 librespeed Frame: Proxying vers: https://librespeed.iahome.fr
✅ librespeed: Service Token Cloudflare Access ajouté
   Client ID: 339b5489e670a801bb1b...
   Headers envoyés: [ 'User-Agent', 'Accept', 'CF-Access-Client-Id', 'CF-Access-Client-Secret' ]
```

### Option 2 : Derniers logs

```powershell
docker logs iahome-app --tail 100
```

## ✅ Ce qu'on cherche

1. **Les variables d'environnement sont-elles chargées ?**
   - Si tu vois "NON DÉFINI" → Le serveur n'a pas chargé les variables
   - Si tu vois les valeurs → Les variables sont chargées ✅

2. **Le Service Token est-il envoyé ?**
   - Si tu vois "✅ librespeed: Service Token Cloudflare Access ajouté" → Le Service Token est envoyé ✅
   - Si tu vois "⚠️ librespeed: Service Token Cloudflare Access non disponible" → Le Service Token n'est pas envoyé ❌

3. **Y a-t-il des erreurs ?**
   - Si tu vois des erreurs 403 ou 502 → Problème de configuration Cloudflare ou connexion
   - Si tu vois des erreurs 500 → Problème dans le code

## 🆘 Si les logs ne montrent rien

Si tu ne vois aucun log quand tu cliques sur le bouton, cela peut signifier :

1. **La requête n'arrive pas au serveur** → Vérifie que l'URL est correcte
2. **Les logs ne sont pas encore générés** → Attends quelques secondes et réessaye
3. **Le container ne tourne pas** → Vérifie avec `docker ps --filter "name=iahome-app"`

## 📝 Partage-moi les logs

Quand tu cliques sur le bouton, copie-moi les logs qui apparaissent dans le terminal où tourne `docker logs iahome-app -f`.



