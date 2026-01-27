# Résolution : Erreurs de certificat de licence n8n

## Problème

Les messages `[license SDK] cert is invalid because it has expired` apparaissent dans les logs n8n. Ces erreurs sont **non critiques** et n'empêchent pas n8n de fonctionner.

## Explication

Ces erreurs proviennent du SDK de licence de n8n qui vérifie périodiquement la validité de la licence. C'est un problème connu où les certificats peuvent avoir des dates d'expiration incorrectes.

## Impact

- ✅ **n8n fonctionne normalement** malgré ces erreurs
- ⚠️ **Les logs sont pollués** par ces messages répétitifs
- ℹ️ **Aucun impact fonctionnel** sur les workflows et fonctionnalités

## Solutions

### Solution 1 : Ignorer les erreurs (Recommandé)

Ces erreurs peuvent être ignorées en toute sécurité. Elles n'affectent pas le fonctionnement de n8n.

### Solution 2 : Désactiver le renouvellement automatique de licence

Si vous utilisez la version Community (gratuite), vous pouvez désactiver le renouvellement automatique :

**Sur le NAS**, modifiez le docker-compose.yml :

```yaml
environment:
  # ... autres variables ...
  N8N_LICENSE_AUTO_RENEW_ENABLED: "false"
```

Puis redémarrez :

```bash
cd /volume1/docker/n8n
sudo docker-compose restart n8n
```

### Solution 3 : Filtrer les logs

Pour voir les logs sans ces erreurs :

```bash
# Sur le NAS
sudo docker logs n8n --tail 100 | grep -v "license SDK"
```

### Solution 4 : Configurer un proxy pour le serveur de licence

Si vous avez un proxy, vous pouvez le configurer :

```yaml
environment:
  https_proxy_license_server: "http://proxy:port"
```

## Configuration complète (optionnelle)

Si vous voulez désactiver complètement les vérifications de licence :

```yaml
environment:
  # Désactiver le renouvellement automatique
  N8N_LICENSE_AUTO_RENEW_ENABLED: "false"
  
  # Optionnel : Changer l'URL du serveur de licence
  # N8N_LICENSE_SERVER_URL: "https://license.n8n.io/v1"
```

## Vérification

Après avoir ajouté `N8N_LICENSE_AUTO_RENEW_ENABLED: "false"` :

1. **Redémarrez n8n** :
   ```bash
   sudo docker-compose restart n8n
   ```

2. **Vérifiez les logs** :
   ```bash
   sudo docker logs n8n --tail 50
   ```

Les messages de certificat devraient être moins fréquents ou disparaître.

## Notes importantes

- ✅ **Ces erreurs sont non critiques** : n8n fonctionne normalement
- 🔒 **Version Community** : Ces vérifications de licence ne sont pas nécessaires
- 📝 **Logs** : Ces messages polluent les logs mais n'indiquent pas un problème réel
- 🔄 **Renouvellement** : Si désactivé, vous devrez renouveler manuellement via l'UI tous les 10 jours (si applicable)

## Conclusion

**Vous pouvez ignorer ces erreurs en toute sécurité.** Elles n'affectent pas le fonctionnement de n8n. Si vous voulez réduire le bruit dans les logs, ajoutez `N8N_LICENSE_AUTO_RENEW_ENABLED: "false"` dans votre docker-compose.yml.
