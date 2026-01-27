# Guide : Corriger l'URL OAuth Redirect dans n8n

## Problème

L'URL OAuth Redirect dans les credentials n8n affiche `http://localhost:5678/rest/oauth2-credential/callback` au lieu de `https://n8n.regispailler.fr/rest/oauth2-credential/callback`. Ce champ est grisé et non modifiable directement dans l'interface.

## Solution

n8n génère automatiquement cette URL à partir des variables d'environnement. Il faut donc :

1. **Configurer les bonnes variables d'environnement** (déjà fait ✅)
2. **Redémarrer n8n** pour appliquer les changements
3. **Vérifier dans l'interface** que l'URL est correcte

## Méthode 1 : Script automatique (Recommandé)

Exécutez le script qui fait tout automatiquement :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-n8n-oauth-url-complete.ps1
```

Ce script :
- Vérifie la configuration actuelle
- Met à jour les credentials dans la base de données
- Redémarre le conteneur n8n
- Vérifie que tout est correct

## Méthode 2 : Redémarrage manuel

Si vous préférez faire les étapes manuellement :

### Étape 1 : Redémarrer n8n

```powershell
cd docker-services/essentiels
docker-compose -f n8n-postgres-docker-compose.yml restart n8n
```

Ou directement :

```powershell
docker restart n8n
```

### Étape 2 : Attendre le démarrage complet

Attendez 15-30 secondes que n8n soit complètement démarré.

### Étape 3 : Vérifier dans l'interface

1. Connectez-vous à https://n8n.regispailler.fr
2. Allez dans **Credentials**
3. Ouvrez chaque credential OAuth2 (Gmail, etc.)
4. L'URL OAuth Redirect devrait maintenant afficher :
   ```
   https://n8n.regispailler.fr/rest/oauth2-credential/callback
   ```

## Méthode 3 : Recréer les credentials (Si les autres méthodes ne fonctionnent pas)

Si l'URL est toujours `localhost:5678` après le redémarrage :

1. **Supprimez l'ancien credential OAuth2**
   - Allez dans Credentials
   - Trouvez le credential (ex: Gmail OAuth2)
   - Cliquez sur "Delete"

2. **Créez un nouveau credential**
   - Cliquez sur "Add Credential"
   - Sélectionnez le même type (ex: Gmail OAuth2 API)
   - Remplissez les champs (Client ID, Client Secret, etc.)
   - L'URL OAuth Redirect sera automatiquement générée avec le bon domaine

## Vérification de la configuration

Pour vérifier que les variables d'environnement sont correctes :

```powershell
docker exec n8n env | Select-String -Pattern "N8N_HOST|N8N_PROTOCOL|WEBHOOK_URL"
```

Vous devriez voir :
```
N8N_HOST=n8n.regispailler.fr
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.regispailler.fr
```

## Dépannage

### L'URL est toujours localhost:5678 après redémarrage

1. **Videz le cache du navigateur** : Appuyez sur `Ctrl+F5` pour forcer le rafraîchissement
2. **Attendez 30 secondes** : n8n peut mettre un peu de temps à mettre à jour l'interface
3. **Vérifiez les logs** :
   ```powershell
   docker logs n8n --tail 50
   ```
4. **Vérifiez les variables d'environnement** :
   ```powershell
   docker exec n8n env | findstr "N8N"
   ```

### Les credentials sont chiffrés

Si les credentials sont chiffrés dans la base de données, la mise à jour SQL ne fonctionnera pas. Dans ce cas :
- Utilisez la **Méthode 3** (recréer les credentials)
- Ou utilisez le script API : `scripts/update-n8n-oauth-via-api.ps1`

## Configuration actuelle

Les variables d'environnement sont configurées dans :
- Fichier : `docker-services/essentiels/n8n-postgres-docker-compose.yml`
- Variables :
  - `WEBHOOK_URL: "https://n8n.regispailler.fr"`
  - `N8N_HOST: n8n.regispailler.fr`
  - `N8N_PROTOCOL: https`
  - `N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"`

## Notes importantes

- Le champ OAuth Redirect URL est **automatiquement généré** par n8n, vous ne pouvez pas le modifier directement
- n8n utilise `WEBHOOK_URL` pour générer les URLs OAuth redirect
- Après chaque modification des variables d'environnement, **il faut redémarrer n8n**
- Si vous recréez un credential, l'URL sera automatiquement correcte
